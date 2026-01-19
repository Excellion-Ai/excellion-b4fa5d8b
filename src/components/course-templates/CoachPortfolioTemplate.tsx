import { ExtendedCourse } from '@/types/course-pages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User,
  Award,
  Star,
  Calendar,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Mail,
  ExternalLink,
} from 'lucide-react';

interface CoachPortfolioTemplateProps {
  course: ExtendedCourse;
  isPreview?: boolean;
  onUpdate?: (course: ExtendedCourse) => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
}

export function CoachPortfolioTemplate({ 
  course, 
  isPreview,
  onEnroll,
  isEnrolling,
}: CoachPortfolioTemplateProps) {
  // Use course modules as "services/packages"
  const services = course.modules?.map(module => ({
    title: module.title,
    description: module.description,
    features: module.lessons?.map(l => l.title) || [],
    id: module.id,
  })) || [];

  const instructor = course.pages?.instructor;
  const testimonials = course.pages?.faq?.slice(0, 3).map(faq => ({
    quote: faq.answer,
    name: faq.question.replace('?', ''),
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950/10 via-background to-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4 bg-gradient-to-br from-rose-600/10 via-background to-pink-600/5">
        <div className="max-w-4xl mx-auto text-center">
          {/* Avatar */}
          <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-rose-500/30">
            <AvatarImage src={instructor?.avatar} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-400">
              {course.title.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Badge className="mb-4 bg-rose-500/20 text-rose-400 border-rose-500/30">
            <Award className="w-3.5 h-3.5 mr-1" />
            Certified Coach
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            {course.title}
          </h1>
          
          {course.tagline && (
            <p className="text-xl text-muted-foreground mb-6">{course.tagline}</p>
          )}
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {course.description}
          </p>

          {/* CTA Buttons */}
          {!isPreview && (
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                onClick={onEnroll}
                disabled={isEnrolling}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book a Call
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 border-rose-500/30 hover:bg-rose-500/10"
              >
                <Mail className="w-5 h-5 mr-2" />
                Get in Touch
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* About Section */}
        {instructor?.bio && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <User className="w-6 h-6 text-rose-500" />
              About Me
            </h2>
            <Card className="bg-card/60 border-rose-500/20">
              <CardContent className="p-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {instructor.bio}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Services/Packages Grid */}
        {services.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Award className="w-6 h-6 text-rose-500" />
              Services & Packages
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className="bg-card/60 border-rose-500/20 hover:border-rose-500/40 transition-colors"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {service.features.length > 0 && (
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                            <span className="text-foreground/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-rose-500/30 hover:bg-rose-500/10"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Credentials/Outcomes */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Star className="w-6 h-6 text-rose-500" />
              Credentials & Expertise
            </h2>
            <Card className="bg-card/60 border-rose-500/20">
              <CardContent className="p-6">
                <ul className="grid md:grid-cols-2 gap-4">
                  {course.learningOutcomes.map((credential, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{credential}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-rose-500" />
              Client Success Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="bg-card/60 border-rose-500/20">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-rose-500 text-rose-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    <p className="font-medium text-foreground">— {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        {!isPreview && (
          <section className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Ready to Work Together?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Let's discuss how I can help you achieve your goals. Book a free discovery call today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                onClick={onEnroll}
                disabled={isEnrolling}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Free Call
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
