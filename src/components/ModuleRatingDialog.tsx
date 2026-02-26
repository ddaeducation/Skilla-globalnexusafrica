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
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ModuleRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  sectionId: string;
  sectionTitle: string;
  userId: string;
  onRatingSubmitted: () => void;
}

const ModuleRatingDialog = ({
  open,
  onOpenChange,
  courseId,
  sectionId,
  sectionTitle,
  userId,
  onRatingSubmitted,
}: ModuleRatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && courseId && sectionId && userId) {
      supabase
        .from("module_ratings")
        .select("rating, review")
        .eq("course_id", courseId)
        .eq("section_id", sectionId)
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
    }
  }, [open, courseId, sectionId, userId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (existingRating !== null) {
        const { error } = await supabase
          .from("module_ratings")
          .update({ rating, review: review || null })
          .eq("course_id", courseId)
          .eq("section_id", sectionId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("module_ratings")
          .insert({
            course_id: courseId,
            section_id: sectionId,
            user_id: userId,
            rating,
            review: review || null,
          });
        if (error) throw error;
      }

      toast({ title: "Thank you!", description: "Your module rating has been saved." });
      onRatingSubmitted();
    } catch (error: any) {
      console.error("Module rating error:", error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Rate this Module</DialogTitle>
          <DialogDescription className="text-center">
            You've completed <span className="font-semibold text-foreground">{sectionTitle}</span>! How was it?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
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
            placeholder="Share your thoughts on this module (optional)..."
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
              existingRating !== null ? "Update Rating" : "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleRatingDialog;
