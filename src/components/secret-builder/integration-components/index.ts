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

// Get integration component by type
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
