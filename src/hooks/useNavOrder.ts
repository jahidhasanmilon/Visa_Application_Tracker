import { useEffect, useState } from 'react';
import { subscribeApplicantNavOrder } from '../services/navOrderService';

export function useApplicantNavOrder(): string[] | null {
  const [order, setOrder] = useState<string[] | null>(null);
  useEffect(() => subscribeApplicantNavOrder(setOrder), []);
  return order;
}
