import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary/20 mb-2">৪০৪</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">পাতাটি খুঁজে পাওয়া যায়নি</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          আপনি যে পাতাটি খুঁজছেন সেটি সরানো হয়েছে, নাম পরিবর্তন করা হয়েছে, অথবা অস্তিত্বে নেই। 
          সঠিক ঠিকানা দিয়ে আবার চেষ্টা করুন।
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button className="gap-2">
              <Home size={16} /> হোম পেজে যান
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft size={16} /> পূর্ববর্তী পাতা
          </Button>
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">দরকারী লিংকসমূহ:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/support" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <HelpCircle size={12} /> সহায়তা কেন্দ্র
            </Link>
            <Link to="/contact" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              যোগাযোগ
            </Link>
            <Link to="/verify" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Search size={12} /> যাচাই কেন্দ্র
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
