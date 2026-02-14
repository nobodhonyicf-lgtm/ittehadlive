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
    if (!post || !cardRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, "#1a7a3a");
      grad.addColorStop(1, "#0d5c2a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);
      ctx.fillStyle = "#ffffff";
      ctx.roundRect(40, 40, 1120, 550, 16);
      ctx.fill();
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
      ctx.fillStyle = "#1a7a3a";
      ctx.fillRect(40, 530, 1120, 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "18px sans-serif";
      ctx.fillText("ittehad.bd", 80, 568);
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
