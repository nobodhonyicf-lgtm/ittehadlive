import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  linkUrl?: string;
  linkText?: string;
}

const SectionHeader = ({ title, linkUrl, linkText = "আরও" }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-destructive rounded-t-md mb-4">
      <h2 className="text-white px-4 py-2 text-[15px] font-bold tracking-wide">
        {title}
      </h2>
      {linkUrl && (
        <Link
          to={linkUrl}
          className="flex items-center gap-0.5 text-[13px] font-bold text-white bg-black/20 hover:bg-black/30 px-3 py-2 transition-colors"
        >
          {linkText}
          <ChevronLeft size={14} className="rotate-180" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
