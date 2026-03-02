import { Link } from "react-router-dom";
import { Users, BookOpen, Briefcase, Mail, GraduationCap, Building2, Globe, Feather, Heart } from "lucide-react";
import SectionHeader from "./SectionHeader";

const sections = [
  {
    title: "আমাদের সম্পর্কে",
    icon: Users,
    gradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
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
    gradient: "from-orange-500/10 to-orange-500/5",
    iconBg: "bg-orange-500/15 text-orange-600",
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
    gradient: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-500/15 text-blue-600",
    links: [
      { label: "রেজাল্ট চেক করুন", url: "/result" },
      { label: "পরীক্ষার সূচি", url: "/posts" },
      { label: "মার্কশিট ডাউনলোড", url: "/result" },
    ],
  },
  {
    title: "নেতৃত্ব ও কমিটি",
    icon: Users,
    gradient: "from-cyan-600/10 to-cyan-600/5",
    iconBg: "bg-cyan-600/15 text-cyan-700",
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
    gradient: "from-purple-500/10 to-purple-500/5",
    iconBg: "bg-purple-500/15 text-purple-600",
    links: [
      { label: "শিক্ষা উন্নয়ন কমিটি", url: "/page/education-committee" },
      { label: "সেমিনার ও কর্মশালা", url: "/page/seminars" },
      { label: "বৃত্তি ও প্রতিযোগিতা", url: "/page/scholarships" },
    ],
  },
  {
    title: "যোগাযোগ ও সহায়তা",
    icon: Mail,
    gradient: "from-pink-500/10 to-pink-500/5",
    iconBg: "bg-pink-500/15 text-pink-600",
    links: [
      { label: "যোগাযোগ তথ্য", url: "/contact" },
      { label: "পরামর্শ ও সহায়তা", url: "/page/support" },
      { label: "অনুদান ও সংযোজিত", url: "/page/donations" },
    ],
  },
  {
    title: "গবেষণা ও প্রকাশনা",
    icon: Feather,
    gradient: "from-indigo-500/10 to-indigo-500/5",
    iconBg: "bg-indigo-500/15 text-indigo-600",
    links: [
      { label: "গবেষণা কার্যক্রম", url: "/page/research" },
      { label: "প্রকাশনা সমূহ", url: "/page/research" },
      { label: "বই ও পাঠ্যপুস্তক", url: "/books" },
    ],
  },
  {
    title: "আন্তর্জাতিক সম্পর্ক",
    icon: Globe,
    gradient: "from-teal-500/10 to-teal-500/5",
    iconBg: "bg-teal-500/15 text-teal-600",
    links: [
      { label: "আন্তর্জাতিক অংশীদার", url: "/page/international" },
      { label: "শিক্ষক বিনিময় কর্মসূচি", url: "/page/international" },
      { label: "যৌথ গবেষণা প্রকল্প", url: "/page/international" },
    ],
  },
  {
    title: "সাংস্কৃতিক কার্যক্রম",
    icon: Heart,
    gradient: "from-rose-500/10 to-rose-500/5",
    iconBg: "bg-rose-500/15 text-rose-600",
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
          <div key={section.title} className={`bg-gradient-to-br ${section.gradient} border border-border rounded-xl hover:shadow-lg transition-all group overflow-hidden`}>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${section.iconBg} flex items-center justify-center shrink-0`}>
                <section.icon size={18} />
              </div>
              <h3 className="text-foreground text-sm font-bold group-hover:text-primary transition-colors">
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
