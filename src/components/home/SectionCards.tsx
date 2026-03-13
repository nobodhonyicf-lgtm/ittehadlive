import { Link } from "react-router-dom";
import { Users, BookOpen, Briefcase, Mail, GraduationCap, Building2, Globe, Feather, Heart, ChevronRight } from "lucide-react";
import SectionHeader from "./SectionHeader";

const sections = [
  {
    title: "আমাদের সম্পর্কে",
    icon: Users,
    links: [
      { label: "পরিচিতি", url: "/page/about" },
      { label: "ইতিহাস ও প্রতিষ্ঠা", url: "/page/history" },
      { label: "লক্ষ্য ও উদ্দেশ্য", url: "/page/objectives" },
      { label: "নীতিমালা ও দৃষ্টিভঙ্গি", url: "/page/policy" },
    ],
  },
  {
    title: "শাখা সমূহ",
    icon: Building2,
    links: [
      { label: "সকল শাখা দেখুন", url: "/branches" },
      { label: "শিক্ষার্থী ডিরেক্টরি", url: "/students" },
      { label: "শিক্ষক সার্ভিস সেন্টার", url: "/teachers" },
      { label: "নতুন শাখা আবেদন", url: "/contact" },
    ],
  },
  {
    title: "পরীক্ষা ও রেজাল্ট",
    icon: GraduationCap,
    links: [
      { label: "রেজাল্ট চেক করুন", url: "/result" },
      { label: "পরীক্ষার সূচি", url: "/posts" },
      { label: "মার্কশিট ডাউনলোড", url: "/result" },
    ],
  },
  {
    title: "নেতৃত্ব ও কমিটি",
    icon: Users,
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
    links: [
      { label: "শিক্ষা উন্নয়ন কমিটি", url: "/page/education-committee" },
      { label: "সেমিনার ও কর্মশালা", url: "/page/seminars" },
      { label: "বৃত্তি ও প্রতিযোগিতা", url: "/page/scholarships" },
    ],
  },
  {
    title: "যোগাযোগ ও সহায়তা",
    icon: Mail,
    links: [
      { label: "যোগাযোগ তথ্য", url: "/contact" },
      { label: "পরামর্শ ও সহায়তা", url: "/page/support" },
      { label: "অনুদান ও সংযোজিত", url: "/page/donations" },
    ],
  },
  {
    title: "গবেষণা ও প্রকাশনা",
    icon: Feather,
    links: [
      { label: "গবেষণা কার্যক্রম", url: "/page/research" },
      { label: "প্রকাশনা সমূহ", url: "/page/research" },
      { label: "বই ও পাঠ্যপুস্তক", url: "/books" },
    ],
  },
  {
    title: "আন্তর্জাতিক সম্পর্ক",
    icon: Globe,
    links: [
      { label: "আন্তর্জাতিক অংশীদার", url: "/page/international" },
      { label: "শিক্ষক বিনিময় কর্মসূচি", url: "/page/international" },
      { label: "যৌথ গবেষণা প্রকল্প", url: "/page/international" },
    ],
  },
  {
    title: "সাংস্কৃতিক কার্যক্রম",
    icon: Heart,
    links: [
      { label: "ইসলামী সাংস্কৃতিক সপ্তাহ", url: "/page/cultural" },
      { label: "কুরআন তিলাওয়াত মাহফিল", url: "/page/cultural" },
      { label: "গ্যালারী", url: "/page/cultural" },
    ],
  },
];

const SectionCards = () => {
  return (
    <div>
      <SectionHeader title="বিভাগসমূহ" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-card border border-border rounded-xl hover:shadow-md transition-all duration-200 group overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <section.icon size={16} />
              </div>
              <h3 className="text-foreground text-sm font-bold group-hover:text-primary transition-colors">
                {section.title}
              </h3>
            </div>
            <div className="px-4 py-3">
              <ul className="space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.url}
                      className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-all py-1.5 group/link"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30 group-hover/link:bg-primary transition-colors" />
                        {link.label}
                      </span>
                      <ChevronRight size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionCards;
