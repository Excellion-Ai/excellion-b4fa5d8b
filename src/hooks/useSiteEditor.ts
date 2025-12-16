import { useCallback } from 'react';
import { SiteSpec, SiteSection, HeroContent, FeaturesContent, FeatureItem, TestimonialsContent, PricingContent, FAQContent, ContactContent, CTAContent } from '@/types/site-spec';
import { arrayMove } from '@dnd-kit/sortable';

type UpdateSiteSpec = React.Dispatch<React.SetStateAction<SiteSpec | null>>;

export function useSiteEditor(siteSpec: SiteSpec | null, setSiteSpec: UpdateSiteSpec) {
  
  const reorderSections = useCallback((oldIndex: number, newIndex: number) => {
    setSiteSpec((prev) => {
      if (!prev || !prev.pages[0]) return prev;
      const newSections = arrayMove(prev.pages[0].sections, oldIndex, newIndex);
      return {
        ...prev,
        pages: [{ ...prev.pages[0], sections: newSections }],
      };
    });
  }, [setSiteSpec]);

  const updateSection = useCallback((sectionId: string, updater: (section: SiteSection) => SiteSection) => {
    setSiteSpec((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((page) => ({
          ...page,
          sections: page.sections.map((section) =>
            section.id === sectionId ? updater(section) : section
          ),
        })),
      };
    });
  }, [setSiteSpec]);

  const updateHeroContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as HeroContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updateFeaturesContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as FeaturesContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updateFeatureItem = useCallback((sectionId: string, itemIndex: number, field: string, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as FeaturesContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updateTestimonialsContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as TestimonialsContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updatePricingContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as PricingContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updateFAQContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as FAQContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updateContactContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as ContactContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updateCTAContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as CTAContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updateSiteName = useCallback((name: string) => {
    setSiteSpec((prev) => prev ? { ...prev, name } : prev);
  }, [setSiteSpec]);

  const updateNavItem = useCallback((index: number, label: string) => {
    setSiteSpec((prev) => {
      if (!prev) return prev;
      const newNav = [...prev.navigation];
      newNav[index] = { ...newNav[index], label };
      return { ...prev, navigation: newNav };
    });
  }, [setSiteSpec]);

  return {
    reorderSections,
    updateSection,
    updateHeroContent,
    updateFeaturesContent,
    updateFeatureItem,
    updateTestimonialsContent,
    updatePricingContent,
    updateFAQContent,
    updateContactContent,
    updateCTAContent,
    updateSiteName,
    updateNavItem,
  };
}
