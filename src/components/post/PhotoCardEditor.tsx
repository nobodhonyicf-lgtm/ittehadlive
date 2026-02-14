import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Eye, Palette } from "lucide-react";

interface PhotoCardEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    title: string;
    slug: string;
    image_url?: string | null;
    created_at: string;
  };
}

const COLORS = [
  { label: "ডার্ক", bg: "#1a1a1a", bar: "#2a2a2a", bottom: "#111111", text: "#ffffff", sub: "#cccccc" },
  { label: "সবুজ", bg: "#0d3b1e", bar: "#145a2e", bottom: "#0a2e17", text: "#ffffff", sub: "#b8e6c8" },
  { label: "নীল", bg: "#0f1f3d", bar: "#172d54", bottom: "#0a1628", text: "#ffffff", sub: "#a8c4e0" },
  { label: "মেরুন", bg: "#3b0f0f", bar: "#551a1a", bottom: "#280a0a", text: "#ffffff", sub: "#e0b8b8" },
];

// Draw diagonal stripe texture
const drawStripeTexture = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;
  const gap = 8;
  for (let i = -h; i < w + h; i += gap) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i - h, y + h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
};

// Wrap text centered and return final Y
const wrapTextCentered = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  maxWidth: number,
  startY: number,
  lineHeight: number,
  font: string
): number => {
  ctx.font = font;
  const words = text.split(" ");
  let line = "";
  let y = startY;
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

  for (const l of lines) {
    const w = ctx.measureText(l).width;
    ctx.fillText(l, x + (maxWidth - w) / 2, y);
    y += lineHeight;
  }
  return y;
};

