import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LocateFixed, Compass, Smartphone, MapPin } from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { useIsApp } from "@/hooks/useIsApp";

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

function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return from + diff * t;
}

const KaabaIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="16" height="14" rx="1" fill="#1a1a1a" stroke="#d4af37" strokeWidth="1.5" />
    <rect x="9" y="12" width="6" height="8" rx="0.5" fill="#d4af37" />
    <line x1="4" y1="10" x2="20" y2="10" stroke="#d4af37" strokeWidth="1" />
    <path d="M12 2L8 6H16L12 2Z" fill="#1a1a1a" stroke="#d4af37" strokeWidth="1" />
  </svg>
);

const QiblaContent = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const rawHeadingRef = useRef<number | null>(null);
  const smoothHeadingRef = useRef<number>(0);
  const displayHeadingRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const headingTextRef = useRef<HTMLParagraphElement>(null);
  const [headingReady, setHeadingReady] = useState(false);
  const hasAbsoluteRef = useRef(false);

  const headingBufferRef = useRef<number[]>([]);
  const BUFFER_SIZE = 8;

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

  const processHeading = useCallback((heading: number) => {
    const buf = headingBufferRef.current;
    buf.push(heading);
    if (buf.length > BUFFER_SIZE) buf.shift();
    
    let sinSum = 0, cosSum = 0;
    for (const h of buf) {
      sinSum += Math.sin((h * Math.PI) / 180);
      cosSum += Math.cos((h * Math.PI) / 180);
    }
    const avgHeading = ((Math.atan2(sinSum, cosSum) * 180) / Math.PI + 360) % 360;
    rawHeadingRef.current = avgHeading;
    
    if (!headingReady) setHeadingReady(true);
  }, [headingReady]);

  // Handler for absolute orientation (Android preferred)
  const handleAbsoluteOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (!e.absolute && hasAbsoluteRef.current) return;
    if (e.absolute) hasAbsoluteRef.current = true;
    
    if (e.alpha !== null) {
      // For absolute orientation, alpha is degrees from true north
      // Compass heading = (360 - alpha) % 360
      const heading = (360 - e.alpha) % 360;
      processHeading(heading);
    }
  }, [processHeading]);

  // Handler for regular orientation (iOS with webkitCompassHeading)
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    // If we already have absolute orientation, skip regular events
    if (hasAbsoluteRef.current) return;
    
    let heading: number | null = null;
    if ((e as any).webkitCompassHeading !== undefined) {
      // iOS: webkitCompassHeading is compass heading directly (0=North, clockwise)
      heading = (e as any).webkitCompassHeading;
    } else if (e.alpha !== null) {
      // Android fallback: convert alpha to heading
      heading = (360 - e.alpha) % 360;
    }
    
    if (heading !== null) {
      processHeading(heading);
    }
  }, [processHeading]);

  useEffect(() => {
    const setupListeners = async () => {
      // Request permission on iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          const perm = await (DeviceOrientationEvent as any).requestPermission();
          if (perm === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          } else {
            setPermissionDenied(true);
            return;
          }
        } catch {
          setPermissionDenied(true);
          return;
        }
      } else {
        // Try absolute orientation first (more accurate on Android)
        window.addEventListener("deviceorientationabsolute", handleAbsoluteOrientation as any, true);
        // Also listen to regular orientation as fallback
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    };

    setupListeners();
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleAbsoluteOrientation as any, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [handleOrientation, handleAbsoluteOrientation]);

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      if (rawHeadingRef.current !== null) {
        const target = rawHeadingRef.current;
        const current = smoothHeadingRef.current;
        const smoothed = lerpAngle(current, target, 0.08);
        smoothHeadingRef.current = ((smoothed % 360) + 360) % 360;
        displayHeadingRef.current = smoothHeadingRef.current;

        if (svgRef.current) {
          svgRef.current.style.transform = `rotate(${-smoothHeadingRef.current}deg)`;
        }
        if (headingTextRef.current) {
          headingTextRef.current.textContent = `${Math.round(smoothHeadingRef.current)}°`;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const requestOrientationPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm === "granted") {
          setPermissionDenied(false);
          window.addEventListener("deviceorientation", handleOrientation, true);
        }
      } catch { /* ignore */ }
    }
  };

  const qiblaAngle = position ? calculateQiblaDirection(position.lat, position.lng) : 0;
  const SIZE = 280;
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 2 - 20;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <p className="text-muted-foreground">লোকেশন খোঁজা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
        <Compass className="text-primary" /> কিবলা কম্পাস
      </h1>
      <p className="text-sm text-muted-foreground mb-6">কাবা শরীফের দিক নির্ণয় করুন</p>

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
          {/* Direction instruction */}
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
              📱 ফোনটি সমতলে রেখে সবুজ তীরের দিকে মুখ করুন
            </p>
          </div>

          <div className="relative mx-auto mb-8" style={{ width: SIZE, height: SIZE }}>
            {/* Fixed phone direction indicator at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-primary" />
            </div>
            
            <svg
              ref={svgRef}
              width={SIZE}
              height={SIZE}
              style={{ willChange: "transform" }}
            >
              {/* Outer ring */}
              <circle cx={CENTER} cy={CENTER} r={RADIUS + 10} fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
              <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />

              {/* Degree marks */}
              {Array.from({ length: 72 }).map((_, i) => {
                const angle = (i * 5 * Math.PI) / 180;
                const isMajor = i % 6 === 0;
                const isMinor = i % 2 === 0;
                const len = isMajor ? 14 : isMinor ? 8 : 4;
                const r1 = RADIUS + 8;
                const r2 = r1 - len;
                return (
                  <line
                    key={i}
                    x1={CENTER + r1 * Math.sin(angle)}
                    y1={CENTER - r1 * Math.cos(angle)}
                    x2={CENTER + r2 * Math.sin(angle)}
                    y2={CENTER - r2 * Math.cos(angle)}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={isMajor ? 2 : 1}
                    opacity={isMajor ? 0.6 : 0.25}
                  />
                );
              })}

              {/* Cardinal directions */}
              {[
                { label: "N", angle: 0, color: "hsl(var(--destructive))" },
                { label: "E", angle: 90, color: "hsl(var(--muted-foreground))" },
                { label: "S", angle: 180, color: "hsl(var(--muted-foreground))" },
                { label: "W", angle: 270, color: "hsl(var(--muted-foreground))" },
              ].map(({ label, angle, color }) => {
                const rad = (angle * Math.PI) / 180;
                const r = RADIUS - 14;
                return (
                  <text
                    key={label}
                    x={CENTER + r * Math.sin(rad)}
                    y={CENTER - r * Math.cos(rad) + 5}
                    textAnchor="middle"
                    fill={color}
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                );
              })}

              {/* Qibla needle */}
              <g transform={`rotate(${qiblaAngle}, ${CENTER}, ${CENTER})`}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={CENTER}
                  y2={CENTER - RADIUS + 30}
                  stroke="#16a34a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <polygon
                  points={`${CENTER},${CENTER - RADIUS + 18} ${CENTER - 8},${CENTER - RADIUS + 36} ${CENTER + 8},${CENTER - RADIUS + 36}`}
                  fill="#16a34a"
                />
                <foreignObject x={CENTER - 14} y={CENTER - RADIUS - 2} width="28" height="28">
                  <KaabaIcon />
                </foreignObject>
              </g>

              {/* Tail */}
              <g transform={`rotate(${qiblaAngle}, ${CENTER}, ${CENTER})`}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={CENTER}
                  y2={CENTER + RADIUS - 40}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </g>
            </svg>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-primary shadow-lg border-2 border-background" />
            </div>
          </div>

          <Card className="mb-4">
            <CardContent className="py-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">কিবলা দিক</p>
                <p className="text-xl font-bold text-primary">{qiblaAngle.toFixed(1)}°</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">কম্পাস হেডিং</p>
                <p ref={headingTextRef} className="text-xl font-bold">{headingReady ? "0°" : "—"}</p>
              </div>
            </CardContent>
          </Card>

          {!headingReady && (
            <p className="text-xs text-muted-foreground bg-amber-500/10 text-amber-700 rounded-lg p-3 flex items-center gap-2">
              <Smartphone size={14} className="shrink-0" /> সেরা ফলাফলের জন্য মোবাইল ফোন ব্যবহার করুন। কম্পাস ক্যালিব্রেট করতে ফোনটি ৮-আকৃতিতে ঘোরান।
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
            <MapPin size={12} /> অবস্থান: {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
          </p>
        </>
      )}
    </div>
  );
};

const QiblaCompass = () => {
  const isApp = useIsApp();
  return isApp ? (
    <AppLayout><SEOHead title="কিবলা কম্পাস" /><QiblaContent /></AppLayout>
  ) : (
    <Layout><SEOHead title="কিবলা কম্পাস" /><QiblaContent /></Layout>
  );
};

export default QiblaCompass;
