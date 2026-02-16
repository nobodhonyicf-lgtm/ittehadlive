import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  linkUrl?: string;
  linkText?: string;
}

const SectionHeader = ({ title, linkUrl, linkText = "আরও" }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 rounded-t-md mb-4 shadow-sm">
      <h2 className="text-primary-foreground px-4 py-2.5 text-[15px] font-bold tracking-wide">
        {title}
      </h2>
      {linkUrl && (
        <Link
          to={linkUrl}
          className="flex items-center gap-0.5 text-[13px] font-bold text-primary-foreground/90 bg-black/15 hover:bg-black/25 px-3 py-2.5 transition-colors"
        >
          {linkText}
          <ChevronLeft size={14} className="rotate-180" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
