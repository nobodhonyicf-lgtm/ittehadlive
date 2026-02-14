import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
}

const SEOHead = ({
  title = "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ",
  description = "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন",
  image = "https://storage.googleapis.com/gpt-engineer-file-uploads/Jlhgp5SVlNRsWE1kL5rCoZMrbN23/uploads/1770800561345-ittehad_logo-01.png",
  url,
  type = "website",
  publishedTime,
  author,
}: SEOHeadProps) => {
  const fullTitle = title.includes("ইত্তেহাদুল") ? title : `${title} | ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ`;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ" />
      <meta property="og:locale" content="bn_BD" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}
    </Helmet>
  );
};

export default SEOHead;
