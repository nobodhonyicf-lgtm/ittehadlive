import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Download, Eye, Palette, Type, ImageIcon, Minus, Plus } from "lucide-react";
import { useSiteSettings } from "@/hooks/useData";

interface PhotoCardEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    title: string;
    slug: string;
    image_url?: string | null;
    image_caption?: string | null;
    created_at: string;
    category_name?: string | null;
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

const loadImage = async (src: string): Promise<HTMLImageElement> => {
  if (!src) throw new Error("No src");
  const isExternal = src.startsWith("http") && !src.includes(window.location.hostname);
  const url = isExternal
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-image?url=${encodeURIComponent(src)}`
    : src;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load image"));
    el.src = url;
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

const wrapTextCentered = (
  ctx: CanvasRenderingContext2D, text: string, x: number, maxWidth: number,
  startY: number, lineHeight: number, font: string
): { endY: number; totalHeight: number; lineCount: number } => {
  ctx.font = font;
  const paragraphs = text.split("\n");
  const allLines: string[] = [];
  for (const para of paragraphs) {
    if (para.trim() === "") { allLines.push(""); continue; }
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
  const totalHeight = y - startY;
  return { endY: y, totalHeight, lineCount: allLines.length };
};

// Measure text without drawing
const measureWrappedText = (
  ctx: CanvasRenderingContext2D, text: string, maxWidth: number,
  lineHeight: number, font: string
): number => {
  ctx.font = font;
  const paragraphs = text.split("\n");
  let totalH = 0;
  for (const para of paragraphs) {
    if (para.trim() === "") { totalH += lineHeight * 0.5; continue; }
    const words = para.split(" ");
    let line = "";
    let lines = 0;
    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines++;
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    if (line.trim()) lines++;
    totalH += lines * lineHeight;
  }
  return totalH;
};

const drawYouTubeIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  ctx.fillStyle = "#FF0000";
  const w = size * 1.4, h = size;
  const rx = x, ry = y - h / 2;
  ctx.beginPath(); ctx.roundRect(rx, ry, w, h, size * 0.22); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(rx + w * 0.38, ry + h * 0.25);
  ctx.lineTo(rx + w * 0.38, ry + h * 0.75);
  ctx.lineTo(rx + w * 0.72, ry + h * 0.5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  return w;
};

const drawFacebookIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.save();
  ctx.fillStyle = "#1877F2";
  ctx.beginPath(); ctx.arc(x + r, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${r * 1.3}px Arial`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("f", x + r, y + r * 0.08);
  ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
  ctx.restore();
  return r * 2;
};

const drawInstagramIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y - size / 2, x + size, y + size / 2);
  grad.addColorStop(0, "#f09433"); grad.addColorStop(0.25, "#e6683c");
  grad.addColorStop(0.5, "#dc2743"); grad.addColorStop(0.75, "#cc2366");
  grad.addColorStop(1, "#bc1888");
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.roundRect(x, y - size / 2, size, size, size * 0.25); ctx.fill();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = size * 0.08;
  ctx.beginPath(); ctx.arc(x + size / 2, y, size * 0.28, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(x + size * 0.75, y - size * 0.25, size * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  return size;
};

// Facebook-style verified badge with proper checkmark
const drawFBVerifiedBadge = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.save();
  // Blue circle
  ctx.fillStyle = "#1877F2";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  // White checkmark
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.35;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.38, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.08, cy + r * 0.35);
  ctx.lineTo(cx + r * 0.42, cy - r * 0.3);
  ctx.stroke();
  ctx.restore();
};

