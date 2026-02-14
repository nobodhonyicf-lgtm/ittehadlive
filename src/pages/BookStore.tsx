import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useBooks } from "@/hooks/useBookData";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Star, BookOpen } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const BookStore = () => {
  const { data: books, isLoading } = useBooks();
  const { addToCart, totalItems } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [...new Set(books?.map((b) => b.category).filter(Boolean))];

  const filtered = books?.filter((b) => {
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || b.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <SEOHead title="প্রকাশনা - বই কিনুন" description="আমাদের প্রকাশিত বই সমূহ কিনুন" />
      
      {/* Hero Banner */}
      <div className="bg-primary text-primary-foreground py-8 px-4 mb-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <BookOpen size={32} /> প্রকাশনা
          </h1>
          <p className="opacity-90">আমাদের প্রকাশিত সকল বই এখানে পাবেন</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="বই বা লেখকের নাম খুঁজুন..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={!selectedCategory ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("")}
            >
              সকল
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat!)}
              >
                {cat}
              </Badge>
            ))}
            <Link to="/cart" className="ml-auto">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart size={18} />
                কার্ট
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {toBengali(totalItems)}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
          </div>
        ) : !filtered?.length ? (
          <div className="text-center py-12 text-muted-foreground">কোন বই পাওয়া যায়নি</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((book) => (
              <Card key={book.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/book/${book.slug}`}>
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <BookOpen size={40} />
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-3">
                  <Link to={`/book/${book.slug}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">{book.author_name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} className="text-accent fill-accent" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {book.discount_price ? (
                      <>
                        <span className="font-bold text-primary text-sm">৳{toBengali(book.discount_price)}</span>
                        <span className="text-xs text-muted-foreground line-through">৳{toBengali(book.price)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-primary text-sm">৳{toBengali(book.price)}</span>
                    )}
                  </div>
                  {book.stock > 0 ? (
                    <Button
                      size="sm"
                      className="w-full mt-2 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          bookId: book.id,
                          title: book.title,
                          price: Number(book.price),
                          discountPrice: book.discount_price ? Number(book.discount_price) : undefined,
                          coverImage: book.cover_image_url || undefined,
                          slug: book.slug,
                        });
                        toast.success("কার্টে যোগ হয়েছে");
                      }}
                    >
                      <ShoppingCart size={14} /> কার্টে যোগ করুন
                    </Button>
                  ) : (
                    <Badge variant="destructive" className="w-full mt-2 justify-center text-xs">
                      স্টক আউট
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookStore;
