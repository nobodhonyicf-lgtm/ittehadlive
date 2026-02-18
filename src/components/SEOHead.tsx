import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
  keywords?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_NAME = "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ";
const SITE_URL = "https://ittehad.bd";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/Jlhgp5SVlNRsWE1kL5rCoZMrbN23/uploads/1770800561345-ittehad_logo-01.png";

const SEOHead = ({
  title = SITE_NAME,
  description = "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন - রেজাল্ট, শিক্ষার্থী ডিরেক্টরি, শাখা তথ্য এবং আরো অনেক কিছু।",
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  publishedTime,
  author,
  keywords,
  noindex = false,
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title.includes("ইত্তেহাদুল") ? title : `${title} | ${SITE_NAME}`;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const canonicalUrl = url || (typeof window !== "undefined" ? `${SITE_URL}${window.location.pathname}` : "");

  // Default Organization JSON-LD (always present)
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": SITE_NAME,
    "description": "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন",
    "url": SITE_URL,
    "logo": DEFAULT_IMAGE,
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Bengali",
    },
  };

  // Website SearchAction JSON-LD
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "inLanguage": "bn",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/posts?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || "ittehad.bd"} />
      <meta name="language" content="Bengali" />
      <meta name="revisit-after" content="1 days" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="bn_BD" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
