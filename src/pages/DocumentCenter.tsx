import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Shield, BookOpen, Scale, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const documents = [
  {
    title: "সংবিধান ও নীতিমালা",
    description: "ইত্তেহাদুল মাদারিসের সংবিধান, গঠনতন্ত্র এবং মূল নীতিমালা।",
    icon: Scale,
    category: "নীতিমালা",
    status: "শীঘ্রই আসছে",
  },
  {
    title: "পরীক্ষা নীতিমালা",
    description: "কেন্দ্রীয় ও শাখা পর্যায়ের পরীক্ষা পরিচালনা সংক্রান্ত নিয়মাবলী।",
    icon: BookOpen,
    category: "শিক্ষা",
    status: "শীঘ্রই আসছে",
  },
  {
    title: "শাখা নিবন্ধন নীতিমালা",
    description: "নতুন শাখা অন্তর্ভুক্তি, নবায়ন এবং পরিচালনা সংক্রান্ত নিয়মাবলী।",
    icon: Shield,
    category: "প্রশাসনিক",
    status: "শীঘ্রই আসছে",
  },
  {
    title: "গোপনীয়তা নীতি",
    description: "আপনার ব্যক্তিগত তথ্যের সুরক্ষা সম্পর্কিত নীতিমালা।",
    icon: Shield,
    category: "আইনি",
    link: "/privacy",
  },
  {
    title: "ব্যবহারের শর্তাবলী",
    description: "ওয়েবসাইট ও অ্যাপ ব্যবহারের শর্ত ও নিয়মাবলী।",
    icon: FileText,
    category: "আইনি",
    link: "/terms",
  },
];

const DocumentCenter = () => {
  const isApp = useIsApp();

  const PageContent = () => (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <SEOHead
        title="দলিলপত্র ও নীতিমালা | ইত্তেহাদুল মাদারিস"
        description="ইত্তেহাদুল মাদারিসের সংবিধান, নীতিমালা, এবং অফিসিয়াল দলিলপত্র।"
      />

      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">দলিলপত্র ও নীতিমালা</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          ইত্তেহাদুল মাদারিসের অফিসিয়াল দলিলপত্র, নীতিমালা এবং নির্দেশিকাসমূহ।
        </p>
      </div>

      <div className="space-y-3">
        {documents.map((doc, i) => (
          <Card key={i} className="group hover:shadow-md transition-all duration-300 border">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <doc.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {doc.category}
                  </Badge>
                </div>
                <div className="mt-2">
                  {doc.link ? (
                    <Link to={doc.link} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Eye size={12} /> দেখুন
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Download size={12} /> {doc.status}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">
            কোনো দলিল বা নীতিমালা সংক্রান্ত প্রশ্ন থাকলে{" "}
            <Link to="/contact" className="text-primary hover:underline font-medium">যোগাযোগ করুন</Link>।
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return isApp ? <AppLayout><PageContent /></AppLayout> : <Layout><PageContent /></Layout>;
};

export default DocumentCenter;
