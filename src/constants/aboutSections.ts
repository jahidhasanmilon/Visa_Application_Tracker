export type AboutSectionKey = 'story' | 'partner' | 'team';

export const ABOUT_SECTION_LABELS: Record<AboutSectionKey, string> = {
  story: 'Our story',
  partner: 'Official partner',
  team: 'The people behind the platform',
};

export const DEFAULT_ABOUT_SECTION_ORDER: AboutSectionKey[] = ['story', 'partner', 'team'];
