// Integration Components Registry
import type { ComponentType } from 'react';
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

// Valid component type keys
export type IntegrationComponentKey = 
  | 'checkout' 
  | 'booking_embed' 
  | 'order_links' 
  | 'reservation_embed' 
  | 'newsletter_form' 
  | 'map_embed';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const INTEGRATION_COMPONENTS: Record<string, ComponentType<any>> = {
  checkout: CheckoutSection,
  booking_embed: BookingEmbedSection,
  order_links: OrderLinksSection,
  reservation_embed: ReservationEmbedSection,
  newsletter_form: NewsletterFormSection,
  map_embed: MapEmbedSection,
};

// Get integration component by type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIntegrationComponent(componentType: string): ComponentType<any> | null {
  return INTEGRATION_COMPONENTS[componentType] || null;
}

// Type guard to check if a string is a valid integration key
export function isValidIntegrationKey(key: string): key is IntegrationComponentKey {
  return key in INTEGRATION_COMPONENTS;
}
