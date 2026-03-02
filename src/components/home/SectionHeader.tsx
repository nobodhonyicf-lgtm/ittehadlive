import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  linkUrl?: string;
  linkText?: string;
}

const SectionHeader = ({ title, linkUrl, linkText = "আরও" }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 relative">
      {/* Left accent bar */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-primary/50" />
        <h2 className="text-[16px] font-bold text-foreground tracking-wide">
          {title}
        </h2>
      </div>
      {/* Decorative line */}
      <div className="flex-1 mx-3 h-px bg-gradient-to-r from-primary/30 via-border to-transparent" />
      {linkUrl && (
        <Link
          to={linkUrl}
          className="flex items-center gap-0.5 text-[12px] font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors border border-primary/15"
        >
          {linkText}
          <ChevronLeft size={13} className="rotate-180" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
