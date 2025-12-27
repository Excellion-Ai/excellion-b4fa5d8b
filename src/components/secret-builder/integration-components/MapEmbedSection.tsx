import { MapPin } from 'lucide-react';

interface MapEmbedSectionProps {
  title?: string;
  props?: { address?: string };
}

export function MapEmbedSection({ title = 'Find Us', props }: MapEmbedSectionProps) {
  const address = props?.address;
  const encodedAddress = address ? encodeURIComponent(address) : '';

  return (
    <div className="py-16 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold">{title}</h2>
          {address && <p className="text-muted-foreground mt-2">{address}</p>}
        </div>
        {address ? (
          <iframe
            src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
            className="w-full h-[400px] border-0 rounded-lg"
            title="Location Map"
            loading="lazy"
          />
        ) : (
          <div className="bg-muted rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Map will appear here</p>
            <p className="text-sm text-muted-foreground mt-2">Add your business address to display the map</p>
          </div>
        )}
      </div>
    </div>
  );
}
