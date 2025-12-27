import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingBag } from 'lucide-react';

interface OrderLinksSectionProps {
  title?: string;
  props?: { links?: { name: string; url: string }[] };
}

export function OrderLinksSection({ title = 'Order Online', props }: OrderLinksSectionProps) {
  const links = props?.links || [
    { name: 'DoorDash', url: '' },
    { name: 'UberEats', url: '' },
    { name: 'Direct Order', url: '' },
  ];

  return (
    <div className="py-16 px-6 bg-background">
      <div className="max-w-xl mx-auto text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid gap-4">
          {links.map((link, i) => (
            <Button
              key={i}
              variant="outline"
              size="lg"
              className="w-full justify-between"
              onClick={() => link.url && window.open(link.url, '_blank')}
              disabled={!link.url}
            >
              {link.name}
              <ExternalLink className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
