import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SocialSharePrompt from "@/components/SocialSharePrompt";

interface CourseRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  userId: string;
  onRatingSubmitted: () => void;
}

const CourseRatingDialog = ({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  userId,
  onRatingSubmitted,
}: CourseRatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [moduleAverage, setModuleAverage] = useState<number | null>(null);
  const [moduleCount, setModuleCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open && courseId && userId) {
      // Check existing overall rating
      supabase
        .from("course_ratings")
        .select("rating, review")
        .eq("course_id", courseId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setRating(data.rating);
            setReview(data.review || "");
            setExistingRating(data.rating);
          } else {
            setRating(0);
            setReview("");
            setExistingRating(null);
          }
        });

      // Fetch module ratings average
      supabase
        .from("module_ratings")
        .select("rating")
        .eq("course_id", courseId)
        .eq("user_id", userId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
            setModuleAverage(Math.round(avg * 10) / 10);
            setModuleCount(data.length);
            // Pre-fill with rounded average if no existing overall rating
            if (!existingRating) {
              setRating(Math.round(avg));
            }
          } else {
            setModuleAverage(null);
            setModuleCount(0);
          }
        });
    }
  }, [open, courseId, userId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (existingRating !== null) {
        const { error } = await supabase
          .from("course_ratings")
          .update({ rating, review: review || null })
          .eq("course_id", courseId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("course_ratings")
          .insert({ course_id: courseId, user_id: userId, rating, review: review || null });
        if (error) throw error;
      }

      toast({ title: "Thank you!", description: "Your rating has been submitted." });

      // Show social share only if average >= 4
      const effectiveAvg = moduleAverage || rating;
      if (effectiveAvg >= 4) {
        setShowSharePrompt(true);
      } else {
        onRatingSubmitted();
      }
    } catch (error: any) {
      console.error("Rating error:", error);
      toast({ title: "Error", description: error.message || "Failed to submit rating", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onRatingSubmitted();
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const displayRating = hoveredRating || rating;

  return (
    <>
      <Dialog open={open && !showSharePrompt} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Rate this Course</DialogTitle>
            <DialogDescription className="text-center">
              How was your overall experience with <span className="font-semibold text-foreground">{courseTitle}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {/* Module average summary */}
            {moduleAverage !== null && moduleCount > 0 && (
              <div className="w-full rounded-lg border bg-muted/50 p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Your Module Average: 
                  <span className="text-primary font-bold">{moduleAverage.toFixed(1)}</span>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {moduleCount} module {moduleCount === 1 ? "rating" : "ratings"}. 
                  {existingRating !== null 
                    ? " Would you like to update your overall rating?" 
                    : " Set your overall course rating below."}
                </p>
              </div>
            )}

            {/* Stars */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= displayRating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            {displayRating > 0 && (
              <p className="text-sm font-medium text-muted-foreground">
                {ratingLabels[displayRating]}
              </p>
            )}

            <Textarea
              placeholder="Share your experience (optional)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="ghost" onClick={handleSkip} disabled={submitting}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                existingRating !== null ? "Update & Download" : "Submit & Download"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SocialSharePrompt
        open={showSharePrompt}
        onOpenChange={setShowSharePrompt}
        courseTitle={courseTitle}
        rating={rating}
        review={review}
        onDone={() => {
          setShowSharePrompt(false);
          onRatingSubmitted();
        }}
      />
    </>
  );
};

export default CourseRatingDialog;
