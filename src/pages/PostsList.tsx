import Layout from "@/components/layout/Layout";
import { usePosts, useCategories } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Calendar, Newspaper, User, Search } from "lucide-react";
import Sidebar from "@/components/home/Sidebar";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
      <div className="px-4 py-6">
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
                  className="block bg-card border rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded shrink-0 flex items-center justify-center overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <Newspaper className="text-muted-foreground" size={24} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString("bn-BD")}</span>
                        {(post as any).author_name && (
                          <span className="flex items-center gap-1"><User size={12} /> {(post as any).author_name}</span>
                        )}
                        {post.categories && (
                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{post.categories.name}</span>
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
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostsList;
