import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePost, useAds } from "@/hooks/useData";
import Sidebar from "@/components/home/Sidebar";
import { Calendar, Share2, Facebook, Twitter, MessageCircle, Download, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback } from "react";
import { toBengali } from "@/lib/bengali";
import { timeAgo } from "@/lib/timeAgo";
import SEOHead from "@/components/SEOHead";
import RelatedPosts from "@/components/post/RelatedPosts";
import InPostAd from "@/components/post/InPostAd";

const SocialShare = ({ url, title }: { url: string; title: string }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground flex items-center gap-1"><Share2 size={14} /> শেয়ার:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-[#1877F2] text-white px-3 py-1.5 rounded text-xs hover:opacity-90">
        <Facebook size={14} /> Facebook
      </a>
      <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-[#25D366] text-white px-3 py-1.5 rounded text-xs hover:opacity-90">
        <MessageCircle size={14} /> WhatsApp
      </a>
      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-[#1DA1F2] text-white px-3 py-1.5 rounded text-xs hover:opacity-90">
        <Twitter size={14} /> Twitter
      </a>
    </div>
  );
};

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePost(slug || "");
  const cardRef = useRef<HTMLDivElement>(null);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const generatePhotoCard = useCallback(async () => {
    if (!post) return;
    try {
      const SIZE = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark background
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Load and draw post image if exists
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
          // Draw image with padding and rounded corners
          const pad = 40;
          const imgW = SIZE - pad * 2;
          const imgH = imageAreaHeight - pad;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(pad, pad, imgW, imgH, 16);
          ctx.clip();
          // Cover fit
          const scale = Math.max(imgW / img.width, imgH / img.height);
          const sw = imgW / scale;
          const sh = imgH / scale;
          const sx = (img.width - sw) / 2;
          const sy = (img.height - sh) / 2;
          ctx.drawImage(img, sx, sy, sw, sh, pad, pad, imgW, imgH);
          ctx.restore();
        } catch {
          // If image fails, just leave dark bg
        }
      }

      // Middle info bar (dark semi-transparent strip)
      const barY = imageAreaHeight + 10;
      const barH = 50;
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(0, barY, SIZE, barH);

      // Logo text (green badge)
      ctx.fillStyle = "#1a7a3a";
      ctx.roundRect(40, barY + 8, 120, 34, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("ইত্তেহাদ", 55, barY + 31);

      // Verified badge circle
      ctx.fillStyle = "#1DA1F2";
      ctx.beginPath();
      ctx.arc(175, barY + 25, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("✓", 170, barY + 30);

      // Date
      ctx.fillStyle = "#cccccc";
      ctx.font = "16px sans-serif";
      const dateStr = new Date(post.created_at).toLocaleDateString("bn-BD", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      ctx.fillText(dateStr, 210, barY + 32);

      // Website URL (right side)
      ctx.fillStyle = "#cccccc";
      ctx.font = "16px sans-serif";
      const siteText = "ittehad.bd";
      const siteW = ctx.measureText(siteText).width;
      ctx.fillText(siteText, SIZE - 40 - siteW, barY + 32);

      // Globe icon placeholder
      ctx.beginPath();
      ctx.arc(SIZE - 55 - siteW, barY + 27, 8, 0, Math.PI * 2);
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Title area (below bar)
      const titleY = barY + barH + 30;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 52px sans-serif";
      const words = post.title.split(" ");
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

      // Bottom social bar
      const bottomBarH = 50;
      const bottomBarY = SIZE - bottomBarH;
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, bottomBarY, SIZE, bottomBarH);

      // Social media items
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#cccccc";

      // YouTube
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(30, bottomBarY + 15, 22, 16);
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px sans-serif";
      ctx.fillText("▶", 37, bottomBarY + 27);
      ctx.fillStyle = "#cccccc";
      ctx.font = "13px sans-serif";
      ctx.fillText("| ittehadbd", 58, bottomBarY + 30);

      // Facebook
      ctx.fillStyle = "#1877F2";
      ctx.beginPath();
      ctx.arc(410, bottomBarY + 24, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("f", 406, bottomBarY + 29);
      ctx.fillStyle = "#cccccc";
      ctx.font = "13px sans-serif";
      ctx.fillText("| ittehadbd", 425, bottomBarY + 30);

      // "বিস্তারিত কমেন্টে" text (right side)
      ctx.fillStyle = "#cccccc";
      ctx.font = "14px sans-serif";
      const detailText = "✓ বিস্তারিত কমেন্টে";
      const dtW = ctx.measureText(detailText).width;
      ctx.fillText(detailText, SIZE - 30 - dtW, bottomBarY + 30);

      // Download
      const link = document.createElement("a");
      link.download = `${post.slug || "post"}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("ফটোকার্ড তৈরি করা সম্ভব হয়নি");
    }
  }, [post]);

  // Split content into paragraphs for in-post ad placement
  const contentParagraphs = post?.content?.split("\n").filter(Boolean) || [];
  const adInsertIndex = Math.min(3, Math.floor(contentParagraphs.length / 2));

  return (
    <Layout>
      {post && (
        <SEOHead
          title={(post as any).meta_title || post.title}
          description={(post as any).meta_description || (post as any).summary || post.content?.substring(0, 160) || ""}
          image={(post as any).og_image_url || post.image_url || undefined}
          type="article"
          publishedTime={post.created_at}
          author={(post as any).author_name || undefined}
        />
      )}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="animate-pulse bg-muted h-64 rounded" />
            ) : post ? (
              <article ref={cardRef} className="bg-card rounded-lg border shadow-sm">
                {/* Category badge - red */}
                <div className="px-6 pt-5">
                  {post.categories && (
                    <Link
                      to={`/posts?category=${post.categories.slug}`}
                      className="text-xs font-bold uppercase tracking-wide text-destructive hover:underline"
                    >
                      {post.categories.name}
                    </Link>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-foreground px-6 pt-2 pb-1 leading-snug">
                  {post.title}
                </h1>

                {/* Summary */}
                {(post as any).summary && (
                  <p className="text-base text-muted-foreground px-6 pb-3 border-b border-border leading-relaxed">
                    {(post as any).summary}
                  </p>
                )}

                {/* Meta info bar */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground px-6 py-3 border-b border-border">
                  {(post as any).author_name && (
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <User size={14} /> {(post as any).author_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.created_at).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {timeAgo(post.created_at)}
                  </span>
                </div>

                {/* Featured image with caption */}
                {post.image_url && (
                  <figure className="px-6 pt-4">
                    <img src={post.image_url} alt={post.title} className="w-full rounded-lg" />
                    {(post as any).image_caption && (
                      <figcaption className="text-xs text-destructive mt-2 italic">
                        {(post as any).image_caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Content with in-post ad */}
                <div className="prose max-w-none text-foreground px-6 py-4">
                  {contentParagraphs.map((paragraph, index) => (
                    <div key={index}>
                      <p className="mb-3 leading-relaxed text-[15px]">{paragraph}</p>
                      {index === adInsertIndex && <InPostAd />}
                    </div>
                  ))}
                </div>

                {/* Social Share */}
                <div className="border-t border-border px-6 py-4 space-y-3">
                  <SocialShare url={currentUrl} title={post.title} />
                  <Button variant="outline" size="sm" className="gap-2" onClick={generatePhotoCard}>
                    <Download size={14} /> ফটোকার্ড ডাউনলোড
                  </Button>
                </div>

                {/* Related Posts */}
                <div className="px-6 pb-6">
                  <RelatedPosts currentPostId={post.id} categoryId={post.category_id} />
                </div>
              </article>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                পোস্ট পাওয়া যায়নি
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostPage;
