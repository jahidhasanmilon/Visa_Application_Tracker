import { useEffect, useState } from 'react';
import { subscribeVivaSectionOrder } from '../services/vivaQuestionsService';

export function useVivaSectionOrder(): string[] | null {
  const [order, setOrder] = useState<string[] | null>(null);
  useEffect(() => subscribeVivaSectionOrder(setOrder), []);
  return order;
}
