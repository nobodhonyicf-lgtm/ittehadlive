import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, LocateFixed, Landmark, BookOpen, List, AlertCircle, RefreshCw } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createSvgIcon = (color: string, symbol: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="14" r="10" fill="white" opacity="0.3"/>
    <text x="16" y="19" text-anchor="middle" font-size="14" fill="white" font-weight="bold">${symbol}</text>
  </svg>`;
  return new L.DivIcon({ html: svg, iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40], className: "" });
};

const mosqueIcon = createSvgIcon("#16a34a", "🕌");
const madrasaIcon = createSvgIcon("#2563eb", "📖");
const userIcon = createSvgIcon("#dc2626", "●");

type Place = { id: number; lat: number; lon: number; name: string; type: "mosque" | "madrasa"; address?: string };

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const didCenter = useRef(false);
  useEffect(() => {
    if (!didCenter.current) { map.setView([lat, lng], 15); didCenter.current = true; }
  }, [lat, lng, map]);
  return null;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function fetchOverpass(query: string, signal?: AbortSignal): Promise<any> {
  let lastError: Error | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal,
      });
      if (!res.ok) { lastError = new Error(`HTTP ${res.status}`); continue; }
      return await res.json();
    } catch (err: any) {
      lastError = err;
      if (err.name === "AbortError") throw err;
      continue;
    }
  }
  throw lastError || new Error("All endpoints failed");
}

const NearbyMap = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "mosque" | "madrasa">("all");
  const abortRef = useRef<AbortController | null>(null);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    // Auto-abort after 15s
    const timeout = setTimeout(() => controller.abort(), 15000);

    setLoading(true);
    setError("");
    setPlaces([]);

    // Simplified query with shorter timeout
    const query = `[out:json][timeout:15];
(
  nwr["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lng});
  nwr["building"="mosque"](around:3000,${lat},${lng});
  nwr["amenity"="school"]["name"~"মাদ্রাসা|মাদরাসা|madrasa|দারুল|মক্তব|হাফিজিয়া",i](around:3000,${lat},${lng});
);
out center;`;

    try {
      const data = await fetchOverpass(query, controller.signal);
      clearTimeout(timeout);
      const seen = new Set<string>();
      const results: Place[] = [];

      for (const el of data.elements || []) {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) continue;

        const tags = el.tags || {};
        const coordKey = `${elLat.toFixed(4)},${elLon.toFixed(4)}`;
        if (seen.has(coordKey)) continue;
        seen.add(coordKey);

        const nameStr = (tags.name || tags["name:bn"] || "").toLowerCase();
        const isMadrasa = /মাদ্রাসা|মাদরাসা|madrasa|দারুল|মক্তব|maktab|হাফিজিয়া|কওমী|qawmi|ইসলামী/i.test(nameStr);

        results.push({
          id: el.id,
          lat: elLat,
          lon: elLon,
          name: tags.name || tags["name:bn"] || (isMadrasa ? "মাদ্রাসা" : "মসজিদ"),
          type: isMadrasa ? "madrasa" : "mosque",
          address: tags["addr:full"] || tags["addr:street"] || "",
        });
      }

      results.sort((a, b) => parseFloat(getDistanceKm(lat, lng, a.lat, a.lon)) - parseFloat(getDistanceKm(lat, lng, b.lat, b.lon)));
      setPlaces(results);
      if (results.length === 0) {
        setError("এই এলাকায় কোনো মসজিদ বা মাদ্রাসা পাওয়া যায়নি। ৩ কি.মি. এর মধ্যে অনুসন্ধান করা হয়েছে।");
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        setError("অনুসন্ধানে সময় বেশি লাগছে। আবার চেষ্টা করুন।");
      } else {
        console.error("Overpass error:", err);
        setError("তথ্য লোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocation = useCallback(() => {
    setError("");
    setLocating(true);
    if (!navigator.geolocation) {
      setError("আপনার ব্রাউজার লোকেশন সাপোর্ট করে না");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setLocating(false);
        fetchNearby(coords.lat, coords.lng);
      },
      () => {
        setError("লোকেশন অনুমতি দিন। ব্রাউজার সেটিংস থেকে লোকেশন অ্যাক্সেস চালু করুন।");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 }
    );
  }, [fetchNearby]);

  useEffect(() => {
    getLocation();
    return () => abortRef.current?.abort();
  }, [getLocation]);

  const filtered = filter === "all" ? places : places.filter((p) => p.type === filter);
  const mosqueCount = places.filter((p) => p.type === "mosque").length;
  const madrasaCount = places.filter((p) => p.type === "madrasa").length;

  return (
    <Layout>
      <SEOHead title="আশেপাশের মসজিদ ও মাদ্রাসা" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: "আশেপাশের মসজিদ ও মাদ্রাসা" }]} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-primary" size={22} /> আশেপাশের মসজিদ ও মাদ্রাসা
            </h1>
            <p className="text-xs text-muted-foreground mt-1">৩ কি.মি. এর মধ্যে</p>
          </div>
          <Button variant="outline" size="sm" onClick={getLocation} disabled={locating || loading} className="gap-1">
            {locating || loading ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            রিফ্রেশ
          </Button>
        </div>

        {places.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>সব ({places.length})</Button>
            <Button size="sm" variant={filter === "mosque" ? "default" : "outline"} onClick={() => setFilter("mosque")} className="gap-1"><Landmark size={14} /> মসজিদ ({mosqueCount})</Button>
            <Button size="sm" variant={filter === "madrasa" ? "default" : "outline"} onClick={() => setFilter("madrasa")} className="gap-1"><BookOpen size={14} /> মাদ্রাসা ({madrasaCount})</Button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm">{error}</p>
              {!loading && (
                <Button size="sm" variant="outline" className="mt-2 gap-1" onClick={() => position && fetchNearby(position.lat, position.lng)}>
                  <RefreshCw size={12} /> আবার চেষ্টা করুন
                </Button>
              )}
            </div>
          </div>
        )}

        {locating && !position && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-muted-foreground">লোকেশন খোঁজা হচ্ছে...</p>
          </div>
        )}

        {position && (
          <>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Loader2 className="animate-spin" size={14} />
                <span>মসজিদ ও মাদ্রাসা খোঁজা হচ্ছে...</span>
              </div>
            )}
            <div className="rounded-xl overflow-hidden border shadow-lg" style={{ height: "60vh" }}>
              <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap lat={position.lat} lng={position.lng} />
                <Marker position={[position.lat, position.lng]} icon={userIcon}>
                  <Popup><div className="text-sm font-medium">আপনার অবস্থান</div></Popup>
                </Marker>
                {filtered.map((p) => (
                  <Marker key={`${p.id}-${p.lat}`} position={[p.lat, p.lon]} icon={p.type === "mosque" ? mosqueIcon : madrasaIcon}>
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-bold text-base">{p.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: p.type === "mosque" ? "#16a34a" : "#2563eb" }}>
                          {p.type === "mosque" ? "🕌 মসজিদ" : "📖 মাদ্রাসা"}
                        </p>
                        {p.address && <p className="text-xs mt-1 text-gray-600">{p.address}</p>}
                        <p className="text-xs text-gray-400 mt-1">দূরত্ব: {getDistanceKm(position.lat, position.lng, p.lat, p.lon)} কি.মি.</p>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 text-xs underline mt-2">
                          <Navigation size={10} /> দিকনির্দেশনা
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </>
        )}

        {position && filtered.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-1.5"><List size={14} /> তালিকা ({filtered.length})</h3>
            {filtered.map((p) => {
              const dist = getDistanceKm(position.lat, position.lng, p.lat, p.lon);
              return (
                <Card key={`list-${p.id}`} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`, "_blank")}>
                  <CardContent className="flex items-center gap-3 py-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${p.type === "mosque" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {p.type === "mosque" ? <Landmark size={18} /> : <BookOpen size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      {p.address && <p className="text-xs text-muted-foreground truncate">{p.address}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{dist} কি.মি.</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NearbyMap;