const PhotoCardEditor = ({ open, onOpenChange, post, editMode = true }: PhotoCardEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: siteSettings } = useSiteSettings();
  const [title, setTitle] = useState(post.title);
  const [colorIdx, setColorIdx] = useState(0);
  const [fontSize, setFontSize] = useState(56);
  const [lineSpacing, setLineSpacing] = useState(72);
  const [websiteText, setWebsiteText] = useState("ittehad.bd");
  const [badgeText, setBadgeText] = useState("ইত্তেহাদ");
  const [socialHandles, setSocialHandles] = useState(["ittehadbd", "ittehadbd", "ittehadbd"]);
  const [bottomRight, setBottomRight] = useState("বিস্তারিত কমেন্টে");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [resIdx, setResIdx] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Auto-load logo from site settings
  useEffect(() => {
    if (siteSettings?.logo_url && !logoLoaded) {
      setLogoUrl(siteSettings.logo_url);
      setLogoLoaded(true);
    }
  }, [siteSettings, logoLoaded]);

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setCustomImageUrl("");
    }
  }, [open, post.title]);

  const renderCard = useCallback(async () => {
    try {
      const { w: WIDTH, h: BASE_HEIGHT } = RESOLUTIONS[resIdx];
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const c = COLORS[colorIdx];
      const PAD = Math.round(WIDTH * 0.028);
      const scale = WIDTH / 1080;

      // Calculate ad height
      let adTotalH = 0;
      let adImg: HTMLImageElement | null = null;
      if (adImageUrl) {
        try {
          adImg = await loadImage(adImageUrl);
          adTotalH = Math.round(120 * scale);
        } catch { adImg = null; }
      }

      // Caption area
      const imageSource = customImageUrl || post.image_url;
      const captionText = post.image_caption;
      const captionH = captionText ? Math.round(40 * scale) : 0;

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
      const imgAreaH = Math.round(mainCardH * 0.5) - captionH;
      const imgAreaW = WIDTH - PAD * 2;

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

      // ── Caption bar (gray bg, "ছবি" prefix, red divider, black text) ──
      if (captionText) {
        const capY = imgAreaTop + imgAreaH;
        // Gray background
        ctx.fillStyle = "#d4d4d4";
        ctx.fillRect(PAD, capY, imgAreaW, captionH);
        
        const capTextY = capY + captionH / 2 + Math.round(6 * scale);
        const capFontSize = Math.round(16 * scale);
        
        // "ছবি" label
        ctx.fillStyle = "#333333";
        ctx.font = `bold ${capFontSize}px 'SolaimanLipi', sans-serif`;
        const labelText = "ছবি";
        const labelW = ctx.measureText(labelText).width;
        ctx.fillText(labelText, PAD + Math.round(12 * scale), capTextY);
        
        // Red divider
        const divX = PAD + Math.round(12 * scale) + labelW + Math.round(8 * scale);
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(divX, capY + Math.round(8 * scale), Math.round(2 * scale), captionH - Math.round(16 * scale));
        
        // Caption text in black
        ctx.fillStyle = "#111111";
        ctx.font = `${capFontSize}px 'SolaimanLipi', sans-serif`;
        ctx.fillText(captionText, divX + Math.round(10 * scale), capTextY);
      }

      // ── Info bar ──
      const barY = imgAreaTop + imgAreaH + captionH + Math.round(16 * scale);
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

      // Facebook-style verified badge
      const verGap = Math.round(12 * scale);
      const verX = barContentX + badgeW + verGap;
      const verY = barY + barH / 2;
      const verR = Math.round(13 * scale);
      drawFBVerifiedBadge(ctx, verX + verR, verY, verR);

      // Separator
      ctx.fillStyle = c.sub; ctx.globalAlpha = 0.4;
      ctx.fillRect(verX + verR * 2 + Math.round(12 * scale), barY + Math.round(10 * scale), 2, barH - Math.round(20 * scale));
      ctx.globalAlpha = 1;

      // Date
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(24 * scale)}px 'SolaimanLipi', sans-serif`;
      const dateStr = new Date(post.created_at).toLocaleDateString("bn-BD", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      ctx.fillText(dateStr, verX + verR * 2 + Math.round(24 * scale), barY + barH / 2 + Math.round(8 * scale));

      // Website with globe
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(24 * scale)}px 'SolaimanLipi', sans-serif`;
      const siteW = ctx.measureText(websiteText).width;
      const globeR = Math.round(12 * scale);
      const globeX = PAD + imgAreaW - Math.round(14 * scale) - siteW - Math.round(32 * scale);
      drawGlobeIcon(ctx, globeX, barY + barH / 2, globeR, "#ffffff");
      ctx.fillStyle = "#ffffff";
      ctx.fillText(websiteText, globeX + globeR + Math.round(10 * scale), barY + barH / 2 + Math.round(8 * scale));

      // ── Title centered between info bar and bottom bar ──
      const bottomBarH = Math.round(70 * scale);
      const bottomBarY = mainCardH - bottomBarH;
      const titleAreaTop = barY + barH;
      const titleAreaBottom = bottomBarY;
      const titleAreaHeight = titleAreaBottom - titleAreaTop;

      // Measure title + category height to center them
      const scaledFontSize = Math.round(fontSize * scale);
      const scaledLineSpacing = Math.round(lineSpacing * scale);
      const titleMaxW = imgAreaW - Math.round(40 * scale);
      const titleFont = `bold ${scaledFontSize}px 'SolaimanLipi', sans-serif`;

      const categoryText = post.category_name || "";
      const catFontSize = Math.round(24 * scale);
      const catFont = `bold ${catFontSize}px 'SolaimanLipi', sans-serif`;
      const catH = categoryText ? Math.round(38 * scale) : 0;

      const titleTextH = measureWrappedText(ctx, title, titleMaxW, scaledLineSpacing, titleFont);
      const totalContentH = catH + titleTextH;
      const startContentY = titleAreaTop + (titleAreaHeight - totalContentH) / 2;

      // Category label above title
      if (categoryText) {
        ctx.font = catFont;
        const catW = ctx.measureText(categoryText).width;
        const catPadX = Math.round(16 * scale);
        const catPadY = Math.round(6 * scale);
        const catBoxW = catW + catPadX * 2;
        const catBoxH = Math.round(30 * scale);
        const catBoxX = PAD + Math.round(20 * scale) + (titleMaxW - catBoxW) / 2;
        const catBoxY = startContentY;

        ctx.fillStyle = "#e11d48";
        ctx.beginPath();
        ctx.roundRect(catBoxX, catBoxY, catBoxW, catBoxH, 4 * scale);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillText(categoryText, catBoxX + catPadX, catBoxY + catBoxH - catPadY);
      }

      // Title text
      ctx.fillStyle = c.text;
      const titleStartY = startContentY + catH + Math.round(scaledLineSpacing * 0.3);
      wrapTextCentered(ctx, title, PAD + Math.round(20 * scale), titleMaxW, titleStartY, scaledLineSpacing, titleFont);

      // ── Bottom bar ──
      ctx.fillStyle = c.bottom;
      ctx.fillRect(0, bottomBarY, WIDTH, bottomBarH);
      drawStripeTexture(ctx, 0, bottomBarY, WIDTH, bottomBarH, "#ffffff");

      const iconYPos = bottomBarY + bottomBarH / 2;
      const textYPos = bottomBarY + bottomBarH / 2 + Math.round(8 * scale);
      const socialIconSize = Math.round(30 * scale);
      const socialFontSize = Math.round(21 * scale);

      // Layout: social items evenly in left ~70%
      const socialZoneW = WIDTH * 0.65;
      const itemSpacing = socialZoneW / 3;

      // YouTube
      const ytX = Math.round(24 * scale);
      const ytIconW = drawYouTubeIcon(ctx, ytX, iconYPos, socialIconSize);
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${socialFontSize}px 'SolaimanLipi', sans-serif`;
      ctx.fillText(socialHandles[0], ytX + ytIconW + Math.round(8 * scale), textYPos);

      // Divider 1
      const div1X = ytX + itemSpacing - Math.round(6 * scale);
      ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.3;
      ctx.fillRect(div1X, bottomBarY + Math.round(14 * scale), Math.round(1.5 * scale), bottomBarH - Math.round(28 * scale));
      ctx.globalAlpha = 1;

      // Instagram
      const igX = ytX + itemSpacing;
      const igIconW = drawInstagramIcon(ctx, igX, iconYPos, socialIconSize);
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${socialFontSize}px 'SolaimanLipi', sans-serif`;
      ctx.fillText(socialHandles[1], igX + igIconW + Math.round(8 * scale), textYPos);

      // Divider 2
      const div2X = igX + itemSpacing - Math.round(6 * scale);
      ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.3;
      ctx.fillRect(div2X, bottomBarY + Math.round(14 * scale), Math.round(1.5 * scale), bottomBarH - Math.round(28 * scale));
      ctx.globalAlpha = 1;

      // Facebook
      const fbX = igX + itemSpacing;
      const fbR = Math.round(15 * scale);
      const fbIconW = drawFacebookIcon(ctx, fbX, iconYPos, fbR);
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${socialFontSize}px 'SolaimanLipi', sans-serif`;
      ctx.fillText(socialHandles[2], fbX + fbIconW + Math.round(8 * scale), textYPos);

      // Divider 3 (before right text)
      const div3X = fbX + itemSpacing - Math.round(6 * scale);
      ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.3;
      ctx.fillRect(div3X, bottomBarY + Math.round(14 * scale), Math.round(1.5 * scale), bottomBarH - Math.round(28 * scale));
      ctx.globalAlpha = 1;

      // Right text: arrow on left, text
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(22 * scale)}px 'SolaimanLipi', sans-serif`;
      const brText = bottomRight;
      const brW = ctx.measureText(brText).width;
      const arrowSize = Math.round(12 * scale);
      const brTotalW = arrowSize * 2 + Math.round(12 * scale) + brW;
      const brStartX = WIDTH - Math.round(24 * scale) - brTotalW;

      // Down arrow on the LEFT side
      const arrowX = brStartX + arrowSize;
      const arrowY = iconYPos;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.round(2.5 * scale);
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(arrowX, arrowY - arrowSize); ctx.lineTo(arrowX, arrowY + arrowSize); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowX - arrowSize * 0.6, arrowY + arrowSize * 0.3);
      ctx.lineTo(arrowX, arrowY + arrowSize);
      ctx.lineTo(arrowX + arrowSize * 0.6, arrowY + arrowSize * 0.3);
      ctx.stroke();

      // Text after arrow
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(22 * scale)}px 'SolaimanLipi', sans-serif`;
      ctx.fillText(brText, arrowX + arrowSize + Math.round(8 * scale), textYPos);

      // ── Ad image at the very bottom ──
      if (adImg && adTotalH > 0) {
        const adAreaTop = mainCardH + Math.round(4 * scale);
        const adAreaH = adTotalH - Math.round(8 * scale);
        const adW = Math.min(WIDTH, (adImg.width / adImg.height) * adAreaH);
        const adX = (WIDTH - adW) / 2;
        ctx.drawImage(adImg, adX, adAreaTop, adW, adAreaH);
      }

      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Photo card render error:", err);
    }
  }, [post, title, colorIdx, websiteText, badgeText, socialHandles, bottomRight, fontSize, lineSpacing, logoUrl, customImageUrl, adImageUrl, resIdx]);

  // Render when dialog opens or any dependency changes
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(renderCard, 150);
      return () => clearTimeout(timeout);
    }
  }, [open, renderCard]);

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

          {/* Edit Controls - Admin gets full controls, Front-end gets font size + color */}
          {editMode && (
            <div className="space-y-3 text-sm">
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

              <div>
                <Label>শিরোনাম</Label>
                <Textarea rows={3} value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
              </div>

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

              <div>
                <Label className="flex items-center gap-1"><ImageIcon size={12} /> লোগো URL {siteSettings?.logo_url ? "(অটো-লোড)" : ""}</Label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="লোগো ছবির URL দিন (ঐচ্ছিক)" className="text-sm" />
              </div>

              <div>
                <Label className="flex items-center gap-1"><ImageIcon size={12} /> কাস্টম ছবি URL</Label>
                <Input value={customImageUrl} onChange={(e) => setCustomImageUrl(e.target.value)} placeholder="পোস্টের ছবি পরিবর্তন করতে URL দিন (ঐচ্ছিক)" className="text-sm" />
              </div>

              <div>
                <Label className="flex items-center gap-1"><ImageIcon size={12} /> বিজ্ঞাপন ছবি URL (ঐচ্ছিক)</Label>
                <Input value={adImageUrl} onChange={(e) => setAdImageUrl(e.target.value)} placeholder="কার্ডের একেবারে নিচে বিজ্ঞাপন ছবি দিন" className="text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><Label>ব্যাজ টেক্সট</Label><Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} className="text-sm" /></div>
                <div><Label>ওয়েবসাইট</Label><Input value={websiteText} onChange={(e) => setWebsiteText(e.target.value)} className="text-sm" /></div>
              </div>

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

          {/* Front-end: font size + color only */}
          {!editMode && (
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-1"><Type size={14} /> শিরোনামের সাইজ: {fontSize}px</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFontSize(Math.max(24, fontSize - 2))}><Minus size={14} /></Button>
                  <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={24} max={80} step={2} className="flex-1" />
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFontSize(Math.min(80, fontSize + 2))}><Plus size={14} /></Button>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1"><Palette size={14} /> কালার নির্বাচন</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {COLORS.map((c, i) => (
                    <button key={i} onClick={() => setColorIdx(i)}
                      className={`w-9 h-9 rounded-lg border-2 transition-all ${colorIdx === i ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"}`}
                      style={{ backgroundColor: c.bg }} title={c.label} />
                  ))}
                </div>
              </div>

              <Button onClick={handleDownload} className="w-full gap-2" size="lg">
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
