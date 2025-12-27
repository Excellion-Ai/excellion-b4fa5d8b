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

// Base props that integration components accept
export interface IntegrationSectionBaseProps {
  title?: string;
  body?: string;
  props?: Record<string, unknown>;
}

// Master registry for dynamic component lookup
// Using ComponentType with base props for flexibility
export const INTEGRATION_COMPONENTS: Record<IntegrationComponentKey, ComponentType<IntegrationSectionBaseProps>> = {
  checkout: CheckoutSection as ComponentType<IntegrationSectionBaseProps>,
  booking_embed: BookingEmbedSection as ComponentType<IntegrationSectionBaseProps>,
  order_links: OrderLinksSection as ComponentType<IntegrationSectionBaseProps>,
  reservation_embed: ReservationEmbedSection as ComponentType<IntegrationSectionBaseProps>,
  newsletter_form: NewsletterFormSection as ComponentType<IntegrationSectionBaseProps>,
  map_embed: MapEmbedSection as ComponentType<IntegrationSectionBaseProps>,
};

// Get integration component by type with proper type checking
export function getIntegrationComponent(
  componentType: string
): ComponentType<IntegrationSectionBaseProps> | null {
  if (isValidIntegrationKey(componentType)) {
    return INTEGRATION_COMPONENTS[componentType];
  }
  return null;
}

// Type guard to check if a string is a valid integration key
export function isValidIntegrationKey(key: string): key is IntegrationComponentKey {
  return key in INTEGRATION_COMPONENTS;
}
