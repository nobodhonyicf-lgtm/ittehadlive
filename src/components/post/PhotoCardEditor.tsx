import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Download, Eye, Palette, Type, ImageIcon, Minus, Plus } from "lucide-react";

interface PhotoCardEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    title: string;
    slug: string;
    image_url?: string | null;
    created_at: string;
  };
  editMode?: boolean; // true = admin full editor, false = frontend preview only
}

const COLORS = [
  { label: "ডার্ক", bg: "#1a1a1a", bar: "#2a2a2a", bottom: "#111111", text: "#ffffff", sub: "#cccccc" },
  { label: "সবুজ", bg: "#0d3b1e", bar: "#145a2e", bottom: "#0a2e17", text: "#ffffff", sub: "#b8e6c8" },
  { label: "নীল", bg: "#0f1f3d", bar: "#172d54", bottom: "#0a1628", text: "#ffffff", sub: "#a8c4e0" },
  { label: "মেরুন", bg: "#3b0f0f", bar: "#551a1a", bottom: "#280a0a", text: "#ffffff", sub: "#e0b8b8" },
  { label: "সোনালি", bg: "#2e2207", bar: "#3d2e0a", bottom: "#1f1805", text: "#ffffff", sub: "#e8d5a0" },
  { label: "বেগুনি", bg: "#1e0a3b", bar: "#2d1455", bottom: "#140728", text: "#ffffff", sub: "#c8a8e0" },
  { label: "টিল", bg: "#0a2e2e", bar: "#0f4040", bottom: "#071f1f", text: "#ffffff", sub: "#a8dede" },
  { label: "ধূসর", bg: "#2c2c2c", bar: "#3a3a3a", bottom: "#1e1e1e", text: "#ffffff", sub: "#d0d0d0" },
];

const RESOLUTIONS = [
  { label: "1080×1080", w: 1080, h: 1080 },
  { label: "1080×1350", w: 1080, h: 1350 },
  { label: "1200×630", w: 1200, h: 630 },
  { label: "1920×1080", w: 1920, h: 1080 },
];

const drawStripeTexture = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.12;
  for (let i = -h; i < w + h; i += 8) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i - h, y + h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
};

const wrapTextCentered = (
  ctx: CanvasRenderingContext2D, text: string, x: number, maxWidth: number,
  startY: number, lineHeight: number, font: string
): number => {
  ctx.font = font;
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  }
  if (line.trim()) lines.push(line.trim());
  let y = startY;
  for (const l of lines) {
    const w = ctx.measureText(l).width;
    ctx.fillText(l, x + (maxWidth - w) / 2, y);
    y += lineHeight;
  }
  return y;
};

