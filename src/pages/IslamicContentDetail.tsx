import { useParams, Link, useLocation } from "react-router-dom";
import { useIslamicContents } from "@/hooks/useData";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BookOpen, HelpCircle, CheckCircle, PenLine, Languages, Share2, ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useMemo } from "react";

const categoryMeta: Record<string, { label: string; emoji: string; gradient: string; route: string }> = {
  quran: { label: "কুরআন", emoji: "📖", gradient: "from-emerald-800 to-teal-700", route: "/quran" },
  hadith: { label: "হাদিস", emoji: "📚", gradient: "from-sky-800 to-blue-700", route: "/hadith" },
  dua: { label: "দোয়া", emoji: "🤲", gradient: "from-indigo-800 to-purple-700", route: "/dua" },
  masala: { label: "মাসআলা", emoji: "⚖", gradient: "from-rose-800 to-red-700", route: "/masala" },
};

const IslamicContentDetail = () => {
  const { category: paramCategory, id } = useParams<{ category: string; id: string }>();
  const location = useLocation();
  // Extract category from URL path (e.g., /masala/abc -> masala)
  const category = paramCategory || location.pathname.split("/")[1];
  const { data: allContents, isLoading } = useIslamicContents();
  const isApp = useIsApp();

  const item = useMemo(() => {
    if (!allContents || !id) return null;
    return (allContents as any[]).find((c) => c.id === id);
  }, [allContents, id]);

  const relatedItems = useMemo(() => {
    if (!allContents || !item) return [];
    return (allContents as any[])
      .filter((c) => c.category === item.category && c.id !== item.id)
      .slice(0, 6);
  }, [allContents, item]);

  const meta = category ? categoryMeta[category] : null;

  if (isLoading) {
    return isApp ? (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    ) : (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!item || !meta) {
    const Wrapper = isApp ? AppLayout : Layout;
    return (
      <Wrapper>
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">😕</p>
          <p className="font-medium">কন্টেন্ট পাওয়া যায়নি</p>
          <Link to={meta?.route || "/"} className="text-primary text-sm mt-2 inline-block">← ফিরে যান</Link>
        </div>
      </Wrapper>
    );
  }

  const pageTitle = `${meta.label}: ${item.title}`;
  const pageDescription = item.meaning || item.question || item.content?.substring(0, 160) || "";
  const shareUrl = `https://ittehad.bd/${category}/${id}`;

  // JSON-LD structured data
  const jsonLd: any[] = [];

  if (category === "masala" && item.question) {
    // FAQPage schema for masala
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.meaning || item.content,
          },
        },
      ],
    });
  }

  // Article schema for all
  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageTitle,
    "description": pageDescription.substring(0, 200),
    "author": {
      "@type": "Organization",
      "name": "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ",
    },
    "publisher": {
      "@type": "Organization",
      "name": "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://storage.googleapis.com/gpt-engineer-file-uploads/Jlhgp5SVlNRsWE1kL5rCoZMrbN23/uploads/1770800561345-ittehad_logo-01.png",
      },
    },
    "datePublished": item.created_at,
    "dateModified": item.updated_at || item.created_at,
    "mainEntityOfPage": shareUrl,
    "inLanguage": "bn",
  });

  // BreadcrumbList
  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "হোম", "item": "https://ittehad.bd" },
      { "@type": "ListItem", "position": 2, "name": meta.label, "item": `https://ittehad.bd${meta.route}` },
      { "@type": "ListItem", "position": 3, "name": item.title },
    ],
  });

  const handleShare = () => {
    const shareText = `${meta.label}: ${item.title}\n${pageDescription.substring(0, 100)}`;
    if (typeof navigator.share === "function") {
      navigator.share({ title: pageTitle, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("লিংক কপি হয়েছে!");
    }
  };

  const content = (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="px-4 pt-3">
        <Breadcrumbs items={[{ label: meta.label, href: meta.route }, { label: item.title }]} />
      </div>

      {/* Header */}
      <div className={`bg-gradient-to-br ${meta.gradient} text-white p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
        }} />
        <div className="relative">
          <Link to={meta.route} className="inline-flex items-center gap-1 text-xs opacity-80 hover:opacity-100 mb-3">
            <ArrowLeft size={14} /> {meta.label} তালিকা
          </Link>
          <h1 className="text-xl font-bold">{meta.emoji} {item.title}</h1>
          {item.subcategory && (
            <span className="inline-block mt-2 text-xs bg-white/20 px-3 py-1 rounded-full">{item.subcategory}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <article className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
        {/* Question (masala) */}
        {item.question && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1"><HelpCircle size={14} /> প্রশ্ন</p>
            <p className="text-sm font-medium leading-relaxed">{item.question}</p>
          </div>
        )}

        {/* Arabic content */}
        {item.content && category !== "masala" && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-bold text-emerald-700 mb-3 flex items-center gap-1"><BookOpen size={14} /> আরবি</p>
            <p className="font-arabic font-bold leading-[2.5] text-right text-foreground text-2xl" dir="rtl">
              {item.content}
            </p>
          </div>
        )}

        {/* Masala answer content */}
        {category === "masala" && item.content && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1"><CheckCircle size={14} /> উত্তর</p>
            <p className="text-sm leading-relaxed text-foreground">{item.content}</p>
          </div>
        )}

        {/* Transliteration */}
        {item.transliteration && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs font-bold text-muted-foreground mb-1 flex items-center gap-1"><Languages size={14} /> উচ্চারণ</p>
            <p className="text-sm italic text-foreground">{item.transliteration}</p>
          </div>
        )}

        {/* Meaning */}
        {item.meaning && category !== "masala" && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1"><PenLine size={14} /> অর্থ / বঙ্গানুবাদ</p>
            <p className="text-sm text-foreground leading-relaxed">{item.meaning}</p>
          </div>
        )}

        {/* Masala detailed meaning */}
        {item.meaning && category === "masala" && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1"><PenLine size={14} /> বিস্তারিত ব্যাখ্যা</p>
            <p className="text-sm text-foreground leading-relaxed">{item.meaning}</p>
          </div>
        )}

        {/* Source */}
        {(item.source || item.reference) && (
          <div className="text-sm text-muted-foreground italic flex items-center gap-1 border-t border-border pt-4">
            <BookOpen size={14} /> সূত্র: {item.reference || item.source}
          </div>
        )}

        {/* Share */}
        <div className="border-t border-border pt-4">
          <button onClick={handleShare} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Share2 size={14} /> শেয়ার করুন
          </button>
        </div>

        {/* Related content */}
        {relatedItems.length > 0 && (
          <div className="border-t border-border pt-6">
            <h2 className="text-base font-bold mb-3">আরও {meta.label}</h2>
            <div className="space-y-2">
              {relatedItems.map((r: any) => (
                <Link
                  key={r.id}
                  to={`/${r.category}/${r.id}`}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:border-primary transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    {r.meaning && <p className="text-xs text-muted-foreground truncate mt-0.5">{r.meaning}</p>}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
            <Link to={meta.route} className="block text-center text-sm text-primary font-medium mt-4 hover:underline">
              সব {meta.label} দেখুন →
            </Link>
          </div>
        )}
      </article>
    </div>
  );

  if (isApp) {
    return (
      <AppLayout>
        <SEOHead
          title={pageTitle}
          description={pageDescription.substring(0, 160)}
          url={shareUrl}
          type="article"
          keywords={`${meta.label}, ${item.title}, ${item.subcategory || ""}, ইসলাম, ইসলামী, বাংলা`}
          jsonLd={jsonLd}
        />
        {content}
      </AppLayout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={pageTitle}
        description={pageDescription.substring(0, 160)}
        url={shareUrl}
        type="article"
        keywords={`${meta.label}, ${item.title}, ${item.subcategory || ""}, ইসলাম, ইসলামী, বাংলা`}
        jsonLd={jsonLd}
      />
      {content}
    </Layout>
  );
};

export default IslamicContentDetail;
