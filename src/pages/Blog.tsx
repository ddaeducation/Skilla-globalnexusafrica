import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, ArrowLeft, Newspaper } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog & News | Global Nexus Institute</title>
        <meta name="description" content="Stay updated with the latest news, articles, and updates from Global Nexus Institute." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navigation activeTab="home" onTabChange={() => {}} />
        <main className="flex-1 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Newspaper className="w-4 h-4" />
                Blog & News
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Latest Articles & Updates</h1>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Stay informed with the latest news, insights, and announcements from Global Nexus Institute.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">No articles published yet. Check back soon!</div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <Card className="overflow-hidden h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                      {post.cover_image_url ? (
                        <div className="aspect-video overflow-hidden">
                          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <Newspaper className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
                        </div>
                        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                        {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>}
                        <span className="inline-block text-sm text-primary font-medium">Read more →</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (data) setPost(data);
      setLoading(false);
    };
    if (slug) fetchPost();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col">
      <Navigation activeTab="home" onTabChange={() => {}} />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article not found</h1>
          <Link to="/blog"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to Blog</Button></Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{post.title} | Global Nexus Institute</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navigation activeTab="home" onTabChange={() => {}} />
        <main className="flex-1 py-12">
          <article className="max-w-3xl mx-auto px-4 sm:px-6">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="w-4 h-4" />Back to Blog
            </Link>
            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="w-full aspect-video object-cover rounded-xl mb-8" />
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <CalendarDays className="w-4 h-4" />
              {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{post.title}</h1>
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
};

const Blog = () => {
  const { slug } = useParams<{ slug: string }>();
  return slug ? <BlogDetail /> : <BlogList />;
};

export default Blog;
