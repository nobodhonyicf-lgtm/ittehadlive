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
    "@id": `${SITE_URL}/#organization`,
    "name": SITE_NAME,
    "alternateName": ["ইত্তেহাদ", "Ittehadul Madarisil Khususiyyah", "IMKB", "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ বাংলাদেশ"],
    "description": "প্রাইভেট মাদরাসাগুলোর মধ্যে ভ্রাতৃত্ব ও সহযোগিতার বন্ধন দৃঢ় করা, দক্ষ শিক্ষক ও আদর্শ ছাত্র তৈরি এবং সামাজিক উন্নয়নে ঐক্যবদ্ধভাবে কাজ করার লক্ষ্যে প্রতিষ্ঠিত প্রাইভেট মাদরাসাগুলোর সমন্বিত সংগঠন।",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": DEFAULT_IMAGE,
      "width": 512,
      "height": 512,
    },
    "image": DEFAULT_IMAGE,
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "name": "নারায়ণগঞ্জ, বাংলাদেশ",
    },
    "founder": [
      {
        "@type": "Person",
        "name": "মাহমুদুল হাসান খান",
        "jobTitle": "প্রতিষ্ঠাতা সভাপতি",
        "sameAs": "https://share.google/AYdOE7ggKBL8ww5Bc",
      },
      {
        "@type": "Person",
        "name": "হাফেজ মাওলানা সাইফুল ইসলাম সাইফ",
        "jobTitle": "সহ-প্রতিষ্ঠাতা",
      },
      {
        "@type": "Person",
        "name": "মাওলানা মামুনুর রশীদ",
        "jobTitle": "সহ-প্রতিষ্ঠাতা",
      },
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "২১১/১ আরামবাগ, গোদনাইল, সিদ্ধিরগঞ্জ",
      "addressLocality": "নারায়ণগঞ্জ",
      "addressRegion": "ঢাকা বিভাগ",
      "postalCode": "1432",
      "addressCountry": "BD",
    },
    "sameAs": [
      "https://www.facebook.com/ittehadbd",
      "https://www.youtube.com/@ittehadbd",
      "https://twitter.com/ittehadbd",
      "https://www.instagram.com/ittehadbd",
      "https://www.tiktok.com/@ittehadbd",
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+8801856878690",
        "contactType": "customer service",
        "availableLanguage": ["Bengali", "Arabic"],
        "areaServed": "BD",
      },
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Bangladesh",
    },
    "knowsAbout": ["Islamic Education", "Madrasa", "Private Madrasa Coordination", "কওমী মাদরাসা", "হিফজুল কুরআন", "ইসলামী শিক্ষা"],
    "slogan": "প্রাইভেট মাদরাসাগুলোর সমন্বিত সংগঠন",
    "legalName": "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ বাংলাদেশ",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "সেবাসমূহ",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "পরীক্ষার ফলাফল প্রকাশনা" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "শিক্ষার্থী ডিরেক্টরি" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "শাখা সমন্বয় ও তথ্য ব্যবস্থাপনা" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "শিক্ষক নিয়োগ সেবা" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "ইসলামী কন্টেন্ট লাইব্রেরি" } },
      ],
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
