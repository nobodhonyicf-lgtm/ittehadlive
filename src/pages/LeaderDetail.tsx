import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";

const LeaderDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: leader, isLoading } = useQuery({
    queryKey: ["leader_detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leader_profiles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!leader) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">তথ্য পাওয়া যায়নি</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title={`${leader.name} - ${leader.title}`} description={leader.bio || leader.name} />
      <div className="px-4 py-8">
        <Card className="max-w-3xl mx-auto border-t-4 border-t-primary">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-32 h-32 rounded-full bg-muted mb-4 flex items-center justify-center overflow-hidden border-4 border-primary/20">
                {leader.image_url ? (
                  <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="text-muted-foreground" size={48} />
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">{leader.name}</h1>
              <p className="text-muted-foreground font-medium mt-1">{leader.title}</p>
            </div>
            {leader.bio && (
              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-bold text-primary mb-3">বাণী</h2>
                <p className="text-foreground leading-relaxed text-justify whitespace-pre-line">
                  {leader.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LeaderDetail;
