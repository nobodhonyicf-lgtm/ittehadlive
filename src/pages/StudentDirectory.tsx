import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useBranches, useStudents } from "@/hooks/useBoardData";
import { Users, Search, User, MapPin, Phone } from "lucide-react";

const StudentDirectory = () => {
  const [branchId, setBranchId] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data: branches } = useBranches();
  const { data: students } = useStudents(branchId || undefined, className || undefined);

  const filtered = students?.filter(s =>
    !search || s.name.includes(search) || s.roll_number.includes(search) || s.registration_number?.includes(search)
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <Users size={32} />
            শাখাওয়াইজ স্টুডেন্ট ডিরেক্টরি
          </h1>
          <p className="text-muted-foreground mt-2">শাখা ও ক্লাস অনুযায়ী শিক্ষার্থী অনুসন্ধান করুন</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-t-4 border-t-primary">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger><SelectValue placeholder="শাখা নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল শাখা</SelectItem>
                  {branches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue placeholder="ক্লাস নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল ক্লাস</SelectItem>
                  {["ইবতেদায়ী", "মুতাওয়াসসিতা", "সানাবিয়্যা আম্মা", "সানাবিয়্যা খাসসা", "ফযীলত", "তাকমীল"].map(c =>
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="নাম, রোল বা রেজিস্ট্রেশন নম্বর..."
                  className="pl-10"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        {filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(student => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-primary" size={28} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{student.name}</h3>
                    <p className="text-xs text-muted-foreground">পিতা: {student.father_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">রোল: {student.roll_number} | রেজি: {student.registration_number || "—"}</p>
                    <p className="text-xs text-primary font-semibold">{student.class_name} — {(student as any).branches?.name || "—"}</p>
                    {student.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone size={10} />{student.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-4" size={48} />
              <p>শাখা ও ক্লাস নির্বাচন করে শিক্ষার্থী খুঁজুন</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StudentDirectory;
