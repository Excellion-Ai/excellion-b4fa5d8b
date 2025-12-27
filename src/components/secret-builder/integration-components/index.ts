// Integration Components Registry
import React from 'react';
import { CheckoutSection } from './CheckoutSection';
import { BookingEmbedSection } from './BookingEmbedSection';
import { OrderLinksSection } from './OrderLinksSection';
import { ReservationEmbedSection } from './ReservationEmbedSection';
import { NewsletterFormSection } from './NewsletterFormSection';
import { MapEmbedSection } from './MapEmbedSection';

// Re-export components
export { 
  CheckoutSection, 
  BookingEmbedSection, 
  OrderLinksSection, 
  ReservationEmbedSection, 
  NewsletterFormSection, 
  MapEmbedSection 
};

// Master registry for dynamic component lookup
export const INTEGRATION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  checkout: CheckoutSection,
  booking_embed: BookingEmbedSection,
  order_links: OrderLinksSection,
  reservation_embed: ReservationEmbedSection,
  newsletter_form: NewsletterFormSection,
  map_embed: MapEmbedSection,
};

// Get integration component by type (legacy function)
export function getIntegrationComponent(componentType: string): React.ComponentType<any> | null {
  return INTEGRATION_COMPONENTS[componentType] || null;
}
