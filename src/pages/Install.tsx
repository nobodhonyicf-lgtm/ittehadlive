import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Monitor, CheckCircle, Share, PlusSquare, MoreVertical } from "lucide-react";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/android/i.test(ua));

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    "রেজাল্ট চেক করুন",
    "শিক্ষার্থী ডিরেক্টরি",
    "নোটিশ ও খবর",
    "বই অর্ডার করুন",
    "শাখা তথ্য",
    "অফলাইনেও কাজ করে",
  ];

  return (
    <Layout>
      <SEOHead title="অ্যাপ ডাউনলোড করুন" description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ অ্যাপ ডাউনলোড করুন" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Smartphone className="text-primary-foreground" size={36} />
          </div>
          <h1 className="text-2xl font-bold mb-2">ইত্তেহাদ অ্যাপ</h1>
          <p className="text-muted-foreground">
            আপনার ফোনে ইনস্টল করুন — অ্যাপ স্টোর ছাড়াই!
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-green-200 bg-green-50/50 mb-6">
            <CardContent className="py-6 text-center">
              <CheckCircle className="mx-auto text-green-600 mb-3" size={40} />
              <h2 className="text-lg font-bold mb-1">অ্যাপ ইতিমধ্যে ইনস্টল আছে!</h2>
              <p className="text-sm text-muted-foreground">আপনি ইতিমধ্যে অ্যাপটি ব্যবহার করছেন।</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 mb-8">
            {/* Direct install button (Chrome/Edge on Android) */}
            {deferredPrompt && (
              <Card className="border-primary/30">
                <CardContent className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Download className="text-primary" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">এখনই ইনস্টল করুন</h3>
                      <p className="text-sm text-muted-foreground">একটি ক্লিকেই আপনার ফোনে ইনস্টল হবে</p>
                    </div>
                    <Button onClick={handleInstall} className="shrink-0">
                      <Download size={16} className="mr-1" /> ইনস্টল
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* iOS instructions */}
            {isIOS && !deferredPrompt && (
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

            {/* Android instructions (fallback if no prompt) */}
            {isAndroid && !deferredPrompt && (
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
            {!isIOS && !isAndroid && !deferredPrompt && (
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
              <Card key={f}>
                <CardContent className="py-3 px-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary shrink-0" />
                  <span className="text-sm">{f}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Install;
