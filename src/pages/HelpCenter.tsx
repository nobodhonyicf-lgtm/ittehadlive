import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import { Card, CardContent } from "@/components/ui/card";
import {
  HelpCircle, MessageSquare, Shield, Phone, Mail, Book, Users, GraduationCap,
  Building2, FileText, Briefcase, ClipboardList
} from "lucide-react";

const helpSections = [
  {
    title: "সাধারণ জিজ্ঞাসা",
    description: "সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন ও উত্তর",
    icon: HelpCircle,
    path: "/faq",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "যোগাযোগ করুন",
    description: "সরাসরি আমাদের সাথে যোগাযোগ করুন",
    icon: Phone,
    path: "/contact",
    color: "bg-green-50 text-green-600",
  },
  {
    title: "শাখা যাচাই",
    description: "অধিভুক্ত শাখার সত্যতা নিশ্চিত করুন",
    icon: Shield,
    path: "/verify?type=branch",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "রেজাল্ট দেখুন",
    description: "পরীক্ষার ফলাফল অনুসন্ধান করুন",
    icon: GraduationCap,
    path: "/result",
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "শিক্ষক সার্ভিস সেন্টার",
    description: "শিক্ষক নিবন্ধন ও চাকরি সংক্রান্ত তথ্য",
    icon: Users,
    path: "/teachers",
    color: "bg-teal-50 text-teal-600",
  },
  {
    title: "প্রতিষ্ঠান নিবন্ধন",
    description: "নতুন প্রতিষ্ঠান/শাখা যুক্ত করুন",
    icon: Building2,
    path: "/institution-register",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "শিক্ষার্থী ডিরেক্টরি",
    description: "নিবন্ধিত শিক্ষার্থীদের তথ্য দেখুন",
    icon: ClipboardList,
    path: "/students",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "শর্তাবলী ও গোপনীয়তা",
    description: "আমাদের নীতিমালা ও শর্তসমূহ",
    icon: FileText,
    path: "/terms",
    color: "bg-gray-50 text-gray-600",
  },
];

const HelpCenter = () => {
  const isApp = useIsApp();

  const pageContent = (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <SEOHead
        title="সহায়তা কেন্দ্র | ইত্তেহাদুল মাদারিস"
        description="ইত্তেহাদুল মাদারিস সম্পর্কিত যেকোনো সহায়তা, তথ্য এবং প্রশ্নের উত্তর পান।"
      />

      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">সহায়তা কেন্দ্র</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          আপনার প্রয়োজন অনুযায়ী নিচের বিভাগ থেকে সহায়তা নিন। কোনো প্রশ্ন থাকলে সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {helpSections.map((section) => (
          <Link key={section.path} to={section.path}>
            <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border cursor-pointer h-full">
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${section.color} shrink-0`}>
                  <section.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Emergency Contact */}
      <Card className="mt-8 border-primary/20 bg-primary/5">
        <CardContent className="p-5 text-center">
          <h3 className="font-bold text-sm mb-2">জরুরি যোগাযোগ</h3>
          <p className="text-xs text-muted-foreground mb-3">
            জরুরি প্রয়োজনে সরাসরি আমাদের অফিসে যোগাযোগ করুন।
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:01926428988" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Phone size={14} /> ০১৯২৬-৪২৮৯৮৮
            </a>
            <a href="mailto:info@ittehad.bd" className="inline-flex items-center gap-1.5 px-4 py-2 bg-card border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              <Mail size={14} /> ইমেইল করুন
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return isApp ? <AppLayout>{pageContent}</AppLayout> : <Layout>{pageContent}</Layout>;
};

export default HelpCenter;
