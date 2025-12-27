import { Calendar } from 'lucide-react';

interface BookingEmbedSectionProps {
  title?: string;
  props?: { calendlyUrl?: string };
}

export function BookingEmbedSection({ title = 'Book Your Appointment', props }: BookingEmbedSectionProps) {
  const calendlyUrl = props?.calendlyUrl;

  return (
    <div className="py-16 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {calendlyUrl ? (
          <iframe
            src={calendlyUrl}
            className="w-full h-[600px] border-0 rounded-lg"
            title="Booking Calendar"
          />
        ) : (
          <div className="bg-muted rounded-lg p-12">
            <p className="text-muted-foreground">Booking calendar will appear here</p>
            <p className="text-sm text-muted-foreground mt-2">Connect your Calendly or booking system</p>
          </div>
        )}
      </div>
    </div>
  );
}
