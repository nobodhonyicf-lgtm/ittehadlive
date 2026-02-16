import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  linkUrl?: string;
  linkText?: string;
}

const SectionHeader = ({ title, linkUrl, linkText = "আরও" }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b-2 border-destructive mb-4">
      <h2 className="bg-destructive text-destructive-foreground px-4 py-1.5 text-base font-bold">
        {title}
      </h2>
      {linkUrl && (
        <Link
          to={linkUrl}
          className="flex items-center gap-0.5 text-sm font-semibold text-destructive hover:underline pb-1 pr-1"
        >
          {linkText}
          <ChevronLeft size={14} className="rotate-180" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
