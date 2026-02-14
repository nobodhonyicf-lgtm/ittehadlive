import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Trash2, Minus, Plus, BookOpen } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import SEOHead from "@/components/SEOHead";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  return (
    <Layout>
      <SEOHead title="কার্ট" description="আপনার কার্টে থাকা বই সমূহ" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart size={24} /> কার্ট ({toBengali(totalItems)}টি আইটেম)
        </h1>

        {!items.length ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground mb-4">আপনার কার্ট খালি</p>
            <Link to="/books">
              <Button>বই দেখুন</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.bookId}>
                <CardContent className="p-4 flex gap-4">
                  <Link to={`/book/${item.slug}`} className="shrink-0">
                    <div className="w-16 h-20 bg-muted rounded overflow-hidden">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen size={20} /></div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/book/${item.slug}`}>
                      <h3 className="font-semibold text-sm hover:text-primary">{item.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {item.discountPrice ? (
                        <>
                          <span className="font-bold text-primary">৳{toBengali(item.discountPrice)}</span>
                          <span className="text-xs line-through text-muted-foreground">৳{toBengali(item.price)}</span>
                        </>
                      ) : (
                        <span className="font-bold text-primary">৳{toBengali(item.price)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.bookId, item.quantity - 1)}>
                          <Minus size={12} />
                        </Button>
                        <span className="px-2 text-sm font-medium">{toBengali(item.quantity)}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.bookId, item.quantity + 1)}>
                          <Plus size={12} />
                        </Button>
                      </div>
                      <span className="text-sm font-medium">
                        = ৳{toBengali((item.discountPrice || item.price) * item.quantity)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive ml-auto" onClick={() => removeFromCart(item.bookId)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">অর্ডার সামারি</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>সাবটোটাল ({toBengali(totalItems)}টি আইটেম)</span>
                  <span className="font-medium">৳{toBengali(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-muted-foreground">চেকআউটে নির্ধারিত হবে</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>মোট</span>
                  <span className="text-primary text-lg">৳{toBengali(totalPrice)}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={clearCart}>কার্ট খালি করুন</Button>
                  <Link to="/checkout" className="flex-1">
                    <Button className="w-full">চেকআউট করুন</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
