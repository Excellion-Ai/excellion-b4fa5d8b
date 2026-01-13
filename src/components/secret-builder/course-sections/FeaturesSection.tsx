import React from 'react';
import { CheckCircle, Clock, Users, Award, Video, FileText, MessageSquare, Download } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesSectionProps {
  features?: Feature[];
  durationWeeks?: number;
  lessonCount?: number;
  difficulty?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircle,
  clock: Clock,
  users: Users,
  award: Award,
  video: Video,
  file: FileText,
  message: MessageSquare,
  download: Download,
};

const DEFAULT_FEATURES: Feature[] = [
  { title: 'Self-Paced Learning', description: 'Learn at your own speed', icon: 'clock' },
  { title: 'Lifetime Access', description: 'Access content forever', icon: 'award' },
  { title: 'Community Support', description: 'Connect with fellow students', icon: 'users' },
  { title: 'Downloadable Resources', description: 'Take materials offline', icon: 'download' },
];

export function FeaturesSection({
  features = DEFAULT_FEATURES,
  durationWeeks,
  lessonCount,
  difficulty,
}: FeaturesSectionProps) {
  const displayFeatures = features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-amber-100">
          Course Features
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Everything you need to succeed in your learning journey
        </p>

        {/* Stats row */}
        {(durationWeeks || lessonCount || difficulty) && (
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {durationWeeks && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-sm">{durationWeeks} weeks</span>
              </div>
            )}
            {lessonCount && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border">
                <Video className="w-5 h-5 text-amber-400" />
                <span className="text-sm">{lessonCount} lessons</span>
              </div>
            )}
            {difficulty && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-sm capitalize">{difficulty}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayFeatures.map((feature, index) => {
            const IconComponent = ICON_MAP[feature.icon || 'check'] || CheckCircle;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-card/30 border border-border hover:border-amber-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
