import { useEffect, useState } from 'react';
import { subscribeAboutSectionOrder } from '../services/siteContentService';

export function useAboutSectionOrder(): string[] | null {
  const [order, setOrder] = useState<string[] | null>(null);
  useEffect(() => subscribeAboutSectionOrder(setOrder), []);
  return order;
}
