import { useEffect, useState } from 'react';
import { subscribeAboutCustomSections, subscribeHelpCustomSections } from '../services/siteContentService';
import type { CustomSection } from '../types';

export function useAboutCustomSections(): CustomSection[] | null {
  const [items, setItems] = useState<CustomSection[] | null>(null);
  useEffect(() => subscribeAboutCustomSections(setItems), []);
  return items;
}

export function useHelpCustomSections(): CustomSection[] | null {
  const [items, setItems] = useState<CustomSection[] | null>(null);
  useEffect(() => subscribeHelpCustomSections(setItems), []);
  return items;
}
