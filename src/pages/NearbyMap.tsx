import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, LocateFixed } from "lucide-react";
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

const mosqueIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2642/2642442.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const madrasaIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3976/3976631.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

type Place = {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: "mosque" | "madrasa";
  address?: string;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

const NearbyMap = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "mosque" | "madrasa">("all");

  const fetchNearby = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // Overpass API for mosques and madrasas
      const query = `
        [out:json][timeout:10];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lng});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat},${lng});
          node["amenity"="school"]["school:type"="madrasa"](around:3000,${lat},${lng});
          node["amenity"="school"]["name"~"মাদ্রাসা|মাদরাসা|Madrasa|madrasa|দারুল",i](around:3000,${lat},${lng});
          way["amenity"="school"]["name"~"মাদ্রাসা|মাদরাসা|Madrasa|madrasa|দারুল",i](around:3000,${lat},${lng});
        );
        out center body;
      `;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const data = await res.json();
      const results: Place[] = (data.elements || []).map((el: any) => {
        const elLat = el.lat || el.center?.lat;
        const elLon = el.lon || el.center?.lon;
        const tags = el.tags || {};
        const isMadrasa =
          tags["school:type"] === "madrasa" ||
          /মাদ্রাসা|মাদরাসা|madrasa|দারুল/i.test(tags.name || "");
        return {
          id: el.id,
          lat: elLat,
          lon: elLon,
          name: tags.name || (isMadrasa ? "মাদ্রাসা" : "মসজিদ"),
          type: isMadrasa ? "madrasa" : "mosque",
          address: tags["addr:full"] || tags["addr:street"] || "",
        };
      }).filter((p: Place) => p.lat && p.lon);
      setPlaces(results);
    } catch {
      setError("তথ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setError("");
    setLoading(true);
    if (!navigator.geolocation) {
      setError("আপনার ব্রাউজার লোকেশন সাপোর্ট করে না");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        fetchNearby(coords.lat, coords.lng);
      },
      () => {
        setError("লোকেশন অনুমতি দিন");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const filtered = filter === "all" ? places : places.filter((p) => p.type === filter);
  const mosqueCount = places.filter((p) => p.type === "mosque").length;
  const madrasaCount = places.filter((p) => p.type === "madrasa").length;

  return (
    <Layout>
      <SEOHead title="আশেপাশের মসজিদ ও মাদ্রাসা" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-primary" size={22} /> আশেপাশের মসজিদ ও মাদ্রাসা
            </h1>
            <p className="text-xs text-muted-foreground mt-1">৩ কি.মি. এর মধ্যে</p>
          </div>
          <Button variant="outline" size="sm" onClick={getLocation} disabled={loading} className="gap-1">
            <LocateFixed size={14} /> রিফ্রেশ
          </Button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            সব ({places.length})
          </Button>
          <Button size="sm" variant={filter === "mosque" ? "default" : "outline"} onClick={() => setFilter("mosque")}>
            🕌 মসজিদ ({mosqueCount})
          </Button>
          <Button size="sm" variant={filter === "madrasa" ? "default" : "outline"} onClick={() => setFilter("madrasa")}>
            📚 মাদ্রাসা ({madrasaCount})
          </Button>
        </div>

        {error && <p className="text-destructive text-center mb-4">{error}</p>}

        {loading && !position && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-muted-foreground">লোকেশন খোঁজা হচ্ছে...</p>
          </div>
        )}

        {position && (
          <div className="rounded-xl overflow-hidden border shadow-lg" style={{ height: "60vh" }}>
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap lat={position.lat} lng={position.lng} />
              <Marker position={[position.lat, position.lng]} icon={userIcon}>
                <Popup>📍 আপনার অবস্থান</Popup>
              </Marker>
              {filtered.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lon]} icon={p.type === "mosque" ? mosqueIcon : madrasaIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.type === "mosque" ? "🕌 মসজিদ" : "📚 মাদ্রাসা"}</p>
                      {p.address && <p className="text-xs mt-1">{p.address}</p>}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs underline mt-1 block"
                      >
                        <Navigation size={10} className="inline mr-1" />
                        দিকনির্দেশনা
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* List view */}
        {position && filtered.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-sm">📋 তালিকা</h3>
            {filtered.map((p) => {
              const dist = getDistanceKm(position.lat, position.lng, p.lat, p.lon);
              return (
                <Card key={p.id} className="cursor-pointer hover:shadow-sm" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`, "_blank")}>
                  <CardContent className="flex items-center gap-3 py-3">
                    <span className="text-2xl">{p.type === "mosque" ? "🕌" : "📚"}</span>
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

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default NearbyMap;
