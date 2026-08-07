import { useEffect, useState } from 'react';
import { subscribeCustomPages } from '../services/customPagesService';
import type { CustomSection } from '../types';

export function useCustomPages(): CustomSection[] | null {
  const [pages, setPages] = useState<CustomSection[] | null>(null);
  useEffect(() => subscribeCustomPages(setPages), []);
  return pages;
}
