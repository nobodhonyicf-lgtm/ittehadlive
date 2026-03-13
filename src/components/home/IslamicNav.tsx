import { Link } from "react-router-dom";
import { BookOpen, Quote, HandHelping, Scale, Calculator, HelpCircle, Compass, MapPin } from "lucide-react";
import SectionHeader from "./SectionHeader";

const islamicLinks = [
  { icon: BookOpen, label: "কুরআন", sub: "আরবি ও বাংলা অনুবাদ", path: "/quran" },
  { icon: Quote, label: "হাদিস", sub: "নবীজি ﷺ এর বাণী", path: "/hadith" },
  { icon: HandHelping, label: "দোয়া", sub: "বিষয়ভিত্তিক দোয়া", path: "/dua" },
  { icon: Scale, label: "মাসআলা", sub: "ইসলামী ফিকহ", path: "/masala" },
  { icon: Calculator, label: "যাকাত", sub: "যাকাত হিসাব করুন", path: "/zakat" },
  { icon: HelpCircle, label: "কুইজ", sub: "জ্ঞান যাচাই করুন", path: "/quiz" },
  { icon: Compass, label: "কিবলা", sub: "কিবলার দিক", path: "/qibla" },
  { icon: MapPin, label: "নিকটস্থ", sub: "মসজিদ ও মাদরাসা", path: "/nearby-map" },
];

const IslamicNav = () => {
  return (
    <div>
      <SectionHeader title="ইসলামী পাতাসমূহ" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {islamicLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              <link.icon size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{link.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{link.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default IslamicNav;
