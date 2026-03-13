import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  linkUrl?: string;
  linkText?: string;
}

const SectionHeader = ({ title, linkUrl, linkText = "আরও" }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-5 relative">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-6 rounded-full bg-primary" />
        <h2 className="text-[15px] font-bold text-foreground">
          {title}
        </h2>
      </div>
      <div className="flex-1 mx-4 h-px bg-border" />
      {linkUrl && (
        <Link
          to={linkUrl}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors border border-primary/10"
        >
          {linkText}
          <ChevronLeft size={12} className="rotate-180" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
