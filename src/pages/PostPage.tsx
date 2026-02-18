import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePost, useAds } from "@/hooks/useData";
import { Calendar, Share2, Facebook, Twitter, MessageCircle, Download, User, Clock, Image, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toBengali } from "@/lib/bengali";
import { timeAgo } from "@/lib/timeAgo";
import SEOHead from "@/components/SEOHead";
import RelatedPosts from "@/components/post/RelatedPosts";
import InPostAd from "@/components/post/InPostAd";
import PhotoCardEditor from "@/components/post/PhotoCardEditor";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageSidebar from "@/components/home/PageSidebar";
import { useIsApp } from "@/hooks/useIsApp";

const SocialShare = ({ url, title, slug }: { url: string; title: string; slug?: string }) => {
  const encodedTitle = encodeURIComponent(title);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const ogUrl = slug ? `${supabaseUrl}/functions/v1/og-meta?slug=${encodeURIComponent(slug)}` : url;
  const encodedOgUrl = encodeURIComponent(ogUrl);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1 shrink-0"><Share2 size={14} /> শেয়ার:</span>
      <div className="flex items-center gap-2">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedOgUrl}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#1877F2] text-white px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
          <Facebook size={14} /> Facebook
        </a>
        <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
          <MessageCircle size={14} /> WhatsApp
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#1DA1F2] text-white px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
          <Twitter size={14} /> Twitter
        </a>
      </div>
    </div>
  );
};

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePost(slug || "");
  const [photoCardOpen, setPhotoCardOpen] = useState(false);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const isApp = useIsApp();

  // Split content into paragraphs for in-post ad placement
  const contentParagraphs = post?.content?.split("\n").filter(Boolean) || [];
  const adInsertIndex = Math.min(3, Math.floor(contentParagraphs.length / 2));

  // Article JSON-LD for Google
  const articleJsonLd = post ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": (post as any).meta_description || (post as any).summary || post.content?.substring(0, 160) || "",
    "image": [(post as any).og_image_url || post.image_url || ""].filter(Boolean),
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": (post as any).author_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ",
    },
    "publisher": {
      "@type": "Organization",
      "name": "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://storage.googleapis.com/gpt-engineer-file-uploads/Jlhgp5SVlNRsWE1kL5rCoZMrbN23/uploads/1770800561345-ittehad_logo-01.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ittehad.bd/post/${post.slug}`,
    },
    ...(post.categories ? { "articleSection": post.categories.name } : {}),
  } : undefined;

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = post ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "হোম", "item": "https://ittehad.bd" },
      { "@type": "ListItem", "position": 2, "name": "সকল পোস্ট", "item": "https://ittehad.bd/posts" },
      ...(post.categories ? [{ "@type": "ListItem", "position": 3, "name": post.categories.name, "item": `https://ittehad.bd/posts?category=${post.categories.slug}` }] : []),
      { "@type": "ListItem", "position": post.categories ? 4 : 3, "name": post.title },
    ],
  } : undefined;

  const jsonLdArray = [articleJsonLd, breadcrumbJsonLd].filter(Boolean);

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
          keywords={`${post.title}, ${post.categories?.name || ""}, ইত্তেহাদ, মাদরাসা`}
          jsonLd={jsonLdArray}
        />
      )}
      <div className="px-4 py-6">
        <Breadcrumbs items={[
          { label: "সকল পোস্ট", href: "/posts" },
          ...(post?.categories ? [{ label: post.categories.name, href: `/posts?category=${post.categories.slug}` }] : []),
          ...(post ? [{ label: post.title }] : []),
        ]} />
        <div className={`grid grid-cols-1 ${isApp ? '' : 'lg:grid-cols-3'} gap-6`}>
          <div className={isApp ? '' : 'lg:col-span-2'}>
            {isLoading ? (
              <div className="animate-pulse bg-muted h-64 rounded" />
            ) : post ? (
              <article className="bg-card rounded-lg border shadow-sm" itemScope itemType="https://schema.org/NewsArticle">
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
                <h1 className="text-2xl md:text-3xl font-bold text-foreground px-6 pt-2 pb-1 leading-snug" itemProp="headline">
                  {post.title}
                </h1>

                {/* Summary */}
                {(post as any).summary && (
                  <p className="text-base text-muted-foreground px-6 pb-3 border-b border-border leading-relaxed" itemProp="description">
                    {(post as any).summary}
                  </p>
                )}

                {/* Meta info bar */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground px-6 py-3 border-b border-border">
                  {(post as any).author_name && (
                    <span className="flex items-center gap-1 font-medium text-foreground" itemProp="author">
                      <User size={14} /> {(post as any).author_name}
                    </span>
                  )}
                  <time className="flex items-center gap-1" itemProp="datePublished" dateTime={post.created_at}>
                    <Calendar size={14} />
                    {new Date(post.created_at).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {timeAgo(post.created_at)}
                  </span>
                </div>

                {/* Featured image with caption */}
                {post.image_url && (
                  <figure className="px-6 pt-4">
                    <img src={post.image_url} alt={post.title} className="w-full rounded-lg" itemProp="image" />
                    {(post as any).image_caption && (
                      <figcaption className="flex items-center gap-0 mt-0 text-sm bg-muted">
                        <span className="font-bold text-foreground px-3 py-1.5 shrink-0">ছবি</span>
                        <span className="w-0.5 h-5 bg-destructive shrink-0" />
                        <span className="text-foreground px-3 py-1.5">{(post as any).image_caption}</span>
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Content with in-post ad */}
                <div className="prose max-w-none text-foreground px-6 py-4" itemProp="articleBody">
                  {contentParagraphs.map((paragraph, index) => {
                    if (paragraph.startsWith("📖 ")) {
                      const titleText = paragraph.replace("📖 আরও পড়ুন: ", "").replace("📖 ", "").trim();
                      const nextLine = contentParagraphs[index + 1];
                      const linkPath = nextLine?.startsWith("🔗 ") ? nextLine.replace("🔗 ", "").trim() : null;
                      return (
                        <div key={index} className="my-4">
                          <Link
                            to={linkPath || "#"}
                            className="flex items-center gap-0 bg-muted rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow group no-underline"
                          >
                            <div className="flex-1 px-4 py-3">
                              <p className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug m-0">
                                {titleText}
                              </p>
                            </div>
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 m-3 rounded shrink-0 whitespace-nowrap">
                              আরো পড়ুন
                            </span>
                          </Link>
                          {index === adInsertIndex && <InPostAd />}
                        </div>
                      );
                    }
                    if (paragraph.startsWith("🔗 ")) {
                      return null;
                    }
                    return (
                      <div key={index}>
                        <p className="mb-3 leading-relaxed text-[15px]">{paragraph}</p>
                        {index === adInsertIndex && <InPostAd />}
                      </div>
                    );
                  })}
                </div>

                {/* Social Share */}
                <div className="border-t border-border px-6 py-4 space-y-3">
                  <SocialShare url={currentUrl} title={post.title} slug={post.slug} />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setPhotoCardOpen(true)}>
                    <Image size={14} /> ফটোকার্ড তৈরি করুন
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
          {!isApp && (
            <div className="lg:col-span-1">
              <PageSidebar />
            </div>
          )}
        </div>
      </div>
      {post && (
        <PhotoCardEditor
          open={photoCardOpen}
          onOpenChange={setPhotoCardOpen}
          editMode={false}
          post={{
            title: post.title,
            slug: post.slug,
            image_url: post.image_url,
            image_caption: (post as any).image_caption || null,
            created_at: post.created_at,
            category_name: post.categories?.name || null,
          }}
        />
      )}
    </Layout>
  );
};

export default PostPage;
