import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Truck, CheckCircle } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const DELIVERY_CHARGE_DHAKA = 60;
const DELIVERY_CHARGE_OUTSIDE = 120;

const Checkout = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    district: "ঢাকা",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const isDhaka = form.district === "ঢাকা";
  const deliveryCharge = isDhaka ? DELIVERY_CHARGE_DHAKA : DELIVERY_CHARGE_OUTSIDE;
  const grandTotal = totalPrice + deliveryCharge;

  const generateOrderNumber = () => {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    const d = now.getDate().toString().padStart(2, "0");
    const r = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${y}${m}${d}-${r}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    if (!form.customer_name || !form.phone || !form.address) {
      toast.error("নাম, ফোন ও ঠিকানা দিন");
      return;
    }

    setSubmitting(true);
    const orderNum = generateOrderNumber();

    const { data: order, error: orderError } = await supabase
      .from("book_orders")
      .insert({
        order_number: orderNum,
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email || null,
        address: form.address,
        district: form.district || null,
        total_amount: grandTotal,
        delivery_charge: deliveryCharge,
        payment_method: "cod",
        notes: form.notes || null,
      })
      .select("id")
      .single();

    if (orderError) {
      toast.error("অর্ডার প্লেস করতে ব্যর্থ");
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      book_id: item.bookId,
      quantity: item.quantity,
      price: item.discountPrice || item.price,
    }));

    const { error: itemsError } = await supabase.from("book_order_items").insert(orderItems);

    setSubmitting(false);
    if (itemsError) {
      toast.error("অর্ডার আইটেম সেভ করতে ব্যর্থ");
      return;
    }

    setOrderNumber(orderNum);
    clearCart();
  };

  if (orderNumber) {
    return (
      <Layout>
        <SEOHead title="অর্ডার সফল" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={60} />
          <h1 className="text-2xl font-bold mb-2">অর্ডার সফল হয়েছে!</h1>
          <p className="text-muted-foreground mb-4">
            আপনার অর্ডার নম্বর: <span className="font-bold text-primary">{orderNumber}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            ক্যাশ অন ডেলিভারি। ডেলিভারি ম্যানকে টাকা দিন। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
          </p>
          <Button onClick={() => navigate("/books")}>আরো বই দেখুন</Button>
        </div>
      </Layout>
    );
  }

  if (!items.length) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      <SEOHead title="চেকআউট" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Truck size={24} /> চেকআউট
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">ডেলিভারি তথ্য</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>আপনার নাম *</Label>
                    <Input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>ফোন নম্বর *</Label>
                    <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="০১XXXXXXXXX" />
                  </div>
                  <div>
                    <Label>ইমেইল</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>জেলা *</Label>
                    <Input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                  </div>
                  <div>
                    <Label>সম্পূর্ণ ঠিকানা *</Label>
                    <Textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div>
                    <Label>বিশেষ নোট</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader><CardTitle className="text-lg">অর্ডার সামারি</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{item.title} ×{toBengali(item.quantity)}</span>
                      <span>৳{toBengali((item.discountPrice || item.price) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between text-sm">
                    <span>সাবটোটাল</span>
                    <span>৳{toBengali(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি ({isDhaka ? "ঢাকা" : "ঢাকার বাইরে"})</span>
                    <span>৳{toBengali(deliveryCharge)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>মোট</span>
                    <span className="text-primary">৳{toBengali(grandTotal)}</span>
                  </div>
                  <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground text-center">
                    💰 পেমেন্ট: ক্যাশ অন ডেলিভারি
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "প্রসেসিং..." : "অর্ডার কনফার্ম করুন"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
