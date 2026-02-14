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
  editMode?: boolean;
}

const COLORS = [
  { label: "ডার্ক", bg: "#1e1e1e", bar: "#333333", bottom: "#151515", text: "#ffffff", sub: "#d0d0d0" },
  { label: "সবুজ", bg: "#0f4d28", bar: "#1a7a3a", bottom: "#0b3a1d", text: "#ffffff", sub: "#c8f0d8" },
  { label: "নীল", bg: "#132e5e", bar: "#1e4a8a", bottom: "#0e2040", text: "#ffffff", sub: "#b8d4f0" },
  { label: "মেরুন", bg: "#5a1515", bar: "#7a2222", bottom: "#3a0e0e", text: "#ffffff", sub: "#f0c8c8" },
  { label: "সোনালি", bg: "#4a3810", bar: "#6a5018", bottom: "#2e2208", text: "#ffffff", sub: "#f0e0b0" },
  { label: "বেগুনি", bg: "#2e1260", bar: "#441e88", bottom: "#1e0c40", text: "#ffffff", sub: "#d8b8f0" },
  { label: "টিল", bg: "#104848", bar: "#186868", bottom: "#0a3030", text: "#ffffff", sub: "#b8f0f0" },
  { label: "ধূসর", bg: "#383838", bar: "#505050", bottom: "#252525", text: "#ffffff", sub: "#e0e0e0" },
  { label: "কমলা", bg: "#4a2200", bar: "#6a3500", bottom: "#301500", text: "#ffffff", sub: "#f0d8b0" },
  { label: "গোলাপি", bg: "#4a1038", bar: "#6a1850", bottom: "#300a24", text: "#ffffff", sub: "#f0b8d8" },
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
  ctx.globalAlpha = 0.08;
  for (let i = -h; i < w + h; i += 8) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i - h, y + h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin for same-origin images
      const img2 = new window.Image();
      img2.onload = () => resolve(img2);
      img2.onerror = () => reject();
      img2.src = src;
    };
    img.src = src;
  });
};

const drawGlobeIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.45, r, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.8, cy - r * 0.45);
  ctx.quadraticCurveTo(cx, cy - r * 0.3, cx + r * 0.8, cy - r * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.8, cy + r * 0.45);
  ctx.quadraticCurveTo(cx, cy + r * 0.3, cx + r * 0.8, cy + r * 0.45);
  ctx.stroke();
  ctx.restore();
};

// Supports newlines (\n) in text
const wrapTextCentered = (
  ctx: CanvasRenderingContext2D, text: string, x: number, maxWidth: number,
  startY: number, lineHeight: number, font: string
): number => {
  ctx.font = font;
  const paragraphs = text.split("\n");
  const allLines: string[] = [];
  for (const para of paragraphs) {
    if (para.trim() === "") {
      allLines.push("");
      continue;
    }
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && line) {
        allLines.push(line.trim());
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    if (line.trim()) allLines.push(line.trim());
  }
  let y = startY;
  for (const l of allLines) {
    if (l === "") { y += lineHeight * 0.5; continue; }
    const w = ctx.measureText(l).width;
    ctx.fillText(l, x + (maxWidth - w) / 2, y);
    y += lineHeight;
  }
  return y;
};

// Draw YouTube play button icon
const drawYouTubeIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  ctx.fillStyle = "#FF0000";
  const w = size * 1.4, h = size;
  const rx = x, ry = y - h / 2;
  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, size * 0.22);
  ctx.fill();
  // Play triangle
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(rx + w * 0.38, ry + h * 0.25);
  ctx.lineTo(rx + w * 0.38, ry + h * 0.75);
  ctx.lineTo(rx + w * 0.72, ry + h * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  return w;
};

// Draw Facebook "f" icon
const drawFacebookIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.save();
  ctx.fillStyle = "#1877F2";
  ctx.beginPath(); ctx.arc(x + r, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${r * 1.3}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("f", x + r, y + r * 0.08);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
  return r * 2;
};