const PhotoCardEditor = ({ open, onOpenChange, post }: PhotoCardEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState(post.title);
  const [colorIdx, setColorIdx] = useState(0);
  const [websiteText, setWebsiteText] = useState("ittehad.bd");
  const [badgeText, setBadgeText] = useState("ইত্তেহাদ");
  const [socialHandles, setSocialHandles] = useState(["ittehadbd", "ittehadbd", "ittehadbd"]);
  const [bottomRight, setBottomRight] = useState("বিস্তারিত কমেন্টে");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      renderCard();
    }
  }, [open]);

  const renderCard = useCallback(async () => {
    const SIZE = 1080;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c = COLORS[colorIdx];
    const PAD = 30;

    // ── Background with subtle texture ──
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, SIZE, SIZE);
    drawStripeTexture(ctx, 0, 0, SIZE, SIZE, "#ffffff");

    // ── Image area ──
    const imgAreaTop = PAD;
    const imgAreaH = 540;
    const imgAreaW = SIZE - PAD * 2;

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
        ctx.roundRect(PAD, imgAreaTop, imgAreaW, imgAreaH, 12);
        ctx.clip();
        // Cover-fit
        const scale = Math.max(imgAreaW / img.width, imgAreaH / img.height);
        const sw = imgAreaW / scale;
        const sh = imgAreaH / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, PAD, imgAreaTop, imgAreaW, imgAreaH);
        ctx.restore();
      } catch {
        // fallback: gray placeholder
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.roundRect(PAD, imgAreaTop, imgAreaW, imgAreaH, 12);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.roundRect(PAD, imgAreaTop, imgAreaW, imgAreaH, 12);
      ctx.fill();
    }

    // ── Info bar ──
    const barY = imgAreaTop + imgAreaH + 16;
    const barH = 52;
    ctx.fillStyle = c.bar;
    ctx.fillRect(PAD, barY, imgAreaW, barH);
    // bar texture
    drawStripeTexture(ctx, PAD, barY, imgAreaW, barH, "#ffffff");

    // Green badge
    ctx.font = "bold 22px 'SolaimanLipi', sans-serif";
    const badgeW = ctx.measureText(badgeText).width + 32;
    const badgeH = 34;
    const badgeX = PAD + 14;
    const badgeY = barY + (barH - badgeH) / 2;
    ctx.fillStyle = "#1a7a3a";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(badgeText, badgeX + 16, badgeY + 25);

    // Verified blue circle
    const verX = badgeX + badgeW + 10;
    const verY = barY + barH / 2;
    ctx.fillStyle = "#1DA1F2";
    ctx.beginPath();
    ctx.arc(verX, verY, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("✓", verX - 5, verY + 5);

    // Separator
    ctx.fillStyle = c.sub;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(verX + 20, barY + 10, 2, barH - 20);
    ctx.globalAlpha = 1;

    // Date
    ctx.fillStyle = c.sub;
    ctx.font = "18px 'SolaimanLipi', sans-serif";
    const dateStr = new Date(post.created_at).toLocaleDateString("bn-BD", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    ctx.fillText(dateStr, verX + 32, barY + barH / 2 + 6);

    // Website with globe icon
    ctx.fillStyle = c.sub;
    ctx.font = "18px 'SolaimanLipi', sans-serif";
    const siteW = ctx.measureText(websiteText).width;
    const globeX = PAD + imgAreaW - 14 - siteW - 24;
    // Simple globe circle
    ctx.strokeStyle = c.sub;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(globeX, barY + barH / 2, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(globeX - 9, barY + barH / 2);
    ctx.lineTo(globeX + 9, barY + barH / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(globeX, barY + barH / 2 - 9);
    ctx.lineTo(globeX, barY + barH / 2 + 9);
    ctx.stroke();

    ctx.fillStyle = c.sub;
    ctx.fillText(websiteText, globeX + 14, barY + barH / 2 + 6);

    // ── Title ──
    const titleY = barY + barH + 50;
    ctx.fillStyle = c.text;
    wrapTextCentered(
      ctx,
      title,
      PAD,
      imgAreaW,
      titleY,
      72,
      "bold 56px 'SolaimanLipi', sans-serif"
    );

    // ── Bottom bar ──
    const bottomBarH = 56;
    const bottomBarY = SIZE - bottomBarH;
    ctx.fillStyle = c.bottom;
    ctx.fillRect(0, bottomBarY, SIZE, bottomBarH);
    drawStripeTexture(ctx, 0, bottomBarY, SIZE, bottomBarH, "#ffffff");

    const iconY = bottomBarY + bottomBarH / 2;
    const textY = bottomBarY + bottomBarH / 2 + 5;

    // YouTube
    const ytX = 34;
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.roundRect(ytX, iconY - 10, 28, 20, 4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText("▶", ytX + 9, iconY + 4);
    ctx.fillStyle = c.sub;
    ctx.font = "15px 'SolaimanLipi', sans-serif";
    ctx.fillText(`| ${socialHandles[0]}`, ytX + 34, textY);

    // LinkedIn / second social
    const liX = 340;
    ctx.fillStyle = "#0A66C2";
    ctx.beginPath();
    ctx.roundRect(liX, iconY - 10, 22, 20, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("in", liX + 3, iconY + 5);
    ctx.fillStyle = c.sub;
    ctx.font = "15px 'SolaimanLipi', sans-serif";
    ctx.fillText(`| ${socialHandles[1]}`, liX + 28, textY);

    // Facebook
    const fbX = 640;
    ctx.fillStyle = "#1877F2";
    ctx.beginPath();
    ctx.arc(fbX + 11, iconY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("f", fbX + 6, iconY + 6);
    ctx.fillStyle = c.sub;
    ctx.font = "15px 'SolaimanLipi', sans-serif";
    ctx.fillText(`| ${socialHandles[2]}`, fbX + 28, textY);

    // Right: checkmark + বিস্তারিত কমেন্টে
    ctx.fillStyle = c.sub;
    ctx.font = "15px 'SolaimanLipi', sans-serif";
    const brText = `✓ ${bottomRight}`;
    const brW = ctx.measureText(brText).width;
    ctx.fillText(brText, SIZE - 30 - brW, textY);

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [post, title, colorIdx, websiteText, badgeText, socialHandles, bottomRight]);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(renderCard, 100);
      return () => clearTimeout(timeout);
    }
  }, [open, title, colorIdx, websiteText, badgeText, socialHandles, bottomRight, renderCard]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `${post.slug || "post"}-card.png`;
    link.href = previewUrl;
    link.click();
  };

  const updateHandle = (idx: number, val: string) => {
    setSocialHandles((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye size={18} /> ফটোকার্ড প্রিভিউ ও এডিট
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preview */}
          <div className="bg-muted rounded-lg p-2 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Photo Card Preview" className="w-full rounded shadow-lg" />
            ) : (
              <div className="text-muted-foreground py-20">লোড হচ্ছে...</div>
            )}
          </div>

          {/* Edit Controls */}
          <div className="space-y-4">
            <div>
              <Label>শিরোনাম</Label>
              <Textarea rows={3} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label className="flex items-center gap-1">
                <Palette size={14} /> থিম রঙ
              </Label>
              <div className="flex gap-2 mt-1">
                {COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColorIdx(i)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${colorIdx === i ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"}`}
                    style={{ backgroundColor: c.bg }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>ব্যাজ টেক্সট</Label>
                <Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
              </div>
              <div>
                <Label>ওয়েবসাইট</Label>
                <Input value={websiteText} onChange={(e) => setWebsiteText(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>ইউটিউব</Label>
                <Input value={socialHandles[0]} onChange={(e) => updateHandle(0, e.target.value)} />
              </div>
              <div>
                <Label>লিংকডইন</Label>
                <Input value={socialHandles[1]} onChange={(e) => updateHandle(1, e.target.value)} />
              </div>
              <div>
                <Label>ফেসবুক</Label>
                <Input value={socialHandles[2]} onChange={(e) => updateHandle(2, e.target.value)} />
              </div>
            </div>

            <div>
              <Label>নিচের ডান টেক্সট</Label>
              <Input value={bottomRight} onChange={(e) => setBottomRight(e.target.value)} />
            </div>

            <Button onClick={handleDownload} className="w-full gap-2" size="lg">
              <Download size={18} /> ডাউনলোড করুন
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCardEditor;
