import { UtensilsCrossed } from 'lucide-react';

interface ReservationEmbedSectionProps {
  title?: string;
  props?: { embedUrl?: string };
}

export function ReservationEmbedSection({ title = 'Make a Reservation', props }: ReservationEmbedSectionProps) {
  const embedUrl = props?.embedUrl;

  return (
    <div className="py-16 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-[500px] border-0 rounded-lg"
            title="Reservation Widget"
          />
        ) : (
          <div className="bg-muted rounded-lg p-12">
            <p className="text-muted-foreground">Reservation widget will appear here</p>
            <p className="text-sm text-muted-foreground mt-2">Connect OpenTable, Resy, or your reservation system</p>
          </div>
        )}
      </div>
    </div>
  );
}