const PhotoCardEditor = ({ open, onOpenChange, post, editMode = true }: PhotoCardEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState(post.title);
  const [colorIdx, setColorIdx] = useState(0);
  const [fontSize, setFontSize] = useState(56);
  const [lineSpacing, setLineSpacing] = useState(72);
  const [websiteText, setWebsiteText] = useState("ittehad.bd");
  const [badgeText, setBadgeText] = useState("ইত্তেহাদ");
  const [socialHandles, setSocialHandles] = useState(["ittehadbd", "ittehadbd", "ittehadbd"]);
  const [bottomRight, setBottomRight] = useState("বিস্তারিত কমেন্টে");
  const [logoUrl, setLogoUrl] = useState("");
  const [resIdx, setResIdx] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      renderCard();
    }
  }, [open]);

  const renderCard = useCallback(async () => {
    const { w: WIDTH, h: HEIGHT } = RESOLUTIONS[resIdx];
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c = COLORS[colorIdx];
    const PAD = Math.round(WIDTH * 0.028);
    const scale = WIDTH / 1080; // scale factor relative to base 1080

    // ── Background ──
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawStripeTexture(ctx, 0, 0, WIDTH, HEIGHT, "#ffffff");

    // ── Image area ──
    const imgAreaTop = PAD;
    const imgAreaH = Math.round(HEIGHT * 0.5);
    const imgAreaW = WIDTH - PAD * 2;

    if (post.image_url) {
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = post.image_url!;
        });
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(PAD, imgAreaTop, imgAreaW, imgAreaH, 12 * scale);
        ctx.clip();
        const imgScale = Math.max(imgAreaW / img.width, imgAreaH / img.height);
        const sw = imgAreaW / imgScale;
        const sh = imgAreaH / imgScale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, PAD, imgAreaTop, imgAreaW, imgAreaH);
        ctx.restore();
      } catch {
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.roundRect(PAD, imgAreaTop, imgAreaW, imgAreaH, 12 * scale);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.roundRect(PAD, imgAreaTop, imgAreaW, imgAreaH, 12 * scale);
      ctx.fill();
    }

    // ── Info bar ──
    const barY = imgAreaTop + imgAreaH + Math.round(16 * scale);
    const barH = Math.round(52 * scale);
    ctx.fillStyle = c.bar;
    ctx.fillRect(PAD, barY, imgAreaW, barH);
    drawStripeTexture(ctx, PAD, barY, imgAreaW, barH, "#ffffff");

    let barContentX = PAD + Math.round(14 * scale);

    // Logo (if provided)
    if (logoUrl) {
      try {
        const logoImg = new window.Image();
        logoImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => reject();
          logoImg.src = logoUrl;
        });
        const logoH = barH - Math.round(12 * scale);
        const logoW = (logoImg.width / logoImg.height) * logoH;
        const logoY = barY + (barH - logoH) / 2;
        ctx.drawImage(logoImg, barContentX, logoY, logoW, logoH);
        barContentX += logoW + Math.round(14 * scale);
      } catch { /* skip logo on error */ }
    }

    // Green badge
    const badgeFontSize = Math.round(22 * scale);
    ctx.font = `bold ${badgeFontSize}px 'SolaimanLipi', sans-serif`;
    const badgeW = ctx.measureText(badgeText).width + Math.round(32 * scale);
    const badgeHt = Math.round(34 * scale);
    const badgeY = barY + (barH - badgeHt) / 2;
    ctx.fillStyle = "#1a7a3a";
    ctx.beginPath();
    ctx.roundRect(barContentX, badgeY, badgeW, badgeHt, 6 * scale);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(badgeText, barContentX + Math.round(16 * scale), badgeY + Math.round(25 * scale));

    // Verified blue circle — kept distant from badge
    const verGap = Math.round(18 * scale);
    const verX = barContentX + badgeW + verGap;
    const verY = barY + barH / 2;
    const verR = Math.round(13 * scale);
    ctx.fillStyle = "#1DA1F2";
    ctx.beginPath();
    ctx.arc(verX, verY, verR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(16 * scale)}px sans-serif`;
    ctx.fillText("✓", verX - Math.round(5 * scale), verY + Math.round(5 * scale));

    // Separator
    ctx.fillStyle = c.sub;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(verX + Math.round(22 * scale), barY + Math.round(10 * scale), 2, barH - Math.round(20 * scale));
    ctx.globalAlpha = 1;

    // Date
    ctx.fillStyle = c.sub;
    ctx.font = `${Math.round(18 * scale)}px 'SolaimanLipi', sans-serif`;
    const dateStr = new Date(post.created_at).toLocaleDateString("bn-BD", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    ctx.fillText(dateStr, verX + Math.round(34 * scale), barY + barH / 2 + Math.round(6 * scale));

    // Website with globe
    ctx.fillStyle = c.sub;
    ctx.font = `${Math.round(18 * scale)}px 'SolaimanLipi', sans-serif`;
    const siteW = ctx.measureText(websiteText).width;
    const globeX = PAD + imgAreaW - Math.round(14 * scale) - siteW - Math.round(24 * scale);
    ctx.strokeStyle = c.sub;
    ctx.lineWidth = 1.5;
    const gr = Math.round(9 * scale);
    ctx.beginPath(); ctx.arc(globeX, barY + barH / 2, gr, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(globeX - gr, barY + barH / 2); ctx.lineTo(globeX + gr, barY + barH / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(globeX, barY + barH / 2 - gr); ctx.lineTo(globeX, barY + barH / 2 + gr); ctx.stroke();
    ctx.fillStyle = c.sub;
    ctx.fillText(websiteText, globeX + Math.round(14 * scale), barY + barH / 2 + Math.round(6 * scale));

    // ── Title ──
    const titleY = barY + barH + Math.round(50 * scale);
    ctx.fillStyle = c.text;
    const scaledFontSize = Math.round(fontSize * scale);
    const scaledLineSpacing = Math.round(lineSpacing * scale);
    wrapTextCentered(ctx, title, PAD, imgAreaW, titleY, scaledLineSpacing,
      `bold ${scaledFontSize}px 'SolaimanLipi', sans-serif`);

    // ── Bottom bar ──
    const bottomBarH = Math.round(56 * scale);
    const bottomBarY = HEIGHT - bottomBarH;
    ctx.fillStyle = c.bottom;
    ctx.fillRect(0, bottomBarY, WIDTH, bottomBarH);
    drawStripeTexture(ctx, 0, bottomBarY, WIDTH, bottomBarH, "#ffffff");

    const iconYPos = bottomBarY + bottomBarH / 2;
    const textYPos = bottomBarY + bottomBarH / 2 + Math.round(5 * scale);

    // Social icons — reduced spacing
    const socialSpacing = Math.round(WIDTH / 3.6);

    // YouTube
    const ytX = Math.round(24 * scale);
    ctx.fillStyle = "#FF0000";
    const iconBtnH = Math.round(20 * scale);
    const iconBtnW = Math.round(28 * scale);
    ctx.beginPath(); ctx.roundRect(ytX, iconYPos - iconBtnH / 2, iconBtnW, iconBtnH, 4 * scale); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.round(12 * scale)}px sans-serif`;
    ctx.fillText("▶", ytX + Math.round(9 * scale), iconYPos + Math.round(4 * scale));
    ctx.fillStyle = c.sub;
    ctx.font = `${Math.round(15 * scale)}px 'SolaimanLipi', sans-serif`;
    ctx.fillText(`| ${socialHandles[0]}`, ytX + iconBtnW + Math.round(6 * scale), textYPos);

    // LinkedIn
    const liX = ytX + socialSpacing;
    ctx.fillStyle = "#0A66C2";
    const liW = Math.round(22 * scale);
    ctx.beginPath(); ctx.roundRect(liX, iconYPos - iconBtnH / 2, liW, iconBtnH, 3 * scale); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`;
    ctx.fillText("in", liX + Math.round(3 * scale), iconYPos + Math.round(5 * scale));
    ctx.fillStyle = c.sub;
    ctx.font = `${Math.round(15 * scale)}px 'SolaimanLipi', sans-serif`;
    ctx.fillText(`| ${socialHandles[1]}`, liX + liW + Math.round(6 * scale), textYPos);

    // Facebook
    const fbX = liX + socialSpacing;
    ctx.fillStyle = "#1877F2";
    const fbR = Math.round(12 * scale);
    ctx.beginPath(); ctx.arc(fbX + fbR, iconYPos, fbR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(16 * scale)}px sans-serif`;
    ctx.fillText("f", fbX + fbR - Math.round(5 * scale), iconYPos + Math.round(6 * scale));
    ctx.fillStyle = c.sub;
    ctx.font = `${Math.round(15 * scale)}px 'SolaimanLipi', sans-serif`;
    ctx.fillText(`| ${socialHandles[2]}`, fbX + fbR * 2 + Math.round(6 * scale), textYPos);

    // Right text
    ctx.fillStyle = c.sub;
    ctx.font = `${Math.round(15 * scale)}px 'SolaimanLipi', sans-serif`;
    const brText = `✓ ${bottomRight}`;
    const brW = ctx.measureText(brText).width;
    ctx.fillText(brText, WIDTH - Math.round(24 * scale) - brW, textYPos);

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [post, title, colorIdx, websiteText, badgeText, socialHandles, bottomRight, fontSize, lineSpacing, logoUrl, resIdx]);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(renderCard, 100);
      return () => clearTimeout(timeout);
    }
  }, [open, title, colorIdx, websiteText, badgeText, socialHandles, bottomRight, fontSize, lineSpacing, logoUrl, resIdx, renderCard]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `${post.slug || "post"}-card.png`;
    link.href = previewUrl;
    link.click();
  };

  const updateHandle = (idx: number, val: string) => {
    setSocialHandles((prev) => { const next = [...prev]; next[idx] = val; return next; });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${editMode ? "max-w-5xl" : "max-w-2xl"} max-h-[95vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye size={18} /> {editMode ? "ফটো কার্ড অপশন" : "ফটোকার্ড প্রিভিউ"}
          </DialogTitle>
        </DialogHeader>

        <div className={`grid ${editMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4`}>
          {/* Preview */}
          <div className="bg-muted rounded-lg p-2 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Photo Card Preview" className="w-full rounded shadow-lg" />
            ) : (
              <div className="text-muted-foreground py-20">লোড হচ্ছে...</div>
            )}
          </div>

          {/* Edit Controls — only in editMode */}
          {editMode && (
            <div className="space-y-3 text-sm">
              {/* Resolution */}
              <div>
                <Label>রেজুলিউশন</Label>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {RESOLUTIONS.map((r, i) => (
                    <button key={i} onClick={() => setResIdx(i)}
                      className={`px-2.5 py-1 rounded text-xs border transition-all ${resIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label>শিরোনাম</Label>
                <Textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
              </div>

              {/* Font size & line spacing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1"><Type size={12} /> ফন্ট সাইজ: {fontSize}px</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setFontSize(Math.max(24, fontSize - 2))}><Minus size={12} /></Button>
                    <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={24} max={80} step={2} className="flex-1" />
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setFontSize(Math.min(80, fontSize + 2))}><Plus size={12} /></Button>
                  </div>
                </div>
                <div>
                  <Label>লাইন স্পেস: {lineSpacing}px</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setLineSpacing(Math.max(30, lineSpacing - 2))}><Minus size={12} /></Button>
                    <Slider value={[lineSpacing]} onValueChange={([v]) => setLineSpacing(v)} min={30} max={100} step={2} className="flex-1" />
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setLineSpacing(Math.min(100, lineSpacing + 2))}><Plus size={12} /></Button>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <Label className="flex items-center gap-1"><Palette size={12} /> থিম রঙ</Label>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {COLORS.map((c, i) => (
                    <button key={i} onClick={() => setColorIdx(i)}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${colorIdx === i ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"}`}
                      style={{ backgroundColor: c.bg }} title={c.label} />
                  ))}
                </div>
              </div>

              {/* Logo */}
              <div>
                <Label className="flex items-center gap-1"><ImageIcon size={12} /> লোগো URL</Label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="লোগো ছবির URL দিন (ঐচ্ছিক)" className="text-sm" />
              </div>

              {/* Badge & Website */}
              <div className="grid grid-cols-2 gap-2">
                <div><Label>ব্যাজ টেক্সট</Label><Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} className="text-sm" /></div>
                <div><Label>ওয়েবসাইট</Label><Input value={websiteText} onChange={(e) => setWebsiteText(e.target.value)} className="text-sm" /></div>
              </div>

              {/* Social handles */}
              <div className="grid grid-cols-3 gap-2">
                <div><Label>ইউটিউব</Label><Input value={socialHandles[0]} onChange={(e) => updateHandle(0, e.target.value)} className="text-sm" /></div>
                <div><Label>লিংকডইন</Label><Input value={socialHandles[1]} onChange={(e) => updateHandle(1, e.target.value)} className="text-sm" /></div>
                <div><Label>ফেসবুক</Label><Input value={socialHandles[2]} onChange={(e) => updateHandle(2, e.target.value)} className="text-sm" /></div>
              </div>

              <div>
                <Label>নিচের ডান টেক্সট</Label>
                <Input value={bottomRight} onChange={(e) => setBottomRight(e.target.value)} className="text-sm" />
              </div>

              <Button onClick={handleDownload} className="w-full gap-2" size="lg">
                <Download size={18} /> ডাউনলোড করুন
              </Button>
            </div>
          )}

          {/* Frontend only: download button */}
          {!editMode && (
            <div className="flex justify-center">
              <Button onClick={handleDownload} className="gap-2" size="lg">
                <Download size={18} /> ডাউনলোড করুন
              </Button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCardEditor;
