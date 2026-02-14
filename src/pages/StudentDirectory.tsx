import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useBranches, useStudents } from "@/hooks/useBoardData";
import { Users, Search, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

const STUDENTS_PER_PAGE = 12;

const StudentDirectory = () => {
  const [searchParams] = useSearchParams();
  const [branchId, setBranchId] = useState<string>(searchParams.get("branch") || "");
  const [className, setClassName] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: branches } = useBranches();
  const { data: students } = useStudents(branchId || undefined, className || undefined);

  // Only show students when className is selected
  const shouldShowStudents = !!className;

  const filtered = shouldShowStudents ? students?.filter(s =>
    !search || s.name.includes(search) || s.roll_number.includes(search) || s.registration_number?.includes(search)
  ) : [];

  const totalPages = Math.ceil((filtered?.length || 0) / STUDENTS_PER_PAGE);
  const paginated = filtered?.slice((page - 1) * STUDENTS_PER_PAGE, page * STUDENTS_PER_PAGE);

  return (
    <Layout>
      <div className="px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <Users size={32} />
            শিক্ষার্থী ডিরেক্টরি
          </h1>
          <p className="text-muted-foreground mt-2">শাখা ও ক্লাস অনুযায়ী শিক্ষার্থী অনুসন্ধান করুন</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={branchId} onValueChange={v => { setBranchId(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="শাখা নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল শাখা</SelectItem>
                  {branches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={className} onValueChange={v => { setClassName(v === "all" ? "" : v); setPage(1); }}>
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
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Count */}
        {filtered && filtered.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">মোট {filtered.length} জন শিক্ষার্থী পাওয়া গেছে</p>
        )}

        {/* Student Grid */}
        {paginated && paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map(student => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
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
                      <p className="text-xs text-muted-foreground">রোল: {student.roll_number} | রেজি: {student.registration_number || "—"}</p>
                      <p className="text-xs text-primary font-semibold mt-1">{student.class_name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm text-muted-foreground">পৃষ্ঠা {page} / {totalPages}</span>
                <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-4" size={48} />
              <p>{!className ? "প্রথমে একটি শ্রেণি নির্বাচন করুন" : "কোনো শিক্ষার্থী পাওয়া যায়নি"}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StudentDirectory;
