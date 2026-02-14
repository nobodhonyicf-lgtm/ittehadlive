import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useBook, useBookReviews } from "@/hooks/useBookData";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Star, BookOpen, Eye, Minus, Plus, Truck } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import SEOHead from "@/components/SEOHead";

const BookDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: book, isLoading } = useBook(slug || "");
  const { data: reviews } = useBookReviews(book?.id);
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleAddToCart = () => {
    if (!book) return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        bookId: book.id,
        title: book.title,
        price: Number(book.price),
        discountPrice: book.discount_price ? Number(book.discount_price) : undefined,
        coverImage: book.cover_image_url || undefined,
        slug: book.slug,
      });
    }
    toast.success("কার্টে যোগ হয়েছে");
  };

  const handleSubmitReview = async () => {
    if (!book || !reviewForm.reviewer_name.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("book_reviews").insert({
      book_id: book.id,
      reviewer_name: reviewForm.reviewer_name,
      rating: reviewForm.rating,
      comment: reviewForm.comment || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("রিভিউ জমা দিতে ব্যর্থ");
    } else {
      toast.success("রিভিউ জমা হয়েছে, অনুমোদনের পর দেখা যাবে");
      setReviewForm({ reviewer_name: "", rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["book_reviews", book.id] });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">বই পাওয়া যায়নি</div>
      </Layout>
    );
  }

  const discount = book.discount_price
    ? Math.round(((Number(book.price) - Number(book.discount_price)) / Number(book.price)) * 100)
    : 0;

  return (
    <Layout>
      <SEOHead title={book.title} description={book.description || `${book.title} - ${book.author_name}`} />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-4 flex gap-1">
          <Link to="/books" className="hover:text-primary">প্রকাশনা</Link>
          <span>/</span>
          <span>{book.title}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Cover Image */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <BookOpen size={60} />
                </div>
              )}
            </div>
            {book.preview_pdf_url && (
              <Button variant="outline" className="w-full mt-3" onClick={() => setShowPreview(true)}>
                <Eye size={16} /> প্রিভিউ দেখুন
              </Button>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-2xl font-bold text-primary">{book.title}</h1>
            <p className="text-muted-foreground">
              লেখক: <span className="text-foreground font-medium">{book.author_name}</span>
            </p>
            {book.publisher && (
              <p className="text-muted-foreground">
                প্রকাশনী: <span className="text-foreground font-medium">{book.publisher}</span>
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={`${avgRating && s <= Math.round(Number(avgRating)) ? "text-accent fill-accent" : "text-muted"}`}
                  />
                ))}
              </div>
              {avgRating && (
                <span className="text-sm text-muted-foreground">
                  {toBengali(avgRating)} ({toBengali(reviews?.length || 0)} রিভিউ)
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-lg">
              {book.discount_price ? (
                <>
                  <span className="text-3xl font-bold text-primary">৳{toBengali(book.discount_price)}</span>
                  <span className="text-lg text-muted-foreground line-through">৳{toBengali(book.price)}</span>
                  <Badge className="bg-accent text-accent-foreground">{toBengali(discount)}% ছাড়</Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">৳{toBengali(book.price)}</span>
              )}
            </div>

            {/* Info table */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {book.isbn && (
                <div><span className="text-muted-foreground">ISBN:</span> {book.isbn}</div>
              )}
              {book.pages && (
                <div><span className="text-muted-foreground">পৃষ্ঠা:</span> {toBengali(book.pages)}</div>
              )}
              {book.language && (
                <div><span className="text-muted-foreground">ভাষা:</span> {book.language}</div>
              )}
              {book.category && (
                <div><span className="text-muted-foreground">ক্যাটাগরি:</span> {book.category}</div>
              )}
            </div>

            {/* Stock & Buy */}
            {book.stock > 0 ? (
              <div className="space-y-3">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  স্টকে আছে ({toBengali(book.stock)}টি)
                </Badge>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>
                      <Minus size={14} />
                    </Button>
                    <span className="px-3 font-medium">{toBengali(qty)}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQty(Math.min(book.stock, qty + 1))}>
                      <Plus size={14} />
                    </Button>
                  </div>
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart size={16} /> কার্টে যোগ করুন
                  </Button>
                </div>
                <Link to="/checkout">
                  <Button
                    variant="secondary"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleAddToCart}
                  >
                    <Truck size={16} /> এখনই অর্ডার করুন
                  </Button>
                </Link>
              </div>
            ) : (
              <Badge variant="destructive">স্টক আউট</Badge>
            )}

            <div className="text-sm text-muted-foreground flex items-center gap-2 bg-muted/30 p-3 rounded">
              <Truck size={16} /> ক্যাশ অন ডেলিভারি | সারাদেশে ডেলিভারি
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Description */}
        {book.description && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">বিবরণ</h2>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: book.description }} />
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPreview && book.preview_pdf_url && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold">প্রিভিউ: {book.title}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>✕</Button>
              </div>
              <iframe src={book.preview_pdf_url} className="flex-1 w-full" title="Book Preview" />
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">রিভিউ সমূহ ({toBengali(reviews?.length || 0)})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews?.length ? (
                reviews.map((r) => (
                  <div key={r.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.reviewer_name}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= r.rating ? "text-accent fill-accent" : "text-muted"} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">এখনো কোন রিভিউ নেই</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">রিভিউ দিন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="আপনার নাম"
                value={reviewForm.reviewer_name}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm">রেটিং:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    className={`cursor-pointer ${s <= reviewForm.rating ? "text-accent fill-accent" : "text-muted"}`}
                    onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                  />
                ))}
              </div>
              <Textarea
                placeholder="আপনার মন্তব্য (ঐচ্ছিক)"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
              <Button onClick={handleSubmitReview} disabled={submitting || !reviewForm.reviewer_name.trim()}>
                {submitting ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetail;
