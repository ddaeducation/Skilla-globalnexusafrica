import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Review {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

const CourseReviews = ({ courseId }: { courseId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("course_ratings")
        .select("id, rating, review, created_at, user_id")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const enriched = data.map((r) => ({
          ...r,
          profile: profiles?.find((p) => p.id === r.user_id) || null,
        }));
        setReviews(enriched as Review[]);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [courseId]);

  if (loading || reviews.length === 0) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Student Reviews
      </h3>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
          <div className="flex gap-0.5 justify-center my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= Math.round(avgRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-right text-muted-foreground">{d.star}★</span>
              <Progress value={d.pct} className="h-2 flex-1" />
              <span className="w-8 text-muted-foreground">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-3">
        {reviews
          .filter((r) => r.review)
          .slice(0, 6)
          .map((r) => (
            <Card key={r.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={r.profile?.avatar_url || ""} />
                    <AvatarFallback className="text-xs">
                      {(r.profile?.full_name || "S").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {r.profile?.full_name || "Student"}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.review}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default CourseReviews;
