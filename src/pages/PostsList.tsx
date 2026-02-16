import Layout from "@/components/layout/Layout";
import { usePosts, useCategories } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Calendar, Newspaper, User, Search, Clock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toBengali } from "@/lib/bengali";
import { timeAgo } from "@/lib/timeAgo";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageSidebar from "@/components/home/PageSidebar";

const POSTS_PER_PAGE = 10;

const PostsList = () => {
  const { data: posts, isLoading } = usePosts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = posts?.filter(p => {
    const matchSearch = !search || p.title.includes(search) || p.content?.includes(search);
    const matchCat = !categoryFilter || p.category_id === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil((filtered?.length || 0) / POSTS_PER_PAGE);
  const paginated = filtered?.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <Layout>
      <SEOHead title="সকল পোস্ট" description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ এর সকল সংবাদ ও পোস্ট" />
      <div className="px-4 py-6">
        <Breadcrumbs items={[{ label: "সকল পোস্ট" }]} />
        <h1 className="text-2xl font-bold text-primary mb-4">সকল পোস্ট</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="খুঁজুন..." className="pl-10" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">সকল ক্যাটাগরি</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted h-32 rounded" />
              ))
            ) : paginated?.length ? (
              paginated.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.slug}`}
                  className="block bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-28 h-24 bg-muted rounded shrink-0 flex items-center justify-center overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <Newspaper className="text-muted-foreground" size={24} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {post.categories && (
                        <span className="text-xs font-bold text-destructive uppercase tracking-wide">
                          {post.categories.name}
                        </span>
                      )}
                      <h2 className="font-bold group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                        {post.title}
                      </h2>
                      {(post as any).summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {(post as any).summary}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {timeAgo(post.created_at)}
                        </span>
                        {(post as any).author_name && (
                          <span className="flex items-center gap-1"><User size={12} /> {(post as any).author_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">কোনো পোস্ট পাওয়া যায়নি</p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1.5 rounded text-sm ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                  >
                    {toBengali(i + 1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <PageSidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostsList;
