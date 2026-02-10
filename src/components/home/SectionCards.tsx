import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, BookOpen, Briefcase, Megaphone, Mail, GraduationCap, Building2, Search } from "lucide-react";

const sections = [
  {
    title: "আমাদের সম্পর্কে",
    icon: Users,
    color: "from-primary/10 to-primary/5",
    links: [
      { label: "পরিচিতি", url: "/page/about" },
      { label: "ইতিহাস ও প্রতিষ্ঠা", url: "/page/about" },
      { label: "লক্ষ্য ও উদ্দেশ্য", url: "/page/about" },
      { label: "নীতিমালা ও দৃষ্টিভঙ্গি", url: "/page/about" },
    ],
  },
  {
    title: "শাখা সমূহ",
    icon: Building2,
    color: "from-accent/10 to-accent/5",
    links: [
      { label: "সকল শাখা দেখুন", url: "/branches" },
      { label: "শিক্ষার্থী ডিরেক্টরি", url: "/students" },
      { label: "নতুন শাখা আবেদন", url: "/contact" },
    ],
  },
  {
    title: "পরীক্ষা ও রেজাল্ট",
    icon: GraduationCap,
    color: "from-primary/10 to-accent/5",
    links: [
      { label: "রেজাল্ট চেক করুন", url: "/result" },
      { label: "পরীক্ষার সূচি", url: "/posts" },
      { label: "মার্কশিট ডাউনলোড", url: "/result" },
    ],
  },
  {
    title: "নেতৃত্ব ও কমিটি",
    icon: Users,
    color: "from-accent/10 to-primary/5",
    links: [
      { label: "সভাপতি", url: "/page/committee" },
      { label: "সাধারণ সম্পাদক", url: "/page/committee" },
      { label: "উপদেষ্টা কমিটি", url: "/page/advisors" },
      { label: "পরিচালনা বোর্ড", url: "/page/committee" },
    ],
  },
  {
    title: "কার্যক্রম",
    icon: Briefcase,
    color: "from-primary/10 to-primary/5",
    links: [
      { label: "শিক্ষা উন্নয়ন কমিটি", url: "/posts" },
      { label: "সেমিনার ও কর্মশালা", url: "/posts" },
      { label: "বৃত্তি ও প্রতিযোগিতা", url: "/posts" },
    ],
  },
  {
    title: "যোগাযোগ ও সহায়তা",
    icon: Mail,
    color: "from-accent/10 to-accent/5",
    links: [
      { label: "যোগাযোগ তথ্য", url: "/contact" },
      { label: "পরামর্শ ও সহায়তা", url: "/contact" },
      { label: "অনুদান ও সংযোজিত", url: "/contact" },
    ],
  },
];

const SectionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => (
        <Card key={section.title} className="hover:shadow-lg transition-all group overflow-hidden">
          <CardHeader className={`pb-3 bg-gradient-to-r ${section.color}`}>
            <CardTitle className="flex items-center gap-2 text-primary text-lg group-hover:text-accent transition-colors">
              <section.icon size={20} />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <ul className="space-y-2">
              {section.links.map((link, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent/60 shrink-0" />
                  <Link
                    to={link.url}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SectionCards;
