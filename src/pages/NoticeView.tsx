import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/home/Sidebar";
import { Download, Share2, FileImage, FileText, Copy, Facebook, MessageCircle } from "lucide-react";
import { useIsApp } from "@/hooks/useIsApp";
import { useSiteSettings } from "@/hooks/useData";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toBengali } from "@/lib/bengali";
import { toHijriBengali } from "@/lib/hijri";
import { toast } from "@/components/ui/sonner";

const PAD_W = 794;
const PAD_H = 1123;

const NoticeView = () => {
  const isApp = useIsApp();
  const { id } = useParams<{ id: string }>();
  const padRef = useRef<HTMLDivElement>(null);
  const [dlOpen, setDlOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: settings } = useSiteSettings();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [sigLoaded, setSigLoaded] = useState(false);

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Use website settings for address and phone
  const orgPhone = settings?.contact_phone || "০১৯২৬-৪২৮৯৮৮";
  const orgAddress = settings?.contact_address || "মারকাযুস সুন্নাহ ক্যাডেট মাদরাসা, ওয়াবদারপুল তালতলা বাজার, ফতুল্লা, নারায়ণগঞ্জ";
  const logoUrl = settings?.logo_url || settings?.app_logo_url || "";
  const signatureUrl = settings?.signature_president || "";

  // Proxy external images for CORS-safe export
  const proxyUrl = (url: string) => {
    if (!url) return "";
    const isExternal = url.startsWith("http") && !url.includes(window.location.hostname);
    return isExternal
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-image?url=${encodeURIComponent(url)}`
      : url;
  };

  const proxiedLogo = proxyUrl(logoUrl);
  const proxiedSignature = proxyUrl(signatureUrl);

  // Preload images to prevent flickering
  useEffect(() => {
    if (proxiedLogo) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setLogoLoaded(true);
      img.onerror = () => setLogoLoaded(true);
      img.src = proxiedLogo;
    } else {
      setLogoLoaded(true);
    }
  }, [proxiedLogo]);

  useEffect(() => {
    if (proxiedSignature) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setSigLoaded(true);
      img.onerror = () => setSigLoaded(true);
      img.src = proxiedSignature;
    } else {
      setSigLoaded(true);
    }
  }, [proxiedSignature]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = toBengali(d.getDate());
    const months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
    const month = months[d.getMonth()];
    const year = toBengali(d.getFullYear());
    return `${day} ${month}, ${year}`;
  };

  const handleDownloadImage = async () => {
    if (!padRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(padRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: PAD_W,
        height: PAD_H,
        windowWidth: PAD_W,
        windowHeight: PAD_H,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });
      const link = document.createElement("a");
      link.download = `notice-${notice?.title || "pad"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("ইমেজ ডাউনলোড হয়েছে");
    } catch (e) {
      console.error("Download error:", e);
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
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: PAD_W,
        height: PAD_H,
        windowWidth: PAD_W,
        windowHeight: PAD_H,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [PAD_W, PAD_H] });
      pdf.addImage(imgData, "PNG", 0, 0, PAD_W, PAD_H);
      pdf.save(`notice-${notice?.title || "pad"}.pdf`);
      toast.success("পিডিএফ ডাউনলোড হয়েছে");
    } catch (e) {
      console.error("PDF error:", e);
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

  // SVG mandala corner pattern with gradient
  const mandalaCorner = (rotate: string) => (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", opacity: 0.08, transform: rotate, pointerEvents: "none" }}>
      <defs>
        <linearGradient id="mgrd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a5c2e" />
          <stop offset="50%" stopColor="#0d7a3e" />
          <stop offset="100%" stopColor="#1a9e52" />
        </linearGradient>
      </defs>
      <circle cx="0" cy="0" r="130" fill="none" stroke="url(#mgrd)" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="110" fill="none" stroke="url(#mgrd)" strokeWidth="1.2" />
      <circle cx="0" cy="0" r="90" fill="none" stroke="url(#mgrd)" strokeWidth="1" />
      <circle cx="0" cy="0" r="70" fill="none" stroke="url(#mgrd)" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="50" fill="none" stroke="url(#mgrd)" strokeWidth="0.6" />
      {[0, 12, 24, 36, 48, 60, 72, 84].map((a) => (
        <line key={a} x1="0" y1="0" x2={Math.cos((a * Math.PI) / 180) * 130} y2={Math.sin((a * Math.PI) / 180) * 130} stroke="url(#mgrd)" strokeWidth="0.5" />
      ))}
    </svg>
  );

  const noticeSource = (notice as any)?.source || "";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid grid-cols-1 ${isApp ? "" : "lg:grid-cols-3"} gap-6`}>
          <div className={isApp ? "" : "lg:col-span-2"}>
            {isLoading ? (
              <div className="animate-pulse bg-muted h-96 rounded" />
            ) : notice ? (
              <>
                {/* The Notice Pad - fixed A4 size */}
                <div
                  ref={padRef}
                  style={{
                    width: `${PAD_W}px`,
                    height: `${PAD_H}px`,
                    maxWidth: "100%",
                    position: "relative",
                    fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                    margin: "0 auto",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* Mandala corners */}
                  <div style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}>{mandalaCorner("rotate(0deg)")}</div>
                  <div style={{ position: "absolute", top: 0, right: 0, zIndex: 0 }}>{mandalaCorner("scaleX(-1)")}</div>
                  <div style={{ position: "absolute", bottom: 40, left: 0, zIndex: 0 }}>{mandalaCorner("scaleY(-1)")}</div>
                  <div style={{ position: "absolute", bottom: 40, right: 0, zIndex: 0 }}>{mandalaCorner("scale(-1,-1)")}</div>

                  {/* Watermark logo */}
                  {proxiedLogo && logoLoaded && (
                    <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.05, pointerEvents: "none", zIndex: 0 }}>
                      <img src={proxiedLogo} alt="" style={{ width: "380px", height: "380px", objectFit: "contain" }} crossOrigin="anonymous" />
                    </div>
                  )}

                  {/* Top green bar */}
                  <div style={{ height: "6px", background: "linear-gradient(90deg, #0a5c2e, #0d7a3e, #1a9e52, #0d7a3e, #0a5c2e)", position: "relative", zIndex: 1 }} />

                  {/* Bismillah - using Scheherazade New for calligraphic look */}
                  <div style={{ textAlign: "center", paddingTop: "12px", paddingBottom: "2px", position: "relative", zIndex: 1 }}>
                    <p style={{
                      fontFamily: "'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif",
                      fontSize: "18px",
                      color: "#444",
                      letterSpacing: "2px",
                      direction: "rtl",
                    }}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>

                  {/* Header */}
                  <div style={{ textAlign: "center", padding: "0 32px 8px", position: "relative", zIndex: 1 }}>
                    {/* Logo */}
                    {proxiedLogo && logoLoaded && (
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
                        <img src={proxiedLogo} alt="লোগো" style={{ width: "60px", height: "60px", objectFit: "contain" }} crossOrigin="anonymous" />
                      </div>
                    )}

                    {/* Arabic name - calligraphic */}
                    <p style={{
                      fontFamily: "'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif",
                      fontSize: "26px",
                      color: "#222",
                      lineHeight: "1.8",
                      direction: "rtl",
                      letterSpacing: "1px",
                    }}>
                      اِتِّحَادُ الْمَدَارِسِ الْخُصُوصِيَّة
                    </p>

                    {/* Bengali name */}
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111", margin: "2px 0" }}>
                      ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ
                    </h1>
                    <p style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>(প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন)</p>

                    {/* Divider */}
                    <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #0d7a3e, transparent)", margin: "10px 0 8px" }} />

                    {/* সূত্র ও তারিখ */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#444", padding: "0 8px" }}>
                      <span>সূত্র: {noticeSource}</span>
                      <div style={{ textAlign: "right" }}>
                        <span>তারিখ: {formatDate(notice.created_at)}</span>
                        <br />
                        <span style={{ fontSize: "11px", color: "#666" }}>{toHijriBengali(new Date(notice.created_at))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ textAlign: "center", padding: "20px 48px 14px", position: "relative", zIndex: 1 }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                      {notice.title}
                    </h2>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "0 48px", minHeight: "360px", position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "15px", color: "#333", whiteSpace: "pre-wrap", lineHeight: "2", textAlign: "justify" }}>
                      {notice.content}
                    </div>
                  </div>

                  {/* Signature */}
                  <div style={{ position: "absolute", bottom: "56px", right: "48px", zIndex: 1, textAlign: "center" }}>
                    {proxiedSignature && sigLoaded && (
                      <img
                        src={proxiedSignature}
                        alt="স্বাক্ষর"
                        style={{ height: "50px", objectFit: "contain", margin: "0 auto 4px" }}
                        crossOrigin="anonymous"
                      />
                    )}
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#333", borderTop: "1px solid #999", paddingTop: "4px", paddingLeft: "24px", paddingRight: "24px" }}>সভাপতি</p>
                  </div>

                  {/* Footer */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(90deg, #0a5c2e, #0d7a3e, #1a9e52, #0d7a3e, #0a5c2e)",
                    padding: "8px 24px",
                    zIndex: 1,
                  }}>
                    <p style={{ textAlign: "center", color: "#ffffff", fontSize: "11px", lineHeight: "1.6" }}>
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
