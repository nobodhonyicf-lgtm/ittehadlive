import { Link } from "react-router-dom";

interface SectionHeaderProps {
  title: string;
  linkUrl?: string;
  linkText?: string;
}

const SectionHeader = ({ title, linkUrl, linkText = "আরও" }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/40" />
      <h2 className="text-[16px] font-bold text-foreground tracking-wide">{title}</h2>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent hidden sm:block min-w-[40px]" />
      {linkUrl && (
        <Link
          to={linkUrl}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors border border-primary/10"
        >
          {linkText} ›
        </Link>
      )}
    </div>
  </div>
);

export default SectionHeader;
