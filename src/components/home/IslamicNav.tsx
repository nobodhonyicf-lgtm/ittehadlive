import { Link } from "react-router-dom";
import { BookOpen, Quote, HandHelping, Scale, Calculator, HelpCircle, Compass, MapPin } from "lucide-react";

const islamicLinks = [
  { icon: BookOpen, label: "কুরআন", sub: "আরবি ও বাংলা অনুবাদ", path: "/quran", bg: "from-emerald-700 to-teal-600" },
  { icon: Quote, label: "হাদিস", sub: "নবীজি ﷺ এর বাণী", path: "/hadith", bg: "from-sky-700 to-blue-600" },
  { icon: HandHelping, label: "দোয়া", sub: "বিষয়ভিত্তিক দোয়া", path: "/dua", bg: "from-indigo-700 to-purple-600" },
  { icon: Scale, label: "মাসআলা", sub: "ইসলামী ফিকহ", path: "/masala", bg: "from-rose-700 to-red-600" },
  { icon: Calculator, label: "যাকাত", sub: "যাকাত হিসাব করুন", path: "/zakat", bg: "from-amber-700 to-yellow-600" },
  { icon: HelpCircle, label: "কুইজ", sub: "জ্ঞান যাচাই করুন", path: "/quiz", bg: "from-violet-700 to-purple-600" },
  { icon: Compass, label: "কিবলা", sub: "কিবলার দিক", path: "/qibla", bg: "from-cyan-700 to-teal-500" },
  { icon: MapPin, label: "নিকটস্থ", sub: "মসজিদ ও মাদরাসা", path: "/nearby-map", bg: "from-green-700 to-lime-600" },
];

const IslamicNav = () => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-600 to-teal-500" />
        <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5"><BookOpen size={15} className="text-emerald-600" /> ইসলামী পাতাসমূহ</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3">
        {islamicLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`bg-gradient-to-br ${link.bg} text-white rounded-xl p-3 flex flex-col items-center gap-2 text-center hover:scale-[1.02] transition-transform shadow-md`}
          >
            <link.icon size={22} />
            <div>
              <p className="font-bold text-sm">{link.label}</p>
              <p className="text-[10px] opacity-80">{link.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default IslamicNav;
