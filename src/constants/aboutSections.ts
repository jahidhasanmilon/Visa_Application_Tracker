export type AboutSectionKey = 'story' | 'partner' | 'faq' | 'team';

export const ABOUT_SECTION_LABELS: Record<AboutSectionKey, string> = {
  story: 'Our story',
  partner: 'Official partner',
  faq: 'Frequently asked questions',
  team: 'The people behind the platform',
};

export const DEFAULT_ABOUT_SECTION_ORDER: AboutSectionKey[] = ['story', 'partner', 'faq', 'team'];
