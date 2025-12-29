import { useCallback } from 'react';
import { SiteSpec, SiteSection, SiteTheme, SitePage, HeroContent, FeaturesContent, FeatureItem, TestimonialsContent, TestimonialItem, PricingContent, PricingTier, FAQContent, FAQItem, ContactContent, CTAContent, StatsContent, StatsItem, ServicesContent, ServiceItem, TeamContent, TeamMember, GalleryContent, GalleryItem, PortfolioContent, PortfolioItem, AnimationConfig } from '@/types/site-spec';
import { arrayMove } from '@dnd-kit/sortable';

type UpdateSiteSpec = React.Dispatch<React.SetStateAction<SiteSpec | null>>;

export function useSiteEditor(siteSpec: SiteSpec | null, setSiteSpec: UpdateSiteSpec, currentPageIndex: number = 0) {
  
  const updateTheme = useCallback((updates: Partial<SiteTheme>) => {
    setSiteSpec((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        theme: { ...prev.theme, ...updates },
      };
    });
  }, [setSiteSpec]);
  
  const reorderSections = useCallback((oldIndex: number, newIndex: number) => {
    setSiteSpec((prev) => {
      if (!prev || !prev.pages[currentPageIndex]) return prev;
      const newSections = arrayMove(prev.pages[currentPageIndex].sections, oldIndex, newIndex);
      const newPages = [...prev.pages];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], sections: newSections };
      return {
        ...prev,
        pages: newPages,
      };
    });
  }, [setSiteSpec, currentPageIndex]);

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

  const updateStatsContent = useCallback((sectionId: string, field: string, value: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      content: {
        ...(section.content as StatsContent),
        [field]: value,
      },
    }));
  }, [updateSection]);

  const updateStatsItem = useCallback((sectionId: string, itemIndex: number, field: keyof StatsItem, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as StatsContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updateTestimonialItem = useCallback((sectionId: string, itemIndex: number, field: keyof TestimonialItem, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as TestimonialsContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updatePricingItem = useCallback((sectionId: string, itemIndex: number, field: keyof PricingTier, value: string | string[]) => {
    updateSection(sectionId, (section) => {
      const content = section.content as PricingContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updateFAQItem = useCallback((sectionId: string, itemIndex: number, field: keyof FAQItem, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as FAQContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updateServiceItem = useCallback((sectionId: string, itemIndex: number, field: keyof ServiceItem, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as ServicesContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updateTeamMember = useCallback((sectionId: string, itemIndex: number, field: keyof TeamMember, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as TeamContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updateGalleryItem = useCallback((sectionId: string, itemIndex: number, field: keyof GalleryItem, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as GalleryContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updatePortfolioItem = useCallback((sectionId: string, itemIndex: number, field: keyof PortfolioItem, value: string) => {
    updateSection(sectionId, (section) => {
      const content = section.content as PortfolioContent;
      const newItems = [...content.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return {
        ...section,
        content: { ...content, items: newItems },
      };
    });
  }, [updateSection]);

  const updateSectionAnimation = useCallback((sectionId: string, animation: AnimationConfig) => {
    updateSection(sectionId, (section) => ({
      ...section,
      animation,
    }));
  }, [updateSection]);

  const updateSiteName = useCallback((name: string) => {
    setSiteSpec((prev) => prev ? { ...prev, name } : prev);
  }, [setSiteSpec]);

  const updateLogo = useCallback((logo: string | undefined) => {
    setSiteSpec((prev) => prev ? { ...prev, logo } : prev);
  }, [setSiteSpec]);

  const updateNavItem = useCallback((index: number, label: string) => {
    setSiteSpec((prev) => {
      if (!prev) return prev;
      const newNav = [...prev.navigation];
      newNav[index] = { ...newNav[index], label };
      return { ...prev, navigation: newNav };
    });
  }, [setSiteSpec]);

  const addSection = useCallback((section: SiteSection, position?: number) => {
    setSiteSpec((prev) => {
      if (!prev || !prev.pages[currentPageIndex]) return prev;
      const newSections = [...prev.pages[currentPageIndex].sections];
      if (position !== undefined) {
        newSections.splice(position, 0, section);
      } else {
        newSections.push(section);
      }
      const newPages = [...prev.pages];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], sections: newSections };
      return {
        ...prev,
        pages: newPages,
      };
    });
  }, [setSiteSpec, currentPageIndex]);

  const removeSection = useCallback((sectionId: string) => {
    setSiteSpec((prev) => {
      if (!prev || !prev.pages[currentPageIndex]) return prev;
      const newPages = [...prev.pages];
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        sections: newPages[currentPageIndex].sections.filter((s) => s.id !== sectionId),
      };
      return {
        ...prev,
        pages: newPages,
      };
    });
  }, [setSiteSpec, currentPageIndex]);

  const addPage = useCallback((page: SitePage) => {
    setSiteSpec((prev) => {
      if (!prev) return prev;
      // Also add nav item for the new page
      const newNav = [...prev.navigation, { label: page.title, href: page.path }];
      return {
        ...prev,
        pages: [...prev.pages, page],
        navigation: newNav,
      };
    });
  }, [setSiteSpec]);

  const removePage = useCallback((pageIndex: number) => {
    setSiteSpec((prev) => {
      if (!prev || pageIndex === 0 || pageIndex >= prev.pages.length) return prev;
      const removedPage = prev.pages[pageIndex];
      const newPages = prev.pages.filter((_, i) => i !== pageIndex);
      // Also remove nav item for the removed page
      const newNav = prev.navigation.filter((n) => n.href !== removedPage.path);
      return {
        ...prev,
        pages: newPages,
        navigation: newNav,
      };
    });
  }, [setSiteSpec]);

  const renamePage = useCallback((pageIndex: number, title: string) => {
    setSiteSpec((prev) => {
      if (!prev || pageIndex >= prev.pages.length) return prev;
      const oldPath = prev.pages[pageIndex].path;
      const newPages = [...prev.pages];
      newPages[pageIndex] = { ...newPages[pageIndex], title };
      // Also update nav item label
      const newNav = prev.navigation.map((n) => 
        n.href === oldPath ? { ...n, label: title } : n
      );
      return {
        ...prev,
        pages: newPages,
        navigation: newNav,
      };
    });
  }, [setSiteSpec]);

  return {
    reorderSections,
    updateSection,
    updateTheme,
    updateHeroContent,
    updateFeaturesContent,
    updateFeatureItem,
    updateTestimonialsContent,
    updateTestimonialItem,
    updatePricingContent,
    updatePricingItem,
    updateFAQContent,
    updateFAQItem,
    updateContactContent,
    updateCTAContent,
    updateStatsContent,
    updateStatsItem,
    updateServiceItem,
    updateTeamMember,
    updateGalleryItem,
    updatePortfolioItem,
    updateSectionAnimation,
    updateSiteName,
    updateLogo,
    updateNavItem,
    addSection,
    removeSection,
    addPage,
    removePage,
    renamePage,
  };
}
