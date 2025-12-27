import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NewsletterFormSectionProps {
  title?: string;
  body?: string;
}

export function NewsletterFormSection({ title = 'Stay Updated', body }: NewsletterFormSectionProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Thanks for subscribing!');
      setEmail('');
    }
  };

  return (
    <div className="py-16 px-6 bg-primary/5">
      <div className="max-w-xl mx-auto text-center">
        <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{body || 'Subscribe to our newsletter for the latest updates.'}</p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </div>
  );
}
