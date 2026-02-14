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
      <div className="px-4 py-8">
        <Link to="/branches">
          <Button variant="ghost" className="gap-2 mb-4"><ArrowLeft size={16} /> সকল শাখা</Button>
        </Link>

        {/* Branch Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="h-48 md:h-auto bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center overflow-hidden">
              {branch.image_url ? (
                <img src={branch.image_url} alt={branch.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-primary/40" size={80} />
              )}
            </div>
            <CardContent className="md:col-span-2 p-6">
              <h1 className="text-2xl font-bold text-primary mb-2">{branch.name}</h1>
              {branch.code && <p className="text-sm text-muted-foreground mb-3">কোড: {branch.code}</p>}
              {branch.address && (
                <p className="text-sm flex items-center gap-2 mb-2"><MapPin size={16} className="text-primary" /> {branch.address}</p>
              )}
              {branch.phone && (
                <p className="text-sm flex items-center gap-2 mb-2"><Phone size={16} className="text-primary" /> {branch.phone}</p>
              )}
              {branch.email && (
                <p className="text-sm flex items-center gap-2 mb-2"><Mail size={16} className="text-primary" /> {branch.email}</p>
              )}
              {branch.website && (
                <p className="text-sm flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-primary" />
                  <a href={branch.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{branch.website}</a>
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-4">
                <Link to={`/students?branch=${branch.id}`}>
                  <Button variant="outline" className="gap-2"><Users size={16} /> শিক্ষার্থী তালিকা ({toBengali(students?.length || 0)})</Button>
                </Link>
                <Link to="/result">
                  <Button variant="outline" className="gap-2">রেজাল্ট দেখুন</Button>
                </Link>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Head Teacher / Muhtamim Info */}
        {branch.head_name && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-primary mb-4">মুহতামিম / প্রধান শিক্ষক</h2>
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20">
                  {branch.head_photo_url ? (
                    <img src={branch.head_photo_url} alt={branch.head_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-primary" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{branch.head_name}</h3>
                  {branch.phone && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone size={14} /> {branch.phone}</p>}
                  {branch.email && <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail size={14} /> {branch.email}</p>}
                  {branch.website && <p className="text-sm text-muted-foreground flex items-center gap-1"><Globe size={14} /> <a href={branch.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{branch.website}</a></p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {(branch.total_teachers > 0 || branch.total_students > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {branch.total_teachers > 0 && (
              <Card>
                <CardContent className="p-4 text-center">
                  <GraduationCap className="mx-auto text-primary mb-2" size={28} />
                  <p className="text-2xl font-bold text-primary">{toBengali(branch.total_teachers)}</p>
                  <p className="text-sm text-muted-foreground">মোট শিক্ষক</p>
                </CardContent>
              </Card>
            )}
            {branch.total_students > 0 && (
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="mx-auto text-primary mb-2" size={28} />
                  <p className="text-2xl font-bold text-primary">{toBengali(branch.total_students)}</p>
                  <p className="text-sm text-muted-foreground">মোট শিক্ষার্থী</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Students preview */}
        {students && students.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-primary mb-4">শিক্ষার্থী তালিকা</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.slice(0, 6).map((student: any) => (
                <Card key={student.id}>
                  <CardContent className="p-4 flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-primary" size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">{student.class_name} | রোল: {student.roll_number}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {students.length > 6 && (
              <div className="text-center mt-4">
                <Link to={`/students?branch=${branch.id}`}>
                  <Button variant="outline">সকল শিক্ষার্থী দেখুন ({toBengali(students.length)})</Button>
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
