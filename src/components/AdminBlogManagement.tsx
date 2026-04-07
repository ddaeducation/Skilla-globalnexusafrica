import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RichTextEditor } from "@/components/RichTextEditor";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const AdminBlogManagement = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const openCreate = () => {
    setSelectedPost(null);
    setTitle("");
    setContent("");
    setExcerpt("");
    setCoverImageUrl("");
    setStatus("draft");
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt || "");
    setCoverImageUrl(post.cover_image_url || "");
    setStatus(post.status);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const slug = generateSlug(title);
    const postData = {
      title: title.trim(),
      slug: selectedPost ? selectedPost.slug : slug,
      content,
      excerpt: excerpt.trim() || null,
      cover_image_url: coverImageUrl || null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      author_id: session.user.id,
    };

    let error;
    if (selectedPost) {
      const { error: e } = await supabase.from("blog_posts").update(postData).eq("id", selectedPost.id);
      error = e;
    } else {
      const { error: e } = await supabase.from("blog_posts").insert(postData);
      error = e;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: selectedPost ? "Article updated" : "Article created" });
      setDialogOpen(false);
      fetchPosts();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", selectedPost.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article deleted" });
      setDeleteDialogOpen(false);
      setSelectedPost(null);
      fetchPosts();
    }
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search articles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Article</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No articles found. Create your first article!</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(post => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {post.cover_image_url && (
                        <img src={post.cover_image_url} alt="" className="w-12 h-8 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-medium">{post.title}</p>
                        {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(post.published_at || post.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {post.status === "published" && (
                        <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedPost(post); setDeleteDialogOpen(true); }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary..." rows={2} />
            </div>
            <div>
              <Label>Cover Image</Label>
              {coverImageUrl ? (
                <div className="relative mt-2">
                  <img src={coverImageUrl} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setCoverImageUrl("")}>Remove</Button>
                </div>
              ) : (
                <FileUpload value="" onChange={setCoverImageUrl} accept="image/*" label="Upload cover image" folder="blog" />
              )}
            </div>
            <div>
              <Label>Content *</Label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedPost ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlogManagement;
