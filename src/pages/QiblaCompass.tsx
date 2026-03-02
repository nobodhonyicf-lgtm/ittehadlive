import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LocateFixed, Compass } from "lucide-react";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateQiblaDirection(lat: number, lng: number): number {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;
  const kaabaLatR = (KAABA_LAT * Math.PI) / 180;
  const kaabaLngR = (KAABA_LNG * Math.PI) / 180;
  const dLng = kaabaLngR - lngR;
  const x = Math.sin(dLng);
  const y = Math.cos(latR) * Math.tan(kaabaLatR) - Math.sin(latR) * Math.cos(dLng);
  let qibla = (Math.atan2(x, y) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

const QiblaCompass = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const compassRef = useRef<HTMLDivElement>(null);

  // Get location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("লোকেশন সাপোর্ট করে না");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError("লোকেশন অনুমতি দিন");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Device orientation for compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // For iOS
      if ((e as any).webkitCompassHeading !== undefined) {
        setHeading((e as any).webkitCompassHeading);
      } else if (e.alpha !== null) {
        // Android - alpha is relative to north
        setHeading(360 - e.alpha);
      }
    };

    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          const perm = await (DeviceOrientationEvent as any).requestPermission();
          if (perm === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          } else {
            setPermissionDenied(true);
          }
        } catch {
          setPermissionDenied(true);
        }
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  const requestOrientationPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm === "granted") {
          setPermissionDenied(false);
          window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
            if ((e as any).webkitCompassHeading !== undefined) {
              setHeading((e as any).webkitCompassHeading);
            } else if (e.alpha !== null) {
              setHeading(360 - e.alpha);
            }
          }, true);
        }
      } catch { /* ignore */ }
    }
  };

  const qiblaAngle = position ? calculateQiblaDirection(position.lat, position.lng) : 0;
  const needleRotation = heading !== null ? qiblaAngle - heading : qiblaAngle;

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <p className="text-muted-foreground">লোকেশন খোঁজা হচ্ছে...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="কিবলা কম্পাস" />
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Compass className="text-primary" /> কিবলা কম্পাস
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          কাবা শরীফের দিক নির্ণয় করুন
        </p>

        {error && (
          <Card className="mb-6 border-destructive/30">
            <CardContent className="py-4">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                <LocateFixed size={14} className="mr-1" /> আবার চেষ্টা করুন
              </Button>
            </CardContent>
          </Card>
        )}

        {permissionDenied && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground mb-2">কম্পাস ব্যবহার করতে অনুমতি দিন</p>
              <Button size="sm" onClick={requestOrientationPermission}>অনুমতি দিন</Button>
            </CardContent>
          </Card>
        )}

        {position && (
          <>
            {/* Compass */}
            <div className="relative w-72 h-72 mx-auto mb-8" ref={compassRef}>
              {/* Compass background */}
              <div
                className="w-full h-full rounded-full border-4 border-muted shadow-xl relative transition-transform duration-100"
                style={{ transform: heading !== null ? `rotate(${-heading}deg)` : "none" }}
              >
                {/* Cardinal directions */}
                <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">N</span>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>

                {/* Degree marks */}
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 bg-muted-foreground/30"
                    style={{
                      height: i % 3 === 0 ? "12px" : "6px",
                      top: "0",
                      left: "50%",
                      transformOrigin: "bottom center",
                      transform: `translateX(-50%) rotate(${i * 10}deg) translateY(0px)`,
                    }}
                  />
                ))}

                {/* Qibla needle */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  <div className="flex flex-col items-center -mt-24">
                    <span className="text-2xl">🕋</span>
                    <div className="w-1 h-16 bg-gradient-to-b from-green-500 to-green-700 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg" />
              </div>
            </div>

            {/* Info */}
            <Card className="mb-4">
              <CardContent className="py-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">কিবলা দিক</p>
                  <p className="text-xl font-bold text-primary">{qiblaAngle.toFixed(1)}°</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">কম্পাস হেডিং</p>
                  <p className="text-xl font-bold">{heading !== null ? `${heading.toFixed(0)}°` : "—"}</p>
                </div>
              </CardContent>
            </Card>

            {heading === null && (
              <p className="text-xs text-muted-foreground bg-amber-500/10 text-amber-700 rounded-lg p-3">
                📱 সেরা ফলাফলের জন্য মোবাইল ফোন ব্যবহার করুন। কম্পাস ক্যালিব্রেট করতে ফোনটি ৮-আকৃতিতে ঘোরান।
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              📍 অবস্থান: {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
            </p>
          </>
        )}
      </div>
    </Layout>
  );
};

export default QiblaCompass;
