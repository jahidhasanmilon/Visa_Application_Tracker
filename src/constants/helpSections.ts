export type HelpSectionKey = 'email' | 'embassy' | 'removingEntry' | 'community';

export const HELP_SECTION_LABELS: Record<HelpSectionKey, string> = {
  email: 'Email',
  embassy: 'Germany Embassy',
  removingEntry: 'Removing an entry',
  community: 'Community',
};

export const DEFAULT_HELP_SECTION_ORDER: HelpSectionKey[] = ['email', 'embassy', 'removingEntry', 'community'];
