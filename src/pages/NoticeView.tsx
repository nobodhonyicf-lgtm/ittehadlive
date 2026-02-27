import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/home/Sidebar";
import { Download, Share2, FileImage, FileText, Copy, Facebook, MessageCircle } from "lucide-react";
import { useIsApp } from "@/hooks/useIsApp";
import { useSiteSettings } from "@/hooks/useData";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toBengali } from "@/lib/bengali";
import { toast } from "@/components/ui/sonner";

const NoticeView = () => {
  const isApp = useIsApp();
  const { id } = useParams<{ id: string }>();
  const padRef = useRef<HTMLDivElement>(null);
  const [dlOpen, setDlOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: settings } = useSiteSettings();

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = toBengali(d.getDate());
    const months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
    const month = months[d.getMonth()];
    const year = toBengali(d.getFullYear());
    return `${day} ${month}, ${year}`;
  };

  const PAD_W = 794;
  const PAD_H = 1123;

  const handleDownloadImage = async () => {
    if (!padRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(padRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: PAD_W,
        height: PAD_H,
        windowWidth: PAD_W,
        windowHeight: PAD_H,
      });
      const link = document.createElement("a");
      link.download = `notice-${notice?.title || "pad"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("ইমেজ ডাউনলোড হয়েছে");
    } catch (e) {
      toast.error("ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setDownloading(false);
      setDlOpen(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!padRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(padRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: PAD_W,
        height: PAD_H,
        windowWidth: PAD_W,
        windowHeight: PAD_H,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [PAD_W, PAD_H] });
      pdf.addImage(imgData, "PNG", 0, 0, PAD_W, PAD_H);
      pdf.save(`notice-${notice?.title || "pad"}.pdf`);
      toast.success("পিডিএফ ডাউনলোড হয়েছে");
    } catch (e) {
      toast.error("ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setDownloading(false);
      setDlOpen(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = notice?.title || "নোটিশ";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("লিংক কপি হয়েছে");
    setShareOpen(false);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    setShareOpen(false);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, "_blank");
    setShareOpen(false);
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch {}
    }
    setShareOpen(false);
  };

  const orgPhone = settings?.phone || "০১৯১৯-৯২৯১৯৯";
  const orgAddress = settings?.address || "শাহ সুজা জামে মসজিদ, মোগলটুলী, কুমিল্লা।";
  const logoUrl = settings?.app_logo_url || settings?.logo_url || "";

  // SVG mandala corner pattern
  const mandalaCorner = (rotate: string) => (
    <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", opacity: 0.07, transform: rotate, pointerEvents: "none" }}>
      <defs>
        <linearGradient id="mgrd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d7a3e" />
          <stop offset="100%" stopColor="#1a9e52" />
        </linearGradient>
      </defs>
      <circle cx="0" cy="0" r="110" fill="none" stroke="url(#mgrd)" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="90" fill="none" stroke="url(#mgrd)" strokeWidth="1" />
      <circle cx="0" cy="0" r="70" fill="none" stroke="url(#mgrd)" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="50" fill="none" stroke="url(#mgrd)" strokeWidth="0.5" />
      {[0, 15, 30, 45, 60, 75, 90].map((a) => (
        <line key={a} x1="0" y1="0" x2={Math.cos((a * Math.PI) / 180) * 110} y2={Math.sin((a * Math.PI) / 180) * 110} stroke="url(#mgrd)" strokeWidth="0.5" />
      ))}
    </svg>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid grid-cols-1 ${isApp ? "" : "lg:grid-cols-3"} gap-6`}>
          <div className={isApp ? "" : "lg:col-span-2"}>
            {isLoading ? (
              <div className="animate-pulse bg-muted h-96 rounded" />
            ) : notice ? (
              <>
                {/* The Notice Pad */}
                <div
                  ref={padRef}
                  className="bg-white mx-auto shadow-xl"
                  style={{
                    width: `${PAD_W}px`,
                    maxWidth: "100%",
                    height: `${PAD_H}px`,
                    position: "relative",
                    fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif",
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Mandala corners */}
                  <div style={{ position: "absolute", top: 8, left: 0, zIndex: 0 }}>{mandalaCorner("rotate(0deg)")}</div>
                  <div style={{ position: "absolute", top: 8, right: 0, zIndex: 0 }}>{mandalaCorner("scaleX(-1)")}</div>
                  <div style={{ position: "absolute", bottom: 40, left: 0, zIndex: 0 }}>{mandalaCorner("scaleY(-1)")}</div>
                  <div style={{ position: "absolute", bottom: 40, right: 0, zIndex: 0 }}>{mandalaCorner("scale(-1,-1)")}</div>

                  {/* Watermark logo in center */}
                  {logoUrl && (
                    <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.05, pointerEvents: "none", zIndex: 0 }}>
                      <img src={logoUrl} alt="" style={{ width: "380px", height: "380px", objectFit: "contain" }} crossOrigin="anonymous" />
                    </div>
                  )}

                  {/* Decorative top border */}
                  <div style={{ height: "6px", background: "linear-gradient(90deg, #0a5c2e, #0d7a3e, #1a9e52, #0d7a3e, #0a5c2e)", position: "relative", zIndex: 1 }} />

                  {/* Bismillah */}
                  <div className="flex justify-center pt-4 pb-1" style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontFamily: "'Amiri', 'Scheherazade New', serif", fontSize: "15px", color: "#555", letterSpacing: "2px" }}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>

                  {/* Header with Logo */}
                  <div className="text-center px-8 pb-2" style={{ position: "relative", zIndex: 1 }}>
                    {logoUrl && (
                      <div className="flex justify-center mb-2">
                        <img src={logoUrl} alt="লোগো" style={{ width: "64px", height: "64px", objectFit: "contain" }} crossOrigin="anonymous" />
                      </div>
                    )}
                    <p className="leading-relaxed" dir="rtl" style={{ fontFamily: "'Amiri', 'Scheherazade New', serif", fontSize: "22px", color: "#333", letterSpacing: "1px" }}>
                      اِتِّحَادُ الْمَدَارِسِ الْخُصُوصِيَّة
                    </p>
                    <h1 className="font-bold text-gray-900 mt-1" style={{ fontSize: "24px" }}>
                      ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">(প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন)</p>

                    {/* Divider */}
                    <div className="mt-3 mb-2" style={{ height: "2px", background: "linear-gradient(90deg, transparent, #0d7a3e, transparent)" }} />

                    {/* সূত্র ও তারিখ */}
                    <div className="flex justify-between text-sm text-gray-700 px-2">
                      <span>সূত্র:</span>
                      <span>তারিখ: {formatDate(notice.created_at)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center px-12 pt-6 pb-4" style={{ position: "relative", zIndex: 1 }}>
                    <h2 className="font-bold text-gray-900 underline underline-offset-4" style={{ fontSize: "20px" }}>
                      {notice.title}
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="px-12 pb-32" style={{ minHeight: "400px", position: "relative", zIndex: 1 }}>
                    <div className="text-gray-800 whitespace-pre-wrap leading-8 text-justify" style={{ fontSize: "15px" }}>
                      {notice.content}
                    </div>
                  </div>

                  {/* Signature - positioned absolutely */}
                  <div className="px-12 flex justify-end" style={{ position: "absolute", bottom: "62px", right: 0, zIndex: 1 }}>
                    <div className="text-center">
                      {notice.signature_url && (
                        <img
                          src={notice.signature_url}
                          alt="স্বাক্ষর"
                          className="h-14 mx-auto mb-1"
                          crossOrigin="anonymous"
                          style={{ objectFit: "contain" }}
                        />
                      )}
                      <p className="text-sm font-semibold text-gray-800 border-t border-gray-400 pt-1 px-6">সভাপতি</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(90deg, #0a5c2e, #0d7a3e, #1a9e52, #0d7a3e, #0a5c2e)",
                      padding: "8px 24px",
                      zIndex: 1,
                    }}
                  >
                    <p className="text-center text-white text-xs leading-5">
                      স্থায়ী কার্যালয়: {orgAddress}
                      <br />
                      মোবাইল: {orgPhone}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button variant="outline" className="gap-2" onClick={() => setShareOpen(true)}>
                    <Share2 size={16} /> শেয়ার করুন
                  </Button>
                  <Button className="gap-2" onClick={() => setDlOpen(true)}>
                    <Download size={16} /> ডাউনলোড করুন
                  </Button>
                </div>

                {/* Share popup */}
                <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                  <DialogContent className="max-w-xs">
                    <DialogHeader>
                      <DialogTitle>শেয়ার করুন</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 pt-2">
                      <Button variant="outline" className="gap-2 justify-start h-12" onClick={handleShareFacebook}>
                        <Facebook size={18} className="text-blue-600" /> ফেসবুকে শেয়ার
                      </Button>
                      <Button variant="outline" className="gap-2 justify-start h-12" onClick={handleShareWhatsApp}>
                        <MessageCircle size={18} className="text-green-600" /> হোয়াটসঅ্যাপে শেয়ার
                      </Button>
                      <Button variant="outline" className="gap-2 justify-start h-12" onClick={handleCopyLink}>
                        <Copy size={18} className="text-gray-600" /> লিংক কপি করুন
                      </Button>
                      {typeof navigator !== "undefined" && navigator.share && (
                        <Button variant="outline" className="gap-2 justify-start h-12" onClick={handleShareNative}>
                          <Share2 size={18} className="text-primary" /> আরও অপশন...
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Download popup */}
                <Dialog open={dlOpen} onOpenChange={setDlOpen}>
                  <DialogContent className="max-w-xs">
                    <DialogHeader>
                      <DialogTitle>ডাউনলোড ফরম্যাট</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 pt-2">
                      <Button variant="outline" className="gap-2 justify-start h-12" onClick={handleDownloadImage} disabled={downloading}>
                        <FileImage size={18} className="text-blue-600" /> ইমেজ ডাউনলোড (PNG)
                      </Button>
                      <Button variant="outline" className="gap-2 justify-start h-12" onClick={handleDownloadPdf} disabled={downloading}>
                        <FileText size={18} className="text-red-600" /> পিডিএফ ডাউনলোড (PDF)
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">নোটিশ পাওয়া যায়নি</div>
            )}
          </div>
          {!isApp && (
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NoticeView;
