import { Link } from "react-router-dom";
import { BookOpen, Quote, HandHelping, Scale } from "lucide-react";

const islamicLinks = [
  { icon: BookOpen, label: "কুরআন", sub: "আরবি ও বাংলা অনুবাদ", path: "/quran", bg: "from-emerald-700 to-teal-600" },
  { icon: Quote, label: "হাদিস", sub: "নবীজি ﷺ এর বাণী", path: "/hadith", bg: "from-sky-700 to-blue-600" },
  { icon: HandHelping, label: "দোয়া", sub: "বিষয়ভিত্তিক দোয়া", path: "/dua", bg: "from-indigo-700 to-purple-600" },
  { icon: Scale, label: "মাসআলা", sub: "ইসলামী ফিকহ", path: "/masala", bg: "from-rose-700 to-red-600" },
];

const IslamicNav = () => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-4 py-3">
        <h2 className="text-white font-bold text-sm">☪ ইসলামী পাতাসমূহ</h2>
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
