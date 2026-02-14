import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePost } from "@/hooks/useData";
import Sidebar from "@/components/home/Sidebar";
import { Calendar, Share2, Facebook, Twitter, MessageCircle, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback } from "react";

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
    if (!post || !cardRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, "#1a7a3a");
      grad.addColorStop(1, "#0d5c2a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);

      // White card area
      ctx.fillStyle = "#ffffff";
      ctx.roundRect(40, 40, 1120, 550, 16);
      ctx.fill();

      // Title
      ctx.fillStyle = "#1a7a3a";
      ctx.font = "bold 36px sans-serif";
      const words = post.title.split(" ");
      let line = "";
      let y = 100;
      for (const word of words) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > 1040) {
          ctx.fillText(line, 80, y);
          line = word + " ";
          y += 48;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 80, y);

      // Content preview
      ctx.fillStyle = "#333333";
      ctx.font = "20px sans-serif";
      const content = (post.content || "").substring(0, 200);
      const cWords = content.split(" ");
      line = "";
      y += 60;
      for (const word of cWords) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > 1040) {
          ctx.fillText(line, 80, y);
          line = word + " ";
          y += 30;
          if (y > 480) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 80, y);

      // Footer
      ctx.fillStyle = "#1a7a3a";
      ctx.fillRect(40, 530, 1120, 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "18px sans-serif";
      ctx.fillText("ittehad.bd", 80, 568);
      ctx.fillText(new Date(post.created_at).toLocaleDateString("bn-BD"), 1000, 568);

      // Download
      const link = document.createElement("a");
      link.download = `${post.slug || "post"}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: simple alert
      alert("ফটোকার্ড তৈরি করা সম্ভব হয়নি");
    }
  }, [post]);

  return (
    <Layout>
      {/* OG Meta Tags via document head */}
      {post && (
        <title>{post.title} | ইত্তেহাদুল মাদারিস</title>
      )}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="animate-pulse bg-muted h-64 rounded" />
            ) : post ? (
              <article ref={cardRef} className="bg-card rounded-lg border p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-primary mb-3">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.created_at).toLocaleDateString("bn-BD")}
                  </span>
                  {(post as any).author_name && (
                    <span className="flex items-center gap-1">
                      <User size={14} /> {(post as any).author_name}
                    </span>
                  )}
                  {post.categories && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      {post.categories.name}
                    </span>
                  )}
                </div>
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-full rounded-lg mb-4" />
                )}
                <div className="prose max-w-none text-foreground whitespace-pre-wrap mb-6">
                  {post.content}
                </div>

                {/* Social Share */}
                <div className="border-t border-border pt-4 space-y-3">
                  <SocialShare url={currentUrl} title={post.title} />
                  <Button variant="outline" size="sm" className="gap-2" onClick={generatePhotoCard}>
                    <Download size={14} /> ফটোকার্ড ডাউনলোড
                  </Button>
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
