import { Link } from "react-router-dom";

const islamicLinks = [
  { emoji: "📖", label: "কুরআন", path: "/quran", bg: "from-emerald-700 to-teal-600" },
  { emoji: "📿", label: "হাদিস", path: "/hadith", bg: "from-sky-700 to-blue-600" },
  { emoji: "🤲", label: "দোয়া", path: "/dua", bg: "from-indigo-700 to-purple-600" },
  { emoji: "⚖️", label: "মাসআলা", path: "/masala", bg: "from-rose-700 to-red-600" },
];

const AppIslamicNav = () => {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
      <h2 className="text-sm font-bold mb-2.5 flex items-center gap-2">📚 ইসলামী পাতা</h2>
      <div className="grid grid-cols-4 gap-2">
        {islamicLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`bg-gradient-to-br ${link.bg} text-white rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-md active:scale-95 transition-transform`}
          >
            <span className="text-2xl">{link.emoji}</span>
            <span className="text-[11px] font-bold">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppIslamicNav;
