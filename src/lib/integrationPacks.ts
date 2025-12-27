// Integration Packs - Functional sections based on integrationsNeeded
import type { IntegrationType } from './nicheRouter';
import type { SitePage, SiteSection } from '@/types/site-spec';

export type IntegrationPack = {
  id: IntegrationType;
  pages?: Partial<SitePage>[];
  sections: Partial<SiteSection>[];
  settingsFields?: string[];
};

export const INTEGRATION_PACKS: IntegrationPack[] = [
  {
    id: 'stripe',
    pages: [
      {
        path: '/checkout',
        title: 'Checkout',
        sections: [
          {
            id: 'checkout-section',
            type: 'custom',
            label: 'Checkout',
            content: {
              title: 'Complete Your Purchase',
              componentType: 'checkout',
              props: { plans: [] },
            } as any,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'checkout-cta',
        type: 'custom',
        label: 'Checkout',
        content: {
          title: 'Ready to Purchase?',
          componentType: 'checkout',
          props: {},
        } as any,
      },
    ],
    settingsFields: ['stripePublicKey'],
  },
  {
    id: 'calendly',
    pages: [
      {
        path: '/booking',
        title: 'Book Now',
        sections: [
          {
            id: 'booking-section',
            type: 'custom',
            label: 'Book Appointment',
            content: {
              title: 'Schedule Your Appointment',
              componentType: 'booking_embed',
              props: { calendlyUrl: '' },
            } as any,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'booking-embed',
        type: 'custom',
        label: 'Booking',
        content: {
          title: 'Book Your Session',
          componentType: 'booking_embed',
          props: {},
        } as any,
      },
    ],
    settingsFields: ['calendlyUrl'],
  },
  {
    id: 'ordering',
    pages: [
      {
        path: '/order',
        title: 'Order Online',
        sections: [
          {
            id: 'order-section',
            type: 'custom',
            label: 'Order Links',
            content: {
              title: 'Order Your Favorites',
              componentType: 'order_links',
              props: { 
                links: [
                  { name: 'DoorDash', url: '' },
                  { name: 'UberEats', url: '' },
                  { name: 'Direct Order', url: '' },
                ] 
              },
            } as any,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'order-links',
        type: 'custom',
        label: 'Order Online',
        content: {
          title: 'Order Now',
          componentType: 'order_links',
          props: {},
        } as any,
      },
    ],
    settingsFields: ['doorDashUrl', 'uberEatsUrl', 'directOrderUrl'],
  },
  {
    id: 'reservations',
    pages: [
      {
        path: '/reservations',
        title: 'Reservations',
        sections: [
          {
            id: 'reservation-section',
            type: 'custom',
            label: 'Reservations',
            content: {
              title: 'Reserve Your Table',
              componentType: 'reservation_embed',
              props: { embedUrl: '' },
            } as any,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'reservation-embed',
        type: 'custom',
        label: 'Reservations',
        content: {
          title: 'Book a Table',
          componentType: 'reservation_embed',
          props: {},
        } as any,
      },
    ],
    settingsFields: ['openTableUrl', 'resyUrl'],
  },
  {
    id: 'email_capture',
    sections: [
      {
        id: 'newsletter-section',
        type: 'custom',
        label: 'Newsletter',
        content: {
          title: 'Stay Updated',
          body: 'Subscribe to our newsletter for the latest updates.',
          componentType: 'newsletter_form',
          props: {},
        } as any,
      },
    ],
    settingsFields: ['mailchimpListId', 'klaviyoListId'],
  },
  {
    id: 'maps',
    sections: [
      {
        id: 'map-section',
        type: 'custom',
        label: 'Location',
        content: {
          title: 'Find Us',
          componentType: 'map_embed',
          props: { address: '' },
        } as any,
      },
    ],
    settingsFields: ['businessAddress'],
  },
  {
    id: 'analytics',
    sections: [],
    settingsFields: ['gaTrackingId'],
  },
];

export function getIntegrationPack(integration: IntegrationType): IntegrationPack | undefined {
  return INTEGRATION_PACKS.find(p => p.id === integration);
}

export function getPacksForIntegrations(integrations: IntegrationType[]): IntegrationPack[] {
  return integrations
    .map(i => getIntegrationPack(i))
    .filter((p): p is IntegrationPack => p !== undefined);
}

export function mergeIntegrationPages(
  existingPages: SitePage[], 
  integrations: IntegrationType[]
): SitePage[] {
  const packs = getPacksForIntegrations(integrations);
  const existingPaths = new Set(existingPages.map(p => p.path));
  const newPages: SitePage[] = [];
  
  for (const pack of packs) {
    if (pack.pages) {
      for (const page of pack.pages) {
        if (page.path && !existingPaths.has(page.path)) {
          newPages.push({
            path: page.path,
            title: page.title || 'Page',
            sections: (page.sections || []) as SiteSection[],
          });
          existingPaths.add(page.path);
        }
      }
    }
  }
  
  return [...existingPages, ...newPages];
}
