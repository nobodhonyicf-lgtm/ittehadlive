import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePage } from "@/hooks/useData";
import { useCommitteeMembers } from "@/hooks/useData";
import Sidebar from "@/components/home/Sidebar";
import { User } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useIsApp } from "@/hooks/useIsApp";

const committeePages = ["committee", "advisors", "governing_body", "executive", "working"];

const TIER_CONFIG: Record<string, { label: string; emoji: string; gradient: string; border: string; photoSize: string; shadow: string }> = {
  governing_body: {
    label: "🏛️ প্রতিষ্ঠাতা গভর্নিং বডি",
    emoji: "⭐",
    gradient: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:to-yellow-950/30",
    border: "border-2 border-amber-400/60 shadow-amber-200/40",
    photoSize: "w-28 h-28",
    shadow: "shadow-xl",
  },
  executive: {
    label: "🎖️ নির্বাহী কমিটি",
    emoji: "🎖️",
    gradient: "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20",
    border: "border-2 border-primary/30",
    photoSize: "w-22 h-22",
    shadow: "shadow-md",
  },
  working: {
    label: "👥 কার্যকরি সদস্য",
    emoji: "",
    gradient: "bg-muted/30",
    border: "border border-border",
    photoSize: "w-20 h-20",
    shadow: "shadow-sm",
  },
  committee: {
    label: "🏛️ কমিটি",
    emoji: "⭐",
    gradient: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:to-yellow-950/30",
    border: "border-2 border-amber-400/60",
    photoSize: "w-24 h-24",
    shadow: "shadow-lg",
  },
  advisors: {
    label: "📋 উপদেষ্টামণ্ডলী",
    emoji: "",
    gradient: "bg-muted/30",
    border: "border border-border",
    photoSize: "w-20 h-20",
    shadow: "shadow-sm",
  },
};

const MemberCard = ({ m, tier }: { m: any; tier: string }) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.working;
  const isGoverning = tier === "governing_body" || tier === "committee";
  const isExecutive = tier === "executive";

  return (
    <div className={`relative overflow-hidden rounded-2xl p-${isGoverning ? "6" : isExecutive ? "5" : "4"} text-center ${config.shadow} ${config.border} ${config.gradient} transition-transform hover:scale-[1.02]`}>
      {config.emoji && <div className="absolute top-2 right-2 text-3xl opacity-10">{config.emoji}</div>}
      <div className={`${config.photoSize} rounded-full mx-auto mb-3 bg-secondary flex items-center justify-center overflow-hidden border-4 ${isGoverning ? "border-amber-300/50" : isExecutive ? "border-primary/20" : "border-border"} shadow-md`}
        style={tier === "governing_body" ? { width: "7rem", height: "7rem" } : tier === "executive" ? { width: "5.5rem", height: "5.5rem" } : { width: "5rem", height: "5rem" }}
      >
        {m.photo_url ? (
          <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
        ) : (
          <User className="text-primary" size={isGoverning ? 36 : isExecutive ? 32 : 28} />
        )}
      </div>
      <h3 className={`font-bold ${isGoverning ? "text-base" : "text-sm"} mb-1`}>{m.name}</h3>
      <p className={`text-primary ${isGoverning ? "text-sm font-semibold" : isExecutive ? "text-sm font-bold" : "text-xs font-medium"}`}>{m.title}</p>
      {m.institution && <p className="text-xs text-muted-foreground mt-1">{m.institution}</p>}
    </div>
  );
};

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = usePage(slug || "");
  const isCommitteePage = committeePages.includes(slug || "");
  const { data: members } = useCommitteeMembers(isCommitteePage ? slug! : undefined);
  const isApp = useIsApp();

  // For "committee" slug, group by page_slug for tiered display
  const isOldCommitteeSlug = slug === "committee";

  return (
    <Layout>
      {page && <SEOHead title={page.title} description={page.content?.substring(0, 160) || ""} image={(page as any).cover_image_url || undefined} />}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={page ? [{ label: page.title }] : []} />
        <div className={`grid grid-cols-1 ${isApp ? '' : 'lg:grid-cols-3'} gap-6`}>
          <div className={isApp ? '' : 'lg:col-span-2'}>
            {isLoading ? (
              <div className="animate-pulse bg-muted h-64 rounded" />
            ) : page ? (
              <article className="bg-card rounded-lg border p-6">
                <h1 className="text-2xl font-bold text-primary mb-4">{page.title}</h1>
                {page.content && (
                  <div className="prose max-w-none text-foreground whitespace-pre-wrap mb-6">
                    {page.content}
                  </div>
                )}

                {isCommitteePage && members && members.length > 0 && (
                  <div className="space-y-8">
                    {/* Simple case: direct slug rendering */}
                    {!isOldCommitteeSlug && (
                      <div>
                        <h2 className="text-lg font-bold text-center mb-4 text-primary">
                          {TIER_CONFIG[slug || ""]?.label || slug}
                        </h2>
                        <div className={`grid grid-cols-1 ${slug === "governing_body" ? "sm:grid-cols-3" : slug === "executive" ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3"} gap-4`}>
                          {members.map((m: any) => (
                            <MemberCard key={m.id} m={m} tier={slug || "working"} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legacy committee slug: show tiered */}
                    {isOldCommitteeSlug && (() => {
                      // Founding members first 3
                      const founders = members.slice(0, 3);
                      const isSpecial = (m: any) => {
                        const t = (m.title || "").toLowerCase();
                        return t.includes("সভাপতি") || t.includes("সাধারণ সম্পাদক") || t.includes("president") || t.includes("secretary");
                      };
                      const rest = members.slice(3);
                      const special = rest.filter(isSpecial);
                      const regular = rest.filter((m: any) => !isSpecial(m));

                      return (
                        <>
                          {founders.length > 0 && (
                            <div>
                              <h2 className="text-lg font-bold text-center mb-4 text-primary">🏛️ প্রতিষ্ঠাতা গভর্নিং বডি</h2>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {founders.map((m: any) => <MemberCard key={m.id} m={m} tier="governing_body" />)}
                              </div>
                            </div>
                          )}
                          {special.length > 0 && (
                            <div>
                              <h2 className="text-lg font-bold text-center mb-4 text-primary">🎖️ নির্বাহী কমিটি</h2>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {special.map((m: any) => <MemberCard key={m.id} m={m} tier="executive" />)}
                              </div>
                            </div>
                          )}
                          {regular.length > 0 && (
                            <div>
                              <h2 className="text-lg font-bold text-center mb-4 text-primary">👥 কার্যকরি সদস্য</h2>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {regular.map((m: any) => <MemberCard key={m.id} m={m} tier="working" />)}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </article>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                পেজ পাওয়া যায়নি
              </div>
            )}
          </div>
          {!isApp && (
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PageView;