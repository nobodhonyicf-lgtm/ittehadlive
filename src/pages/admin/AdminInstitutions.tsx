import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Building2, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { toBengaliNumber } from "@/lib/bengali";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "অপেক্ষমান", color: "bg-orange-100 text-orange-700", icon: Clock },
  approved: { label: "অনুমোদিত", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-700", icon: XCircle },
};

const AdminInstitutions = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data: institutions, isLoading } = useQuery({
    queryKey: ["admin_institutions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("institutions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("institutions").update({ status, admin_note: adminNote || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("আপডেট হয়েছে"); setSelected(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = institutions?.filter((i: any) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    return true;
  }) || [];

  return (
    <AdminPageWrapper title="প্রতিষ্ঠান ব্যবস্থাপনা" icon={Building2}>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="প্রতিষ্ঠান খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="border border-input rounded-md px-3 py-2 text-sm bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">সকল স্ট্যাটাস</option>
          <option value="pending">অপেক্ষমান</option>
          <option value="approved">অনুমোদিত</option>
          <option value="rejected">প্রত্যাখ্যাত</option>
        </select>
        <Badge variant="outline">{toBengaliNumber(filtered.length)}টি প্রতিষ্ঠান</Badge>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রতিষ্ঠান</TableHead>
              <TableHead>জেলা</TableHead>
              <TableHead>ফোন</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">কোনো প্রতিষ্ঠান নেই</TableCell></TableRow>
            ) : filtered.map((inst: any) => {
              const st = statusMap[inst.status] || statusMap.pending;
              return (
                <TableRow key={inst.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {inst.logo_url ? <img src={inst.logo_url} alt="" className="w-8 h-8 rounded object-contain bg-muted" /> : <Building2 size={16} className="text-muted-foreground" />}
                      <div>
                        <div className="font-medium text-sm">{inst.name}</div>
                        {inst.muhtamim_name && <div className="text-[10px] text-muted-foreground">{inst.muhtamim_name}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{inst.district || "-"}</TableCell>
                  <TableCell className="text-sm">{inst.phone}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(inst); setAdminNote(inst.admin_note || ""); }}>
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>প্রতিষ্ঠানের বিস্তারিত</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selected.logo_url ? <img src={selected.logo_url} alt="" className="w-14 h-14 rounded-lg object-contain bg-muted" /> : <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={24} className="text-primary" /></div>}
                <div>
                  <h3 className="font-bold">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">{selected.district} · {selected.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.email && <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">ইমেইল</span>{selected.email}</div>}
                {selected.muhtamim_name && <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">মুহতামিম</span>{selected.muhtamim_name}</div>}
                <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">ছাত্র</span>{toBengaliNumber(selected.total_students || 0)}</div>
                <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">শিক্ষক</span>{toBengaliNumber(selected.total_teachers || 0)}</div>
                {selected.departments && <div className="bg-muted/50 p-2 rounded col-span-2"><span className="text-[10px] text-muted-foreground block">বিভাগ</span>{selected.departments}</div>}
                {selected.classes && <div className="bg-muted/50 p-2 rounded col-span-2"><span className="text-[10px] text-muted-foreground block">শ্রেণী</span>{selected.classes}</div>}
              </div>
              {selected.description && <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">{selected.description}</p>}
              
              {/* Documents */}
              <div className="flex flex-wrap gap-2">
                {selected.registration_cert_url && <a href={selected.registration_cert_url} target="_blank" rel="noopener noreferrer"><Badge variant="outline" className="cursor-pointer">📄 রেজিস্ট্রেশন সার্টিফিকেট</Badge></a>}
                {selected.approval_letter_url && <a href={selected.approval_letter_url} target="_blank" rel="noopener noreferrer"><Badge variant="outline" className="cursor-pointer">📄 অনুমোদন পত্র</Badge></a>}
              </div>

              {/* Admin Actions */}
              <div className="border-t pt-3 space-y-3">
                <Textarea placeholder="অ্যাডমিন নোট..." value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} />
                <div className="flex gap-2">
                  <Button className="flex-1 gap-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus.mutate({ id: selected.id, status: "approved" })} disabled={updateStatus.isPending}>
                    <CheckCircle size={14} /> অনুমোদন
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-1" onClick={() => updateStatus.mutate({ id: selected.id, status: "rejected" })} disabled={updateStatus.isPending}>
                    <XCircle size={14} /> প্রত্যাখ্যান
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
};

export default AdminInstitutions;
