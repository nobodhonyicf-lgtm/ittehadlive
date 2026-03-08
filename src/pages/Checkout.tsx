import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle, ShieldCheck, Package, User, LogIn, MapPin, Phone, Mail, FileText, ChevronRight, ShoppingBag } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";

const DELIVERY_CHARGE_DHAKA = 60;
const DELIVERY_CHARGE_OUTSIDE = 120;

const DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ",
  "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "ফরিদপুর", "কিশোরগঞ্জ", "মানিকগঞ্জ",
  "মুন্সীগঞ্জ", "নরসিংদী", "মাদারীপুর", "গোপালগঞ্জ", "শরীয়তপুর", "রাজবাড়ী",
  "জামালপুর", "শেরপুর", "নেত্রকোণা", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "লক্ষ্মীপুর",
  "নোয়াখালী", "ফেনী", "কক্সবাজার", "রাঙ্গামাটি", "খাগড়াছড়ি", "বান্দরবান",
  "বগুড়া", "জয়পুরহাট", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "পাবনা", "সিরাজগঞ্জ",
  "যশোর", "সাতক্ষীরা", "মেহেরপুর", "নড়াইল", "কুষ্টিয়া", "চুয়াডাঙ্গা", "মাগুরা", "ঝিনাইদহ",
  "বরগুনা", "পটুয়াখালী", "পিরোজপুর", "ঝালকাঠি", "ভোলা",
  "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ",
  "দিনাজপুর", "ঠাকুরগাঁও", "পঞ্চগড়", "নীলফামারী", "লালমনিরহাট", "কুড়িগ্রাম", "গাইবান্ধা",
];

const Checkout = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [profileSynced, setProfileSynced] = useState(false);

  // Fetch profile for logged-in user
  const { data: profile } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, address, district")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Auto-fill form with profile data
  useEffect(() => {
    if (profile && !profileSynced) {
      setForm((prev) => ({
        ...prev,
        customer_name: profile.full_name || prev.customer_name,
        phone: profile.phone || prev.phone,
        email: user?.email || prev.email,
        address: profile.address || prev.address,
        district: profile.district || prev.district || "ঢাকা",
      }));
      setProfileSynced(true);
    } else if (user && !profile && !profileSynced) {
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
      }));
      setProfileSynced(true);
    }
  }, [profile, user, profileSynced]);

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
        user_id: user?.id || null,
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

  // Order success view
  if (orderNumber) {
    return (
      <Layout>
        <SEOHead title="অর্ডার সফল" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">অর্ডার সফলভাবে প্লেস হয়েছে!</h1>
          <p className="text-muted-foreground mb-2">
            আপনার অর্ডার নম্বর:
          </p>
          <p className="text-2xl font-bold text-primary mb-4">{orderNumber}</p>
          <Card className="text-left mb-6">
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package size={16} /> ক্যাশ অন ডেলিভারি — ডেলিভারি ম্যানকে টাকা দিন
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} /> আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব
              </div>
              {user && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={16} /> <Link to="/profile" className="text-primary hover:underline">প্রোফাইল থেকে অর্ডার ট্র্যাক করুন</Link>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/books")}>আরো বই দেখুন</Button>
            <Button variant="outline" onClick={() => navigate("/")}>হোমে ফিরুন</Button>
          </div>
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
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb-style steps */}
        <div className="flex items-center gap-2 text-sm mb-6 text-muted-foreground">
          <Link to="/cart" className="hover:text-primary transition-colors">কার্ট</Link>
          <ChevronRight size={14} />
          <span className="text-primary font-semibold">চেকআউট</span>
          <ChevronRight size={14} />
          <span>অর্ডার কনফার্ম</span>
        </div>

        {/* Login prompt for guests */}
        {!user && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-primary">
                <LogIn size={20} />
                <span className="font-medium">ইতিমধ্যে অ্যাকাউন্ট আছে?</span>
              </div>
              <p className="text-sm text-muted-foreground flex-1">
                লগইন করলে তথ্য স্বয়ংক্রিয়ভাবে পূরণ হবে এবং অর্ডার ট্র্যাক করতে পারবেন।
              </p>
              <Link to="/login?redirect=/checkout">
                <Button variant="outline" size="sm" className="shrink-0">
                  <LogIn size={14} className="mr-1" /> লগইন করুন
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Logged-in user badge */}
        {user && profile && (
          <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardContent className="py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{profile.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                <ShieldCheck size={12} className="mr-1" /> তথ্য সিঙ্ক হয়েছে
              </Badge>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Delivery info */}
            <div className="lg:col-span-2 space-y-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin size={18} className="text-primary" /> ডেলিভারি তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">আপনার নাম <span className="text-destructive">*</span></Label>
                      <Input
                        required
                        value={form.customer_name}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        placeholder="সম্পূর্ণ নাম"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">ফোন নম্বর <span className="text-destructive">*</span></Label>
                      <Input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="০১XXXXXXXXX"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ইমেইল</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="example@mail.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">জেলা <span className="text-destructive">*</span></Label>
                      <select
                        required
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">সম্পূর্ণ ঠিকানা <span className="text-destructive">*</span></Label>
                    <Textarea
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="বাসা/ফ্ল্যাট নম্বর, রোড, এলাকা, থানা"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">বিশেষ নোট</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="ডেলিভারি সংক্রান্ত বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> পেমেন্ট পদ্ধতি
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Truck size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">ক্যাশ অন ডেলিভারি</p>
                      <p className="text-xs text-muted-foreground">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</p>
                    </div>
                    <CheckCircle size={20} className="text-primary ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Order summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary" /> অর্ডার সামারি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.bookId} className="flex items-start gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">×{toBengali(item.quantity)}</p>
                        </div>
                        <span className="font-medium shrink-0">
                          ৳{toBengali((item.discountPrice || item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সাবটোটাল ({toBengali(totalItems)}টি আইটেম)</span>
                      <span>৳{toBengali(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Truck size={14} /> ডেলিভারি চার্জ
                        <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">
                          {isDhaka ? "ঢাকা" : "ঢাকার বাইরে"}
                        </Badge>
                      </span>
                      <span>৳{toBengali(deliveryCharge)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>সর্বমোট</span>
                    <span className="text-primary">৳{toBengali(grandTotal)}</span>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                        প্রসেসিং...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={18} /> অর্ডার কনফার্ম করুন
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-1">
                    <ShieldCheck size={14} /> আপনার তথ্য সম্পূর্ণ নিরাপদ
                  </div>
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
