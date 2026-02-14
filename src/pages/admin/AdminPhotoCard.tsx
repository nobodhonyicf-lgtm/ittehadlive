import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageIcon } from "lucide-react";
import PhotoCardEditor from "@/components/post/PhotoCardEditor";

const AdminPhotoCard = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin_posts_photocard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, image_url, created_at, categories(name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const openEditor = (post: any) => {
    setSelectedPost(post);
    setEditorOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ImageIcon size={20} /> ফটো কার্ড অপশন
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>শিরোনাম</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">লোড হচ্ছে...</TableCell></TableRow>
              ) : posts?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                  <TableCell>{post.categories?.name || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("bn-BD")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEditor(post)}>
                      <ImageIcon size={14} /> কার্ড তৈরি
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPost && (
        <PhotoCardEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editMode={true}
          post={{
            title: selectedPost.title,
            slug: selectedPost.slug,
            image_url: selectedPost.image_url,
            created_at: selectedPost.created_at,
          }}
        />
      )}
    </div>
  );
};

export default AdminPhotoCard;
