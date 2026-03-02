import { Link } from "react-router-dom";
import { Users, BookOpen, Briefcase, Mail, GraduationCap, Building2, Globe, Feather, Heart } from "lucide-react";
import SectionHeader from "./SectionHeader";

const sections = [
  {
    title: "আমাদের সম্পর্কে",
    icon: Users,
    accent: "border-l-primary",
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
    accent: "border-l-orange-500",
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
    accent: "border-l-blue-500",
    links: [
      { label: "রেজাল্ট চেক করুন", url: "/result" },
      { label: "পরীক্ষার সূচি", url: "/posts" },
      { label: "মার্কশিট ডাউনলোড", url: "/result" },
    ],
  },
  {
    title: "নেতৃত্ব ও কমিটি",
    icon: Users,
    accent: "border-l-cyan-600",
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
    accent: "border-l-purple-500",
    links: [
      { label: "শিক্ষা উন্নয়ন কমিটি", url: "/page/education-committee" },
      { label: "সেমিনার ও কর্মশালা", url: "/page/seminars" },
      { label: "বৃত্তি ও প্রতিযোগিতা", url: "/page/scholarships" },
    ],
  },
  {
    title: "যোগাযোগ ও সহায়তা",
    icon: Mail,
    accent: "border-l-pink-500",
    links: [
      { label: "যোগাযোগ তথ্য", url: "/contact" },
      { label: "পরামর্শ ও সহায়তা", url: "/page/support" },
      { label: "অনুদান ও সংযোজিত", url: "/page/donations" },
    ],
  },
  {
    title: "গবেষণা ও প্রকাশনা",
    icon: Feather,
    accent: "border-l-indigo-500",
    links: [
      { label: "গবেষণা কার্যক্রম", url: "/page/research" },
      { label: "প্রকাশনা সমূহ", url: "/page/research" },
      { label: "বই ও পাঠ্যপুস্তক", url: "/books" },
    ],
  },
  {
    title: "আন্তর্জাতিক সম্পর্ক",
    icon: Globe,
    accent: "border-l-teal-500",
    links: [
      { label: "আন্তর্জাতিক অংশীদার", url: "/page/international" },
      { label: "শিক্ষক বিনিময় কর্মসূচি", url: "/page/international" },
      { label: "যৌথ গবেষণা প্রকল্প", url: "/page/international" },
    ],
  },
  {
    title: "সাংস্কৃতিক কার্যক্রম",
    icon: Heart,
    accent: "border-l-rose-500",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className={`bg-card border border-border rounded-xl hover:shadow-md transition-all group overflow-hidden border-l-[3px] ${section.accent}`}>
            <div className="px-4 py-3">
              <h3 className="flex items-center gap-2 text-foreground text-sm font-bold group-hover:text-primary transition-colors">
                <section.icon size={17} className="text-primary" />
                {section.title}
              </h3>
            </div>
            <div className="px-4 pb-3">
              <ul className="space-y-1.5">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.url}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:pl-1 transition-all py-0.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary/50 shrink-0 transition-colors" />
                      {link.label}
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
