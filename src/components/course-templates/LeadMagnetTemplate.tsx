import { useState } from 'react';
import { ExtendedCourse } from '@/types/course-pages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download,
  FileText,
  CheckCircle2,
  Gift,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface LeadMagnetTemplateProps {
  course: ExtendedCourse;
  isPreview?: boolean;
  onUpdate?: (course: ExtendedCourse) => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
}

export function LeadMagnetTemplate({ 
  course, 
  isPreview,
  onEnroll,
  isEnrolled,
  isEnrolling,
}: LeadMagnetTemplateProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950/20 via-background to-background">
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Gift className="w-3.5 h-3.5 mr-1" />
                Free Download
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {course.title}
              </h1>
              
              {course.tagline && (
                <p className="text-xl text-muted-foreground mb-6">{course.tagline}</p>
              )}
              
              <p className="text-lg text-muted-foreground mb-8">
                {course.description}
              </p>

              {/* What's Inside */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="space-y-3 mb-8">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    What's Inside:
                  </h3>
                  <ul className="space-y-2">
                    {course.learningOutcomes.slice(0, 5).map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-foreground/80">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Download Form */}
            <div>
              <Card className="bg-gradient-to-br from-emerald-950/50 to-teal-950/50 border-emerald-500/30">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <FileText className="w-8 h-8 text-emerald-400" />
                  </div>
                  <CardTitle className="text-xl">
                    {isEnrolled ? 'Download Ready!' : 'Get Your Free Copy'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEnrolled ? (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        Thank you! Your download is ready.
                      </p>
                      <Button 
                        size="lg" 
                        className="w-full text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Your first name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-background/50 border-emerald-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-background/50 border-emerald-500/30"
                        />
                      </div>
                      <Button 
                        size="lg" 
                        className="w-full text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        onClick={onEnroll}
                        disabled={isEnrolling || isPreview}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Get Instant Access
                      </Button>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        We respect your privacy. Unsubscribe anytime.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trust badges */}
              <div className="flex justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">10k+</div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">4.9</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">Free</div>
                  <div className="text-xs text-muted-foreground">Forever</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
