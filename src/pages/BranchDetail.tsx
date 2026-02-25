import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useBranches, useStudents } from "@/hooks/useBoardData";
import { Building2, MapPin, User, Phone, Mail, Users, ArrowLeft, Globe, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toBengali } from "@/lib/bengali";

const BranchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: branches } = useBranches();
  const branch = branches?.find((b: any) => b.id === id);
  const { data: students } = useStudents(id, undefined);

  if (!branch) {
    return (
      <Layout>
        <div className="px-4 py-12 text-center text-muted-foreground">শাখা পাওয়া যায়নি</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <Link to="/branches">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> সকল শাখা
          </Button>
        </Link>

        {/* Hero Header */}
        <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary/10 to-accent/5 dark:from-primary/20 dark:to-accent/10 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-2 h-48 md:h-64 flex items-center justify-center overflow-hidden p-6">
              {branch.image_url ? (
                <img src={branch.image_url} alt={branch.name} className="max-w-[140px] max-h-[140px] object-contain" />
              ) : (
                <Building2 className="text-primary/25" size={80} />
              )}
            </div>
            <div className="md:col-span-3 p-5 md:p-6 flex flex-col justify-center">
              <div className="flex items-start gap-2 mb-1">
                {branch.code && (
                  <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                    {toBengali(branch.code)}
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">{branch.name}</h1>
              
              <div className="space-y-1.5 text-sm">
                {branch.address && (
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <MapPin size={15} className="text-primary shrink-0 mt-0.5" /> {branch.address}
                  </p>
                )}
                {branch.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={15} className="text-primary" /> {toBengali(branch.phone)}
                  </p>
                )}
                {branch.email && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={15} className="text-primary" /> {branch.email}
                  </p>
                )}
                {branch.website && (
                  <p className="flex items-center gap-2">
                    <Globe size={15} className="text-primary" />
                    <a href={branch.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">{branch.website}</a>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
        <Link to={`/students?branch=${branch.id}`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Users size={14} /> শিক্ষার্থী তালিকা ({toBengali(branch.total_students || 0)} জন)
                  </Button>
                </Link>
                <Link to="/result">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <GraduationCap size={14} /> রেজাল্ট দেখুন
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {((branch.total_teachers ?? 0) > 0 || (branch.total_students ?? 0) > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(branch.total_teachers ?? 0) > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-2">
                    <GraduationCap size={20} className="text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">{toBengali(branch.total_teachers)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">মোট শিক্ষক</p>
                </CardContent>
              </Card>
            )}
            {(branch.total_students ?? 0) > 0 && (
              <Card className="border-border/60">
                <CardContent className="p-4 text-center">
                   <div className="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mx-auto mb-2">
                    <Users size={20} className="text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">{toBengali(branch.total_students)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">মোট শিক্ষার্থী</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Head Teacher / Muhtamim Info */}
        {branch.head_name && (
          <Card className="mb-6 border-border/60">
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User size={14} className="text-primary" />
                </div>
                মুহতামিম / প্রধান শিক্ষক
              </h2>
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                  {branch.head_photo_url ? (
                    <img src={branch.head_photo_url} alt={branch.head_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-muted-foreground" size={28} />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">{branch.head_name}</h3>
                  {branch.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone size={13} className="text-primary/70" /> {toBengali(branch.phone)}
                    </p>
                  )}
                  {branch.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Mail size={13} className="text-primary/70" /> {branch.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students preview */}
        {students && students.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users size={14} className="text-primary" />
              </div>
              শিক্ষার্থী তালিকা
              <span className="text-xs text-muted-foreground font-normal ml-1">({toBengali(students.length)} জন)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.slice(0, 6).map((student: any) => (
                <Card key={student.id} className="border-border/60">
                  <CardContent className="p-3.5 flex gap-3 items-center">
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-muted-foreground" size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate text-foreground">{student.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{student.class_name} | রোল: {toBengali(student.roll_number)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {students.length > 6 && (
              <div className="text-center mt-4">
                <Link to={`/students?branch=${branch.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users size={14} /> সকল শিক্ষার্থী দেখুন ({toBengali(students.length)} জন)
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BranchDetail;
