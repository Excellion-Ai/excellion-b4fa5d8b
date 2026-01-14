import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageSquare, User, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  review: string | null;
  is_verified_completion: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

interface CourseReviewsProps {
  courseId: string;
  averageRating: number | null;
  reviewCount: number;
}

const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
};

const RatingBreakdown = ({ reviews }: { reviews: Review[] }) => {
  const breakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percent };
  });

  return (
    <div className="space-y-2">
      {breakdown.map(({ rating, count, percent }) => (
        <div key={rating} className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-6">{rating}</span>
          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
          <Progress value={percent} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground w-8">{count}</span>
        </div>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const displayName = review.profiles?.display_name || 'Anonymous';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border-b border-border pb-6 last:border-0 last:pb-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground">{displayName}</span>
            {review.is_verified_completion && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                <Check className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          {review.title && (
            <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
          )}
          {review.review && (
            <p className="text-sm text-muted-foreground leading-relaxed">{review.review}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CourseReviews({ courseId, averageRating, reviewCount }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const fetchReviews = async () => {
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from('course_reviews')
        .select('id, rating, title, review, is_verified_completion, created_at, user_id')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error || !reviewsData) {
        setIsLoading(false);
        return;
      }

      // Fetch profiles for all reviewers
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      const reviewsWithProfiles: Review[] = reviewsData.map(r => ({
        ...r,
        profiles: profilesMap.get(r.user_id) || null,
      }));

      setReviews(reviewsWithProfiles);
      setIsLoading(false);
    };

    fetchReviews();
  }, [courseId]);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0 && reviewCount === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to share your experience!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Student Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-border">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold text-foreground mb-2">
              {averageRating?.toFixed(1) || '0.0'}
            </div>
            <StarRating rating={Math.round(averageRating || 0)} size="lg" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <RatingBreakdown reviews={reviews} />
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Show More Button */}
        {reviews.length > visibleCount && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 5)}
            >
              Show More Reviews ({reviews.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
