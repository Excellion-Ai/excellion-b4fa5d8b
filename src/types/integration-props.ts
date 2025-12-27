// ============= Integration Component Props =============
// Explicit prop types for integration components

import type { SiteSection, SiteTheme } from './site-spec';

// Base props for all integration components
export interface IntegrationSectionProps {
  section: SiteSection;
  theme: SiteTheme;
}

// Specific props for each integration component
export interface CheckoutProps extends IntegrationSectionProps {
  stripeKey?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
  }>;
}

export interface BookingEmbedProps extends IntegrationSectionProps {
  calendlyUrl?: string;
  timezone?: string;
}

export interface OrderLinksProps extends IntegrationSectionProps {
  providers?: Array<{
    name: string;
    url: string;
    logo?: string;
  }>;
}

export interface ReservationEmbedProps extends IntegrationSectionProps {
  openTableId?: string;
  resyId?: string;
}

export interface MapEmbedProps extends IntegrationSectionProps {
  address?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
}

export interface NewsletterFormProps extends IntegrationSectionProps {
  mailchimpUrl?: string;
  placeholder?: string;
  buttonText?: string;
}

// Custom content with explicit componentType field
export interface CustomSectionContent {
  title: string;
  body?: string;
  componentType?: string;
  props?: IntegrationComponentProps;
}

// Union of all integration prop types
export type IntegrationComponentProps = 
  | Omit<CheckoutProps, 'section' | 'theme'>
  | Omit<BookingEmbedProps, 'section' | 'theme'>
  | Omit<OrderLinksProps, 'section' | 'theme'>
  | Omit<ReservationEmbedProps, 'section' | 'theme'>
  | Omit<MapEmbedProps, 'section' | 'theme'>
  | Omit<NewsletterFormProps, 'section' | 'theme'>
  | Record<string, unknown>;
