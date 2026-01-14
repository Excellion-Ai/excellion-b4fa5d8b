import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, Send, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CourseReviewFormProps {
  courseId: string;
  enrollmentId: string;
  userId: string;
  hasCompletedCourse: boolean;
  onReviewSubmitted?: () => void;
}

interface ExistingReview {
  id: string;
  rating: number;
  title: string | null;
  review: string | null;
}

export default function CourseReviewForm({
  courseId,
  enrollmentId,
  userId,
  hasCompletedCourse,
  onReviewSubmitted,
}: CourseReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchExistingReview = async () => {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('id, rating, title, review')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setExistingReview(data);
        setRating(data.rating);
        setTitle(data.title || '');
        setReview(data.review || '');
      }
      setIsLoading(false);
    };

    fetchExistingReview();
  }, [courseId, userId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from('course_reviews')
        .update({
          rating,
          title: title.trim() || null,
          review: review.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingReview.id);

      setIsSubmitting(false);

      if (error) {
        toast.error('Failed to update review');
        return;
      }

      setExistingReview({ ...existingReview, rating, title, review });
      setIsEditing(false);
      toast.success('Review updated!');
    } else {
      // Create new review
      const { data, error } = await supabase
        .from('course_reviews')
        .insert({
          course_id: courseId,
          user_id: userId,
          enrollment_id: enrollmentId,
          rating,
          title: title.trim() || null,
          review: review.trim() || null,
          is_verified_completion: hasCompletedCourse,
        })
        .select('id, rating, title, review')
        .single();

      setIsSubmitting(false);

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this course');
        } else {
          toast.error('Failed to submit review');
        }
        return;
      }

      setExistingReview(data);
      toast.success('Review submitted! Thank you for your feedback.');
    }

    onReviewSubmitted?.();
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    const { error } = await supabase
      .from('course_reviews')
      .delete()
      .eq('id', existingReview.id);

    if (error) {
      toast.error('Failed to delete review');
      return;
    }

    setExistingReview(null);
    setRating(0);
    setTitle('');
    setReview('');
    setIsEditing(false);
    toast.success('Review deleted');
    onReviewSubmitted?.();
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-6 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Show existing review (not in edit mode)
  if (existingReview && !isEditing) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Review</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 px-2"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your review. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-5 w-5',
                  star <= existingReview.rating ? 'text-primary fill-primary' : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
          {existingReview.title && (
            <h4 className="font-medium text-foreground">{existingReview.title}</h4>
          )}
          {existingReview.review && (
            <p className="text-sm text-muted-foreground">{existingReview.review}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show review form
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {existingReview ? 'Edit Your Review' : 'Leave a Review'}
          </CardTitle>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Rating *</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    star <= (hoverRating || rating)
                      ? 'text-primary fill-primary'
                      : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Review Title (Optional)</label>
          <Input
            placeholder="Summarize your experience..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="bg-background"
          />
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Review (Optional)</label>
          <Textarea
            placeholder="What did you like or dislike? What did you learn?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            maxLength={2000}
            className="bg-background resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{review.length}/2000</p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {existingReview ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {existingReview ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </Button>

        {hasCompletedCourse && !existingReview && (
          <p className="text-xs text-green-400 text-center">
            ✓ Your review will be marked as verified since you completed this course
          </p>
        )}
      </CardContent>
    </Card>
  );
}
