import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid } from 'lucide-react';

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">My Hub</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/secret-builder')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Builder
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Your saved projects will appear here.
          </p>
          <Button onClick={() => navigate('/secret-builder-hub')}>
            View All Projects
          </Button>
        </div>
      </div>
    </div>
  );
}
