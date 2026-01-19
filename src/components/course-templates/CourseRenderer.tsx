import { ExtendedCourse } from '@/types/course-pages';
import { StandardCourseTemplate } from './StandardCourseTemplate';
import { ChallengeTemplate } from './ChallengeTemplate';
import { WebinarTemplate } from './WebinarTemplate';
import { LeadMagnetTemplate } from './LeadMagnetTemplate';
import { CoachPortfolioTemplate } from './CoachPortfolioTemplate';

export type OfferType = 'standard' | 'challenge' | 'webinar' | 'lead_magnet' | 'coach_portfolio';

interface CourseWithOfferType extends ExtendedCourse {
  offer_type?: OfferType;
}

interface CourseRendererProps {
  course: CourseWithOfferType;
  isPreview?: boolean;
  onUpdate?: (course: ExtendedCourse) => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
}

export function CourseRenderer({ 
  course, 
  isPreview = false, 
  onUpdate,
  onEnroll,
  isEnrolled,
  isEnrolling,
}: CourseRendererProps) {
  const offerType = course.offer_type || 'standard';

  switch (offerType) {
    case 'challenge':
      return (
        <ChallengeTemplate 
          course={course} 
          isPreview={isPreview} 
          onUpdate={onUpdate}
          onEnroll={onEnroll}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
        />
      );
    case 'webinar':
      return (
        <WebinarTemplate 
          course={course} 
          isPreview={isPreview} 
          onUpdate={onUpdate}
          onEnroll={onEnroll}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
        />
      );
    case 'lead_magnet':
      return (
        <LeadMagnetTemplate 
          course={course} 
          isPreview={isPreview} 
          onUpdate={onUpdate}
          onEnroll={onEnroll}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
        />
      );
    case 'coach_portfolio':
      return (
        <CoachPortfolioTemplate 
          course={course} 
          isPreview={isPreview} 
          onUpdate={onUpdate}
          onEnroll={onEnroll}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
        />
      );
    default:
      return (
        <StandardCourseTemplate 
          course={course} 
          isPreview={isPreview} 
          onUpdate={onUpdate}
          onEnroll={onEnroll}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
        />
      );
  }
}
