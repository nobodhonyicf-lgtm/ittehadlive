import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, ArrowLeft } from "lucide-react";
import { useIsApp } from "@/hooks/useIsApp";

interface BreadcrumbsProps {
  items?: { label: string; href?: string }[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const isApp = useIsApp();
  const navigate = useNavigate();

  // App mode: show a compact back button + current page title
  if (isApp) {
    return (
      <div className="flex items-center gap-2 mb-3 px-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 active:scale-95 transition-all py-1.5 px-2.5 -ml-2.5 rounded-lg hover:bg-primary/5"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">ফিরে যান</span>
        </button>
        {items && items.length > 0 && (
          <>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {items[items.length - 1].label}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home size={14} /> হোম
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items?.map((item, i) => (
          <span key={i} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
