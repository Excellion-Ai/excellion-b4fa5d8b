import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, BookOpen, ExternalLink, MessageCircle, Rocket } from 'lucide-react';

const RESOURCES = [
  { title: 'Documentation', description: 'Learn how to use Excellion Builder', icon: BookOpen, href: 'https://docs.excellion.dev' },
  { title: 'Getting Started Guide', description: 'Quick start tutorial for new users', icon: Rocket, href: 'https://docs.excellion.dev/getting-started' },
  { title: 'Community Discord', description: 'Join our community for help and tips', icon: MessageCircle, href: 'https://discord.gg/excellion' },
];

export default function HelpSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Documentation</h1>
        <p className="text-muted-foreground">Resources to help you get the most out of Excellion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Resources
          </CardTitle>
          <CardDescription>Helpful guides and documentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {RESOURCES.map((resource) => {
            const Icon = resource.icon;
            return (
              <a
                key={resource.title}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
