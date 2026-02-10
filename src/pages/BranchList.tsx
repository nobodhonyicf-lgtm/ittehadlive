import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useBranches } from "@/hooks/useBoardData";
import { Building2, MapPin, Phone, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";

const BranchList = () => {
  const { data: branches } = useBranches();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <Building2 size={32} />
            শাখা সমূহ
          </h1>
          <p className="text-muted-foreground mt-2">ইত্তেহাদুল মাদারিসের সকল শাখা</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches?.map(branch => (
            <Card key={branch.id} className="hover:shadow-xl transition-all border-t-4 border-t-primary group">
              <CardContent className="p-0">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center overflow-hidden">
                  {branch.image_url ? (
                    <img src={branch.image_url} alt={branch.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="text-primary/40" size={64} />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-primary group-hover:text-accent transition-colors">{branch.name}</h3>
                  {branch.code && <p className="text-xs text-muted-foreground">কোড: {branch.code}</p>}
                  {branch.head_name && (
                    <p className="text-sm text-foreground flex items-center gap-1 mt-2"><User size={14} /> {branch.head_name}</p>
                  )}
                  {branch.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin size={14} /> {branch.address}</p>
                  )}
                  {branch.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone size={14} /> {branch.phone}</p>
                  )}
                  <Link
                    to={`/students?branch=${branch.id}`}
                    className="inline-block mt-3 text-sm text-primary hover:underline font-semibold"
                  >
                    শিক্ষার্থী তালিকা →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BranchList;
