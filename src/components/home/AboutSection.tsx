import { useSiteSettings } from "@/hooks/useData";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const AboutSection = () => {
  const { data: settings } = useSiteSettings();

  return (
    <Card className="border-t-4 border-t-primary">
      <CardContent className="p-6">
        <p className="text-foreground leading-relaxed text-justify">
          {settings?.about_text || "লোড হচ্ছে..."}
        </p>
        <Link
          to="/page/about"
          className="inline-block mt-3 text-primary hover:underline font-bold text-sm"
        >
          বিস্তারিত →
        </Link>
      </CardContent>
    </Card>
  );
};

export default AboutSection;
