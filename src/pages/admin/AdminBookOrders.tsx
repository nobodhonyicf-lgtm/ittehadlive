import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Eye } from "lucide-react";
import { toast } from "sonner";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import { toBengali } from "@/lib/bengali";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "পেন্ডিং", variant: "secondary" },
  confirmed: { label: "কনফার্মড", variant: "default" },
  shipped: { label: "শিপড", variant: "outline" },
  delivered: { label: "ডেলিভার্ড", variant: "default" },
  cancelled: { label: "বাতিল", variant: "destructive" },
};

const AdminBookOrders = () => {
  const queryClient = useQueryClient();
  const { canEdit } = useSectionPermissions();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin_book_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["admin_order_items", selectedOrder?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_order_items")
        .select("*, books(title, cover_image_url)")
        .eq("order_id", selectedOrder!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder,
  });

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("book_orders").update({ status }).eq("id", orderId);
    if (error) toast.error("আপডেট ব্যর্থ");
    else {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin_book_orders"] });
    }
  };

  const filtered = filterStatus === "all" ? orders : orders?.filter((o) => o.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><Package size={24} /> অর্ডার ম্যানেজমেন্ট</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সকল অর্ডার</SelectItem>
            {Object.entries(statusMap).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto" /></div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>অর্ডার নং</TableHead>
                  <TableHead>গ্রাহক</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>মোট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{toBengali(order.phone)}</TableCell>
                    <TableCell className="font-medium">৳{toBengali(order.total_amount)}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)} disabled={!canEdit}>
                        <SelectTrigger className="w-28 h-7 text-xs">
                          <Badge variant={statusMap[order.status]?.variant || "secondary"}>
                            {statusMap[order.status]?.label || order.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusMap).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(order.created_at).toLocaleDateString("bn-BD")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>অর্ডার বিস্তারিত: {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>নাম:</strong> {selectedOrder.customer_name}</div>
                <div><strong>ফোন:</strong> {toBengali(selectedOrder.phone)}</div>
                <div><strong>জেলা:</strong> {selectedOrder.district}</div>
                <div><strong>পেমেন্ট:</strong> ক্যাশ অন ডেলিভারি</div>
              </div>
              <div><strong>ঠিকানা:</strong> {selectedOrder.address}</div>
              {selectedOrder.notes && <div><strong>নোট:</strong> {selectedOrder.notes}</div>}
              {selectedOrder.email && <div><strong>ইমেইল:</strong> {selectedOrder.email}</div>}

              <div className="border-t pt-2">
                <strong>আইটেম সমূহ:</strong>
                {orderItems?.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-1 border-b last:border-0">
                    <span>{item.books?.title || "—"} ×{toBengali(item.quantity)}</span>
                    <span>৳{toBengali(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>ডেলিভারি চার্জ</span>
                <span>৳{toBengali(selectedOrder.delivery_charge)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>মোট</span>
                <span className="text-primary">৳{toBengali(selectedOrder.total_amount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookOrders;
