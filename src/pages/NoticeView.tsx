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

const ARABIC_TEXT = "اِتِّحَادُ الْمَدَارِسِ الْخُصُوصِيَّة";

const NoticeView = () => {
  const isApp = useIsApp();
  const { id } = useParams<{ id: string }>();
  const padRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dlOpen, setDlOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: settings } = useSiteSettings();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [sigLoaded, setSigLoaded] = useState(false);
  const [padScale, setPadScale] = useState(1);

  // Responsive scaling for mobile / app
  useEffect(() => {
    const updateScale = () => {
      if (wrapRef.current) {
        const containerWidth = wrapRef.current.parentElement?.clientWidth || window.innerWidth;
        const padding = 16;
        const available = containerWidth - padding;
        let scale = Math.min(1, available / PAD_W);
        // In app mode, shrink further so full pad is visible in viewport
        if (isApp) {
          const viewportH = window.innerHeight - 140; // account for header + bottom nav + buttons
          const scaleByHeight = viewportH / PAD_H;
          scale = Math.min(scale, scaleByHeight, 0.38);
        }
        setPadScale(scale);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isApp]);

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const orgPhone = settings?.contact_phone || "০১৯২৬-৪২৮৯৮৮";
  const orgAddress = settings?.contact_address || "মারকাযুস সুন্নাহ ক্যাডেট মাদরাসা, ওয়াবদারপুল তালতলা বাজার, ফতুল্লা, নারায়ণগঞ্জ";
  const logoUrl = settings?.logo_url || settings?.app_logo_url || "";
  const signatureUrl = settings?.signature_president || "";

  const proxyUrl = (url: string) => {
    if (!url) return "";
    const isExternal = url.startsWith("http") && !url.includes(window.location.hostname);
    return isExternal
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-image?url=${encodeURIComponent(url)}`
      : url;
  };

  const proxiedLogo = proxyUrl(logoUrl);
  const proxiedSignature = proxyUrl(signatureUrl);

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

  const captureCanvas = async () => {
    if (!padRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const el = padRef.current;

    // Temporarily reset transform on parent for accurate capture
    const scaledParent = el.parentElement;
    let origTransform = "";
    let origHeight = "";
    if (scaledParent) {
      origTransform = scaledParent.style.transform;
      origHeight = scaledParent.style.height;
      scaledParent.style.transform = "none";
      scaledParent.style.height = `${PAD_H}px`;
    }

    // Preload Arabic font
    try {
      await document.fonts.load("700 22px 'Scheherazade New'");
      await document.fonts.ready;
    } catch {}

    const canvas = await html2canvas(el, {
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
      onclone: (doc) => {
        const cloned = doc.querySelector("[data-pad]") as HTMLElement;
        if (cloned) {
          cloned.style.width = `${PAD_W}px`;
          cloned.style.minWidth = `${PAD_W}px`;
          cloned.style.maxWidth = `${PAD_W}px`;
          cloned.style.height = `${PAD_H}px`;
          cloned.style.overflow = "hidden";
          cloned.style.transform = "none";
        }
        // Reduce header spacing in export
        const headerWrap = cloned?.querySelector("[data-header]") as HTMLElement;
        if (headerWrap) {
          headerWrap.style.padding = "2px 40px 4px";
        }
        const bismillah = cloned?.querySelector("[data-bismillah]") as HTMLElement;
        if (bismillah) {
          bismillah.style.paddingTop = "8px";
          bismillah.style.paddingBottom = "2px";
        }
        // Replace Arabic text with SVG for proper ligature rendering
        const arabicEls = doc.querySelectorAll("[data-arabic]");
        arabicEls.forEach((ael: any) => {
          const svgNS = "http://www.w3.org/2000/svg";
          const svg = doc.createElementNS(svgNS, "svg");
          svg.setAttribute("width", "700");
          svg.setAttribute("height", "44");
          svg.setAttribute("viewBox", "0 0 700 44");
          svg.style.display = "block";
          svg.style.margin = "0 auto";
          svg.style.width = "auto";
          svg.style.height = "34px";
          const text = doc.createElementNS(svgNS, "text");
          text.setAttribute("x", "350");
          text.setAttribute("y", "32");
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-family", "'Scheherazade New', Amiri, serif");
          text.setAttribute("font-size", "24");
          text.setAttribute("font-weight", "700");
          text.setAttribute("fill", "#1a1a1a");
          text.setAttribute("direction", "rtl");
          text.textContent = ARABIC_TEXT;
          svg.appendChild(text);
          ael.replaceWith(svg);
        });
      }
    });

    // Restore transform
    if (scaledParent) {
      scaledParent.style.transform = origTransform;
      scaledParent.style.height = origHeight;
    }

    return canvas;
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
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
    setDownloading(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) {
        toast.error("ক্যানভাস তৈরি করা যায়নি");
        setDownloading(false);
        return;
      }
      const jspdfModule = await import("jspdf");
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [PAD_W, PAD_H] });
      pdf.addImage(imgData, "PNG", 0, 0, PAD_W, PAD_H);
      pdf.save(`notice-${notice?.title || "pad"}.pdf`);
      toast.success("পিডিএফ ডাউনলোড হয়েছে");
    } catch (e: any) {
      console.error("PDF error:", e);
      toast.error("পিডিএফ ডাউনলোড ব্যর্থ: " + (e?.message || "অজানা ত্রুটি"));
    } finally {
      setDownloading(false);
      setDlOpen(false);
    }
  };

  const noticeId = id || "";
  const shareUrl = noticeId ? `https://ittehad.bd/share/notice/${noticeId}` : (typeof window !== "undefined" ? window.location.href : "");
  const directUrl = typeof window !== "undefined" ? window.location.href : "";
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
      try { await navigator.share({ title: shareTitle, url: shareUrl }); } catch {}
    }
    setShareOpen(false);
  };

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
                {/* Notice Pad - fixed A4 size, scaled for mobile */}
                <div ref={wrapRef} style={{ overflow: "hidden", maxWidth: "100%", display: "flex", justifyContent: "center" }}>
                  <div style={{
                    transform: `scale(${padScale})`,
                    transformOrigin: "top center",
                    width: `${PAD_W}px`,
                    height: `${Math.ceil(PAD_H * padScale)}px`,
                  }}>
                  <div
                    ref={padRef}
                    data-pad="true"
                    style={{
                      width: `${PAD_W}px`,
                      minWidth: `${PAD_W}px`,
                      height: `${PAD_H}px`,
                      position: "relative",
                      fontFamily: "'SolaimanLipi', 'Noto Sans Bengali', sans-serif",
                      overflow: "hidden",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                      border: "1px solid #e5e5e5",
                    }}
                  >
                    {/* Watermark logo - large, centered lower */}
                    {proxiedLogo && logoLoaded && (
                      <div style={{
                        position: "absolute",
                        top: "62%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 0.06,
                        pointerEvents: "none",
                        zIndex: 0,
                      }}>
                        <img
                          src={proxiedLogo}
                          alt=""
                          style={{ width: "700px", height: "auto", objectFit: "contain" }}
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}

                    {/* Top green border */}
                    <div style={{ height: "4px", background: "linear-gradient(90deg, #0a5c2e, #1a9e52, #0a5c2e)", position: "relative", zIndex: 1 }} />
                    <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c5a55a, transparent)", position: "relative", zIndex: 1 }} />

                    {/* Bismillah in Bengali */}
                    <div data-bismillah="true" style={{ textAlign: "center", paddingTop: "14px", paddingBottom: "4px", position: "relative", zIndex: 1 }}>
                      <p style={{ fontSize: "14px", color: "#555", letterSpacing: "1px", margin: 0 }}>
                        বিসমিল্লাহির রাহমানির রাহীম
                      </p>
                    </div>

                    {/* Header: centered logo + text */}
                    <div data-header="true" style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "2px 40px 6px",
                      position: "relative",
                      zIndex: 1,
                    }}>
                      {/* Logo */}
                      {proxiedLogo && logoLoaded && (
                        <div style={{ marginBottom: "6px" }}>
                          <img
                            src={proxiedLogo}
                            alt="লোগো"
                            style={{ width: "70px", height: "auto", objectFit: "contain" }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}

                      {/* Arabic name */}
                      <p data-arabic="true" style={{
                        fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        lineHeight: "1.1",
                        direction: "rtl",
                        letterSpacing: "1px",
                        margin: "0",
                        textAlign: "center",
                      }}>
                        اِتِّحَادُ الْمَدَارِسِ الْخُصُوصِيَّة
                      </p>

                      {/* Bengali name */}
                      <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#111", margin: "0", lineHeight: "1.3", textAlign: "center" }}>
                        ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ
                      </h1>
                      <p style={{ fontSize: "11px", color: "#666", marginTop: "2px", textAlign: "center" }}>
                        (প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন)
                      </p>
                    </div>

                    {/* Green divider line - full width */}
                    <div style={{ height: "2px", background: "linear-gradient(90deg, #0d7a3e, #1a9e52, #0d7a3e)", margin: "4px 0 8px", position: "relative", zIndex: 1 }} />

                    {/* সূত্র ও তারিখ */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#444", padding: "0 48px 4px", position: "relative", zIndex: 1 }}>
                      <span>সূত্র: {noticeSource}</span>
                      <div style={{ textAlign: "right" }}>
                        <span>তারিখ: {formatDate(notice.created_at)}</span>
                        <br />
                        <span style={{ fontSize: "11px", color: "#666" }}>{toHijriBengali(new Date(notice.created_at))}</span>
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
                    <div style={{ position: "absolute", bottom: "70px", right: "48px", zIndex: 1, textAlign: "center" }}>
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
                      zIndex: 1,
                    }}>
                      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c5a55a, transparent)" }} />
                      <div style={{
                        background: "linear-gradient(90deg, #0a5c2e, #0d7a3e, #1a9e52, #0d7a3e, #0a5c2e)",
                        padding: "8px 24px",
                      }}>
                        <div style={{ textAlign: "center", color: "#ffffff", fontSize: "11px", lineHeight: "1.8", margin: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle" }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span style={{ verticalAlign: "middle" }}>{orgAddress}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "1px" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle" }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span style={{ verticalAlign: "middle" }}>{orgPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                   </div>
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

                {/* Share dialog */}
                <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                  <DialogContent className="max-w-xs">
                    <DialogHeader><DialogTitle>শেয়ার করুন</DialogTitle></DialogHeader>
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

                {/* Download dialog */}
                <Dialog open={dlOpen} onOpenChange={setDlOpen}>
                  <DialogContent className="max-w-xs">
                    <DialogHeader><DialogTitle>ডাউনলোড ফরম্যাট</DialogTitle></DialogHeader>
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
