import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Progress } from "@/components/ui/progress";
import {
  Download, Smartphone, Monitor, CheckCircle, Share, PlusSquare,
  MoreVertical, Zap, BookOpen, Users, Bell, ShoppingBag, MapPin, WifiOff,
  Loader2, ExternalLink,
} from "lucide-react";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || sessionStorage.getItem("ittehad_app_mode") === "1") {
      window.location.replace("/");
      return;
    }
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/android/i.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDownloading(false);
      setProgress(100);
      // Redirect to app after short delay
      setTimeout(() => window.location.replace("/"), 1500);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Start download animation
    setDownloading(true);
    setProgress(0);
    
    // Simulate progress while PWA resources cache
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 90) { p = 90; clearInterval(intervalRef.current); }
      setProgress(Math.min(p, 90));
    }, 200);

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    clearInterval(intervalRef.current);
    
    if (outcome === "accepted") {
      setProgress(100);
      setIsInstalled(true);
      setTimeout(() => window.location.replace("/"), 1500);
    } else {
      setDownloading(false);
      setProgress(0);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Zap, label: "রেজাল্ট চেক করুন", color: "text-blue-500" },
    { icon: Users, label: "শিক্ষার্থী ডিরেক্টরি", color: "text-emerald-500" },
    { icon: Bell, label: "নোটিশ ও পুশ নোটিফিকেশন", color: "text-red-500" },
    { icon: ShoppingBag, label: "বই অর্ডার করুন", color: "text-purple-500" },
    { icon: MapPin, label: "শাখা তথ্য ও লোকেশন", color: "text-orange-500" },
    { icon: WifiOff, label: "অফলাইনেও কাজ করে", color: "text-cyan-500" },
    { icon: BookOpen, label: "কুরআন, হাদিস ও দোয়া", color: "text-emerald-700" },
    { icon: Smartphone, label: "নেটিভ অ্যাপের মতো অভিজ্ঞতা", color: "text-primary" },
  ];

  return (
    <Layout>
      <SEOHead title="অ্যাপ ডাউনলোড করুন" description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ অ্যাপ ডাউনলোড করুন — অ্যাপ স্টোর ছাড়াই!" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: "অ্যাপ ইনস্টল" }]} />
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Smartphone className="text-primary-foreground" size={36} />
          </div>
          <h1 className="text-2xl font-bold mb-2">ইত্তেহাদ অ্যাপ</h1>
          <p className="text-muted-foreground">আপনার ফোনে ইনস্টল করুন — অ্যাপ স্টোর ছাড়াই!</p>
          <p className="text-xs text-muted-foreground mt-1">ওয়েবসাইটটিকে একটি পূর্ণাঙ্গ অ্যাপ হিসেবে ব্যবহার করুন</p>
        </div>

        {isInstalled ? (
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 mb-6">
            <CardContent className="py-6 text-center">
              <CheckCircle className="mx-auto text-green-600 mb-3" size={40} />
              <h2 className="text-lg font-bold mb-1">ইনস্টল সম্পন্ন!</h2>
              <p className="text-sm text-muted-foreground">অ্যাপে নিয়ে যাওয়া হচ্ছে...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 mb-8">
            {/* Download progress */}
            {downloading && (
              <Card className="border-primary/30 shadow-lg overflow-hidden">
                <CardContent className="py-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 size={20} className="text-primary animate-spin" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">
                        {progress >= 100 ? "ইনস্টল সম্পন্ন হচ্ছে..." : "ডাউনলোড হচ্ছে..."}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {progress >= 100 ? "অ্যাপে নিয়ে যাওয়া হবে" : `${Math.round(progress)}% সম্পন্ন`}
                      </p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                </CardContent>
              </Card>
            )}

            {/* Direct install button */}
            {deferredPrompt && !downloading && (
              <Card className="border-primary/30 shadow-lg">
                <CardContent className="py-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center">
                    <Download className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">অ্যাপ ডাউনলোড করুন</h3>
                    <p className="text-sm text-muted-foreground">মাত্র ~২ MB • ১ ক্লিকেই ইনস্টল</p>
                  </div>
                  <Button onClick={handleInstall} size="lg" className="w-full text-base gap-2 shadow-md h-12">
                    <Download size={18} /> এখনই ডাউনলোড করুন
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Install button */}
            {deferredPrompt && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleInstall}
                disabled={downloading}
              >
                <Download size={14} /> ডাউনলোড করুন
              </Button>
            )}

            {/* iOS instructions */}
            {isIOS && !deferredPrompt && !downloading && (
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Smartphone size={18} /> iPhone/iPad এ ইনস্টল করুন
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shrink-0">১</span>
                      <span>Safari ব্রাউজারে এই পেজটি খুলুন</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shrink-0">২</span>
                      <span className="flex items-center gap-1">নিচের <Share size={14} className="inline" /> (Share) বাটনে ট্যাপ করুন</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shrink-0">৩</span>
                      <span className="flex items-center gap-1"><PlusSquare size={14} className="inline" /> "Add to Home Screen" সিলেক্ট করুন</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Android instructions */}
            {isAndroid && !deferredPrompt && !downloading && (
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Smartphone size={18} /> Android এ ইনস্টল করুন
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shrink-0">১</span>
                      <span>Chrome ব্রাউজারে এই পেজটি খুলুন</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shrink-0">২</span>
                      <span className="flex items-center gap-1">উপরের <MoreVertical size={14} className="inline" /> মেনুতে ট্যাপ করুন</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs shrink-0">৩</span>
                      <span>"Install app" বা "Add to Home screen" সিলেক্ট করুন</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Desktop */}
            {!isIOS && !isAndroid && !deferredPrompt && !downloading && (
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Monitor size={18} /> কম্পিউটারে ইনস্টল করুন
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Chrome বা Edge ব্রাউজারের অ্যাড্রেস বারে ইনস্টল আইকনে ক্লিক করুন, অথবা মোবাইল ফোনে এই পেজটি ভিজিট করুন।
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-center">অ্যাপে যা যা পাবেন</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <Card key={f.label}>
                <CardContent className="py-3 px-4 flex items-center gap-2.5">
                  <f.icon size={18} className={`${f.color} shrink-0`} />
                  <span className="text-sm">{f.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center space-y-1">
          <p className="text-xs text-muted-foreground">ভার্সন ২.০ • আকার ~২ MB</p>
          <p className="text-xs text-muted-foreground">সর্বশেষ আপডেট: মার্চ ২০২৬</p>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            এটি একটি Progressive Web App (PWA)। কোনো অ্যাপ স্টোর থেকে ডাউনলোড প্রয়োজন নেই।
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Install;
