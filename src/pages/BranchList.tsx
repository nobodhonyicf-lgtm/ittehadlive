import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { useBranches } from "@/hooks/useBoardData";
import { Building2, MapPin, Users, GraduationCap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageSidebar from "@/components/home/PageSidebar";
import { useIsApp } from "@/hooks/useIsApp";
import { toBengali } from "@/lib/bengali";
import Breadcrumbs from "@/components/Breadcrumbs";

const BranchList = () => {
  const isApp = useIsApp();
  const { data: branches } = useBranches();

  return (
    <Layout>
      <SEOHead title="শাখা সমূহ" description="ইত্তেহাদুল মাদারিসের সকল শাখা প্রতিষ্ঠান — ঠিকানা, শিক্ষক ও শিক্ষার্থী সংখ্যাসহ বিস্তারিত তথ্য।" keywords="শাখা, মাদরাসা, প্রতিষ্ঠান, বাংলাদেশ" />
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 mb-3">
            <Building2 size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">শাখা সমূহ</h1>
          <p className="text-muted-foreground mt-1 text-sm">ইত্তেহাদুল মাদারিসের সকল শাখা প্রতিষ্ঠান</p>
          {branches && (
            <p className="text-xs text-muted-foreground mt-1">মোট শাখা: {toBengali(branches.length)}টি</p>
          )}
        </div>

        <div className={`grid grid-cols-1 ${isApp ? '' : 'lg:grid-cols-3'} gap-6`}>
          <div className={isApp ? '' : 'lg:col-span-2'}>
            <div className="grid grid-cols-2 gap-3">
              {branches?.map((branch, i) => (
                <Link key={branch.id} to={`/branch/${branch.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 group h-full border-border/60 overflow-hidden hover:border-primary/30">
                    <CardContent className="p-0">
                      <div className="h-24 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 flex items-center justify-center overflow-hidden relative p-3">
                        {branch.image_url ? (
                          <img src={branch.image_url} alt={branch.name} className="w-16 h-16 object-contain" />
                        ) : (
                          <Building2 className="text-primary/20" size={36} />
                        )}
                        {branch.code && (
                          <span className="absolute top-1.5 right-1.5 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {toBengali(branch.code)}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{branch.name}</h3>
                        {branch.address && (
                          <p className="text-[11px] text-muted-foreground flex items-start gap-1 mt-1 line-clamp-1">
                            <MapPin size={10} className="shrink-0 mt-0.5" /> {branch.address}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                          {(branch.total_teachers ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <GraduationCap size={11} className="text-primary/70" />
                              <span className="font-medium">{toBengali(branch.total_teachers)}</span>
                            </span>
                          )}
                          {(branch.total_students ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Users size={11} className="text-primary/70" />
                              <span className="font-medium">{toBengali(branch.total_students)}</span>
                            </span>
                          )}
                          <ChevronRight size={12} className="ml-auto text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          {!isApp && (
            <div className="lg:col-span-1">
              <PageSidebar />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BranchList;
