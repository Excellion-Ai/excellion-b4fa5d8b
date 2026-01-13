import React from 'react';
import { User, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstructorSectionProps {
  name?: string;
  bio?: string;
  imageUrl?: string;
  onEdit?: () => void;
}

export function InstructorSection({
  name = 'Your Name',
  bio = 'Add your bio here. Share your expertise, credentials, and why students should learn from you.',
  imageUrl,
  onEdit,
}: InstructorSectionProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-amber-100">
          Meet Your Instructor
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-40 h-40 rounded-full object-cover border-4 border-amber-500/30"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-card border-4 border-amber-500/30 flex items-center justify-center">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-semibold mb-3">{name}</h3>
            <p className="text-muted-foreground leading-relaxed">{bio}</p>
            
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="mt-4 border-amber-500/30 text-amber-400"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
