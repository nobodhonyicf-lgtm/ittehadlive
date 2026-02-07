import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, BookOpen, Briefcase, Megaphone, Mail, GraduationCap } from "lucide-react";

const sections = [
  {
    title: "আমাদের সম্পর্কে",
    icon: Users,
    links: [
      { label: "পরিচিতি", url: "/page/about" },
      { label: "ইতিহাস ও প্রতিষ্ঠা", url: "/page/about" },
      { label: "লক্ষ্য ও উদ্দেশ্য", url: "/page/about" },
      { label: "নীতিমালা ও দৃষ্টিভঙ্গি", url: "/page/about" },
    ],
  },
  {
    title: "নেতৃত্ব ও কমিটি",
    icon: GraduationCap,
    links: [
      { label: "সভাপতি", url: "/page/committee" },
      { label: "সাধারণ সম্পাদক", url: "/page/committee" },
      { label: "উপদেষ্টা কমিটি", url: "/page/advisors" },
      { label: "পরিচালনা বোর্ড", url: "/page/committee" },
    ],
  },
  {
    title: "সদস্য মাদরাসা",
    icon: BookOpen,
    links: [
      { label: "সদস্য তালিকা", url: "/page/about" },
      { label: "নতুন সদস্য আবেদন", url: "/contact" },
      { label: "সদস্য নীতিমালা", url: "/page/about" },
      { label: "অন্তর্ভুক্তিক মাদরাসা", url: "/page/about" },
    ],
  },
  {
    title: "কার্যক্রম",
    icon: Briefcase,
    links: [
      { label: "শিক্ষা উন্নয়ন কমিটি", url: "/posts" },
      { label: "সেমিনার ও কর্মশালা", url: "/posts" },
      { label: "বৃত্তি ও প্রতিযোগিতা", url: "/posts" },
      { label: "সামাজিক ও মানবিক কার্যক্রম", url: "/posts" },
    ],
  },
  {
    title: "দাওয়াহ ও প্রকাশনা",
    icon: Megaphone,
    links: [
      { label: "দাওয়াহ কার্যক্রম", url: "/posts" },
      { label: "প্রচার ও প্রকাশনা", url: "/posts" },
      { label: "মিডিয়া ও সংবাদ", url: "/posts" },
      { label: "নোটিশ ও ঘোষণা", url: "/posts" },
    ],
  },
  {
    title: "যোগাযোগ ও সহায়তা",
    icon: Mail,
    links: [
      { label: "যোগাযোগ তথ্য", url: "/contact" },
      { label: "পরামর্শ ও সহায়তা", url: "/contact" },
      { label: "প্রশ্নোত্তর (FAQ)", url: "/page/about" },
      { label: "অনুদান ও সংযোজিত", url: "/contact" },
    ],
  },
];

const SectionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => (
        <Card key={section.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary text-lg">
              <section.icon size={20} />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {section.links.map((link, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
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
