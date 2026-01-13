import React from 'react';
import { User, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  name: string;
  role?: string;
  quote: string;
  rating?: number;
  imageUrl?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  onAdd?: () => void;
}

const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Student Name',
    role: 'Course Graduate',
    quote: '"Add a testimonial from a satisfied student here..."',
    rating: 5,
  },
  {
    name: 'Another Student',
    role: 'Professional',
    quote: '"Share how this course transformed their skills..."',
    rating: 5,
  },
  {
    name: 'Happy Learner',
    role: 'Career Changer',
    quote: '"Describe the impact this course had on their career..."',
    rating: 5,
  },
];

export function TestimonialsSection({
  testimonials = PLACEHOLDER_TESTIMONIALS,
  onAdd,
}: TestimonialsSectionProps) {
  const displayTestimonials = testimonials.length > 0 ? testimonials : PLACEHOLDER_TESTIMONIALS;

  return (
    <section className="py-16 px-6 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-amber-100">
          What Students Are Saying
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card/50 rounded-xl p-6 border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                {testimonial.imageUrl ? (
                  <img
                    src={testimonial.imageUrl}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  {testimonial.role && (
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  )}
                </div>
              </div>

              {testimonial.rating && (
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              )}

              <p className="text-sm text-muted-foreground italic">
                {testimonial.quote}
              </p>
            </div>
          ))}
        </div>

        {onAdd && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={onAdd}
              className="border-amber-500/30 text-amber-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
