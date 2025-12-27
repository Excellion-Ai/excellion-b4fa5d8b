// Integration Components Registry
export { CheckoutSection } from './CheckoutSection';
export { BookingEmbedSection } from './BookingEmbedSection';
export { OrderLinksSection } from './OrderLinksSection';
export { ReservationEmbedSection } from './ReservationEmbedSection';
export { NewsletterFormSection } from './NewsletterFormSection';
export { MapEmbedSection } from './MapEmbedSection';

export const INTEGRATION_COMPONENTS: Record<string, React.ComponentType<any>> = {};

// Lazy load components to avoid circular deps
export function getIntegrationComponent(componentType: string): React.ComponentType<any> | null {
  switch (componentType) {
    case 'checkout': return CheckoutSection;
    case 'booking_embed': return BookingEmbedSection;
    case 'order_links': return OrderLinksSection;
    case 'reservation_embed': return ReservationEmbedSection;
    case 'newsletter_form': return NewsletterFormSection;
    case 'map_embed': return MapEmbedSection;
    default: return null;
  }
}
