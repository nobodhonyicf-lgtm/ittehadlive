import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import { useIsApp } from "@/hooks/useIsApp";

const FAQPage = () => {
  const isApp = useIsApp();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const categories = ["all", ...Array.from(new Set(faqs?.map(faq => faq.category).filter(Boolean)))];
  
  const filteredFaqs = activeCategory === "all" 
    ? faqs 
    : faqs?.filter(faq => faq.category === activeCategory);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs?.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    })) || []
  };

  const PageContent = () => (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <SEOHead 
        title="সাধারণ জিজ্ঞাসা (FAQ) | ইত্তেহাদুল মাদারিস"
        description="ইত্তেহাদুল মাদারিস বাংলাদেশ সম্পর্কে আপনাদের সাধারণ জিজ্ঞাসার উত্তরগুলো জানুন।"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">সাধারণ জিজ্ঞাসা (FAQ)</h1>
        <p className="text-muted-foreground">আপনাদের সাধারণ প্রশ্নগুলোর উত্তর এখানে দেওয়া হলো</p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category || 'unnamed'}
              onClick={() => setActiveCategory(category || 'all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {category === "all" ? "সকল প্রশ্ন" : category}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredFaqs?.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="bg-card border rounded-xl overflow-hidden shadow-sm px-2">
              <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
          {filteredFaqs?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              কোনো প্রশ্ন পাওয়া যায়নি।
            </div>
          )}
        </Accordion>
      )}
    </div>
  );

  return isApp ? (
    <AppLayout title="সাধারণ জিজ্ঞাসা (FAQ)">
      <PageContent />
    </AppLayout>
  ) : (
    <Layout>
      <PageContent />
    </Layout>
  );
};

export default FAQPage;
