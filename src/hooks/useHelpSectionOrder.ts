import { useEffect, useState } from 'react';
import { subscribeHelpSectionOrder } from '../services/siteContentService';

export function useHelpSectionOrder(): string[] | null {
  const [order, setOrder] = useState<string[] | null>(null);
  useEffect(() => subscribeHelpSectionOrder(setOrder), []);
  return order;
}