// Draw Instagram gradient icon
const drawInstagramIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y - size / 2, x + size, y + size / 2);
  grad.addColorStop(0, "#f09433");
  grad.addColorStop(0.25, "#e6683c");
  grad.addColorStop(0.5, "#dc2743");
  grad.addColorStop(0.75, "#cc2366");
  grad.addColorStop(1, "#bc1888");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y - size / 2, size, size, size * 0.25);
  ctx.fill();
  // Camera outline
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.08;
  ctx.beginPath();
  ctx.arc(x + size / 2, y, size * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  // Dot
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x + size * 0.75, y - size * 0.25, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return size;
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
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [resIdx, setResIdx] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setCustomImageUrl("");
      renderCard();
    }
  }, [open]);

  const renderCard = useCallback(async () => {
    const { w: WIDTH, h: BASE_HEIGHT } = RESOLUTIONS[resIdx];
    const canvas = canvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c = COLORS[colorIdx];
    const PAD = Math.round(WIDTH * 0.028);
    const scale = WIDTH / 1080;

    // Calculate ad height first to determine total canvas height
    let adTotalH = 0;
    let adImg: HTMLImageElement | null = null;
    if (adImageUrl) {
      try {
        adImg = await loadImage(adImageUrl);
        adTotalH = Math.round(120 * scale);
      } catch { adImg = null; }
    }

    const HEIGHT = BASE_HEIGHT + adTotalH;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // ── Background ──
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawStripeTexture(ctx, 0, 0, WIDTH, HEIGHT, "#ffffff");

    // ── Image area ──
    const imgAreaTop = PAD;
    const mainCardH = BASE_HEIGHT;
    const imgAreaH = Math.round(mainCardH * 0.5);
    const imgAreaW = WIDTH - PAD * 2;

    // Use custom image, or post image (try to resolve the original URL)
    const imageSource = customImageUrl || post.image_url;

    if (imageSource) {
      try {
        const img = await loadImage(imageSource);
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
        ctx.fillStyle = "#444";
        ctx.beginPath();
        ctx.roundRect(PAD, imgAreaTop, imgAreaW, imgAreaH, 12 * scale);
        ctx.fill();
        // Show placeholder text
        ctx.fillStyle = "#888";
        ctx.font = `${Math.round(20 * scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("ছবি লোড হয়নি", WIDTH / 2, imgAreaTop + imgAreaH / 2);
        ctx.textAlign = "start";
      }
    } else {
      ctx.fillStyle = "#444";
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

    // Logo
    if (logoUrl) {
      try {
        const logoImg = await loadImage(logoUrl);
        const logoH = barH - Math.round(12 * scale);
        const logoW = (logoImg.width / logoImg.height) * logoH;
        const logoY = barY + (barH - logoH) / 2;
        ctx.drawImage(logoImg, barContentX, logoY, logoW, logoH);
        barContentX += logoW + Math.round(14 * scale);
      } catch { /* skip */ }
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

    // Verified blue circle
    const verGap = Math.round(26 * scale);
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
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(24 * scale)}px 'SolaimanLipi', sans-serif`;
    const dateStr = new Date(post.created_at).toLocaleDateString("bn-BD", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    ctx.fillText(dateStr, verX + Math.round(34 * scale), barY + barH / 2 + Math.round(8 * scale));

    // Website with globe
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(24 * scale)}px 'SolaimanLipi', sans-serif`;
    const siteW = ctx.measureText(websiteText).width;
    const globeR = Math.round(12 * scale);
    const globeX = PAD + imgAreaW - Math.round(14 * scale) - siteW - Math.round(32 * scale);
    drawGlobeIcon(ctx, globeX, barY + barH / 2, globeR, "#ffffff");
    ctx.fillStyle = "#ffffff";
    ctx.fillText(websiteText, globeX + globeR + Math.round(10 * scale), barY + barH / 2 + Math.round(8 * scale));

    // ── Title — more gap from bar ──
    const titleY = barY + barH + Math.round(90 * scale);
    ctx.fillStyle = c.text;
    const scaledFontSize = Math.round(fontSize * scale);
    const scaledLineSpacing = Math.round(lineSpacing * scale);
    wrapTextCentered(ctx, title, PAD + Math.round(10 * scale), imgAreaW - Math.round(20 * scale), titleY, scaledLineSpacing,
      `bold ${scaledFontSize}px 'SolaimanLipi', sans-serif`);

    // ── Bottom bar ──
    const bottomBarH = Math.round(70 * scale);
    const bottomBarY = mainCardH - bottomBarH;
    ctx.fillStyle = c.bottom;
    ctx.fillRect(0, bottomBarY, WIDTH, bottomBarH);
    drawStripeTexture(ctx, 0, bottomBarY, WIDTH, bottomBarH, "#ffffff");

    const iconYPos = bottomBarY + bottomBarH / 2;
    const textYPos = bottomBarY + bottomBarH / 2 + Math.round(8 * scale);

    const socialIconSize = Math.round(30 * scale);
    const socialFontSize = Math.round(21 * scale);
    const socialSpacing = Math.round(WIDTH / 4);

    // YouTube
    const ytX = Math.round(24 * scale);
    const ytIconW = drawYouTubeIcon(ctx, ytX, iconYPos, socialIconSize);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${socialFontSize}px 'SolaimanLipi', sans-serif`;
    ctx.fillText(socialHandles[0], ytX + ytIconW + Math.round(8 * scale), textYPos);

    // Instagram (replacing LinkedIn)
    const igX = ytX + socialSpacing;
    const igIconW = drawInstagramIcon(ctx, igX, iconYPos, socialIconSize);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${socialFontSize}px 'SolaimanLipi', sans-serif`;
    ctx.fillText(socialHandles[1], igX + igIconW + Math.round(8 * scale), textYPos);

    // Facebook
    const fbX = igX + socialSpacing;
    const fbR = Math.round(15 * scale);
    const fbIconW = drawFacebookIcon(ctx, fbX, iconYPos, fbR);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${socialFontSize}px 'SolaimanLipi', sans-serif`;
    ctx.fillText(socialHandles[2], fbX + fbIconW + Math.round(8 * scale), textYPos);

    // Right text with clear arrow
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(22 * scale)}px 'SolaimanLipi', sans-serif`;
    const brText = bottomRight;
    const brW = ctx.measureText(brText).width;
    const arrowSize = Math.round(12 * scale);
    const brTotalW = brW + arrowSize + Math.round(16 * scale);
    const brStartX = WIDTH - Math.round(24 * scale) - brTotalW;
    
    // Draw checkmark circle
    const checkR = Math.round(11 * scale);
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(brStartX + checkR, iconYPos, checkR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`;
    ctx.fillText("✓", brStartX + checkR - Math.round(5 * scale), iconYPos + Math.round(5 * scale));
    
    // Text
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(22 * scale)}px 'SolaimanLipi', sans-serif`;
    ctx.fillText(brText, brStartX + checkR * 2 + Math.round(8 * scale), textYPos);
    
    // Arrow pointing down ↓
    const arrowX = brStartX + checkR * 2 + Math.round(8 * scale) + brW + Math.round(8 * scale);
    const arrowY = iconYPos;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.round(2.5 * scale);
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY - arrowSize);
    ctx.lineTo(arrowX, arrowY + arrowSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(arrowX - arrowSize * 0.6, arrowY + arrowSize * 0.3);
    ctx.lineTo(arrowX, arrowY + arrowSize);
    ctx.lineTo(arrowX + arrowSize * 0.6, arrowY + arrowSize * 0.3);
    ctx.stroke();

    // ── Ad image at the very bottom, separate from main card ──
    if (adImg && adTotalH > 0) {
      const adAreaTop = mainCardH + Math.round(4 * scale);
      const adAreaH = adTotalH - Math.round(8 * scale);
      const adW = Math.min(WIDTH, (adImg.width / adImg.height) * adAreaH);
      const adX = (WIDTH - adW) / 2;
      ctx.drawImage(adImg, adX, adAreaTop, adW, adAreaH);
    }

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [post, title, colorIdx, websiteText, badgeText, socialHandles, bottomRight, fontSize, lineSpacing, logoUrl, customImageUrl, adImageUrl, resIdx]);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(renderCard, 100);
      return () => clearTimeout(timeout);
    }
  }, [open, title, colorIdx, websiteText, badgeText, socialHandles, bottomRight, fontSize, lineSpacing, logoUrl, customImageUrl, adImageUrl, resIdx, renderCard]);

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

          {/* Edit Controls */}
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
                <Textarea rows={3} value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
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

              {/* Custom Image URL */}
              <div>
                <Label className="flex items-center gap-1"><ImageIcon size={12} /> কাস্টম ছবি URL</Label>
                <Input value={customImageUrl} onChange={(e) => setCustomImageUrl(e.target.value)} placeholder="পোস্টের ছবি পরিবর্তন করতে URL দিন (ঐচ্ছিক)" className="text-sm" />
              </div>

              {/* Ad Image URL */}
              <div>
                <Label className="flex items-center gap-1"><ImageIcon size={12} /> বিজ্ঞাপন ছবি URL (ঐচ্ছিক)</Label>
                <Input value={adImageUrl} onChange={(e) => setAdImageUrl(e.target.value)} placeholder="কার্ডের একেবারে নিচে বিজ্ঞাপন ছবি দিন" className="text-sm" />
              </div>

              {/* Badge & Website */}
              <div className="grid grid-cols-2 gap-2">
                <div><Label>ব্যাজ টেক্সট</Label><Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} className="text-sm" /></div>
                <div><Label>ওয়েবসাইট</Label><Input value={websiteText} onChange={(e) => setWebsiteText(e.target.value)} className="text-sm" /></div>
              </div>

              {/* Social handles */}
              <div className="grid grid-cols-3 gap-2">
                <div><Label>ইউটিউব</Label><Input value={socialHandles[0]} onChange={(e) => updateHandle(0, e.target.value)} className="text-sm" /></div>
                <div><Label>ইনস্টাগ্রাম</Label><Input value={socialHandles[1]} onChange={(e) => updateHandle(1, e.target.value)} className="text-sm" /></div>
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
