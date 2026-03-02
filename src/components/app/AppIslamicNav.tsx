import { Link } from "react-router-dom";
import { BookOpen, Quote, HandHelping, Scale, Calculator } from "lucide-react";

const islamicLinks = [
  { icon: BookOpen, label: "কুরআন", path: "/quran", bg: "from-emerald-700 to-teal-600" },
  { icon: Quote, label: "হাদিস", path: "/hadith", bg: "from-sky-700 to-blue-600" },
  { icon: HandHelping, label: "দোয়া", path: "/dua", bg: "from-indigo-700 to-purple-600" },
  { icon: Scale, label: "মাসআলা", path: "/masala", bg: "from-rose-700 to-red-600" },
  { icon: Calculator, label: "যাকাত", path: "/zakat", bg: "from-amber-700 to-yellow-600" },
];

const AppIslamicNav = () => {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
      <h2 className="text-sm font-bold mb-2.5 flex items-center gap-2">
        <BookOpen size={16} className="text-emerald-600" /> ইসলামী পাতা
      </h2>
      <div className="grid grid-cols-5 gap-2">
        {islamicLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`bg-gradient-to-br ${link.bg} text-white rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-md active:scale-95 transition-transform`}
          >
            <link.icon size={22} />
            <span className="text-[11px] font-bold">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppIslamicNav;
