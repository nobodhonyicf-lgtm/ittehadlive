import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useBranches } from "@/hooks/useBoardData";
import { Building2, MapPin, Users, GraduationCap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageSidebar from "@/components/home/PageSidebar";
import { useIsApp } from "@/hooks/useIsApp";
import { toBengali } from "@/lib/bengali";

const BranchList = () => {
  const isApp = useIsApp();
  const { data: branches } = useBranches();

  return (
    <Layout>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {branches?.map((branch, i) => (
                <Link key={branch.id} to={`/branch/${branch.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 group h-full border-border/60 overflow-hidden hover:border-primary/30">
                    <CardContent className="p-0">
                      <div className="h-36 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 flex items-center justify-center overflow-hidden relative">
                        {branch.image_url ? (
                          <img src={branch.image_url} alt={branch.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Building2 className="text-primary/20" size={56} />
                        )}
                        {branch.code && (
                          <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {branch.code}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">{branch.name}</h3>
                        {branch.address && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1.5 line-clamp-1">
                            <MapPin size={12} className="shrink-0 mt-0.5" /> {branch.address}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                          {(branch.total_teachers ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <GraduationCap size={13} className="text-primary/70" />
                              <span className="font-medium">{toBengali(branch.total_teachers)}</span> শিক্ষক
                            </span>
                          )}
                          {(branch.total_students ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users size={13} className="text-primary/70" />
                              <span className="font-medium">{toBengali(branch.total_students)}</span> শিক্ষার্থী
                            </span>
                          )}
                          <ChevronRight size={14} className="ml-auto text-muted-foreground/50 group-hover:text-primary transition-colors" />
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
