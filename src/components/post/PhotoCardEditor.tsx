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

const PhotoCardEditor = ({ open, onOpenChange, post }: PhotoCardEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState(post.title);
  const [colorIdx, setColorIdx] = useState(0);
  const [websiteText, setWebsiteText] = useState("ittehad.bd");
  const [badgeText, setBadgeText] = useState("ইত্তেহাদ");
  const [bottomLeft, setBottomLeft] = useState("ittehadbd");
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

    // Background
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Image area
    const imageAreaHeight = 580;
    if (post.image_url) {
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = post.image_url!;
        });
        const pad = 40;
        const imgW = SIZE - pad * 2;
        const imgH = imageAreaHeight - pad;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pad, pad, imgW, imgH, 16);
        ctx.clip();
        const scale = Math.max(imgW / img.width, imgH / img.height);
        const sw = imgW / scale;
        const sh = imgH / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, pad, pad, imgW, imgH);
        ctx.restore();
      } catch {
        // no image
      }
    }

    // Middle info bar
    const barY = imageAreaHeight + 10;
    const barH = 50;
    ctx.fillStyle = c.bar;
    ctx.fillRect(0, barY, SIZE, barH);

    // Badge
    ctx.fillStyle = "#1a7a3a";
    ctx.beginPath();
    ctx.roundRect(40, barY + 8, Math.max(120, ctx.measureText(badgeText).width + 40), 34, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(badgeText, 55, barY + 31);

    // Verified
    const badgeW = Math.max(120, ctx.measureText(badgeText).width + 40);
    ctx.fillStyle = "#1DA1F2";
    ctx.beginPath();
    ctx.arc(40 + badgeW + 15, barY + 25, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("✓", 40 + badgeW + 10, barY + 30);

    // Date
    ctx.fillStyle = c.sub;
    ctx.font = "16px sans-serif";
    const dateStr = new Date(post.created_at).toLocaleDateString("bn-BD", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    ctx.fillText(dateStr, 40 + badgeW + 40, barY + 32);

    // Website
    ctx.fillStyle = c.sub;
    ctx.font = "16px sans-serif";
    const siteW = ctx.measureText(websiteText).width;
    ctx.fillText(websiteText, SIZE - 40 - siteW, barY + 32);

    // Title
    const titleY = barY + barH + 30;
    ctx.fillStyle = c.text;
    ctx.font = "bold 52px sans-serif";
    const words = title.split(" ");
    let line = "";
    let y = titleY;
    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > SIZE - 80) {
        ctx.fillText(line.trim(), 40, y);
        line = word + " ";
        y += 64;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), 40, y);

    // Bottom bar
    const bottomBarH = 50;
    const bottomBarY = SIZE - bottomBarH;
    ctx.fillStyle = c.bottom;
    ctx.fillRect(0, bottomBarY, SIZE, bottomBarH);

    // YouTube icon + text
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(30, bottomBarY + 15, 22, 16);
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px sans-serif";
    ctx.fillText("▶", 37, bottomBarY + 27);
    ctx.fillStyle = c.sub;
    ctx.font = "13px sans-serif";
    ctx.fillText(`| ${bottomLeft}`, 58, bottomBarY + 30);

    // Facebook
    ctx.fillStyle = "#1877F2";
    ctx.beginPath();
    ctx.arc(410, bottomBarY + 24, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("f", 406, bottomBarY + 29);
    ctx.fillStyle = c.sub;
    ctx.font = "13px sans-serif";
    ctx.fillText(`| ${bottomLeft}`, 425, bottomBarY + 30);

    // Right text
    ctx.fillStyle = c.sub;
    ctx.font = "14px sans-serif";
    const dtW = ctx.measureText(`✓ ${bottomRight}`).width;
    ctx.fillText(`✓ ${bottomRight}`, SIZE - 30 - dtW, bottomBarY + 30);

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [post, title, colorIdx, websiteText, badgeText, bottomLeft, bottomRight]);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(renderCard, 100);
      return () => clearTimeout(timeout);
    }
  }, [open, title, colorIdx, websiteText, badgeText, bottomLeft, bottomRight, renderCard]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `${post.slug || "post"}-card.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Eye size={18} /> ফটোকার্ড প্রিভিউ ও এডিট</DialogTitle>
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
              <Label className="flex items-center gap-1"><Palette size={14} /> থিম রঙ</Label>
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

            <div>
              <Label>ব্যাজ টেক্সট</Label>
              <Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
            </div>

            <div>
              <Label>ওয়েবসাইট</Label>
              <Input value={websiteText} onChange={(e) => setWebsiteText(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>সোশ্যাল হ্যান্ডেল</Label>
                <Input value={bottomLeft} onChange={(e) => setBottomLeft(e.target.value)} />
              </div>
              <div>
                <Label>নিচের ডান টেক্সট</Label>
                <Input value={bottomRight} onChange={(e) => setBottomRight(e.target.value)} />
              </div>
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
