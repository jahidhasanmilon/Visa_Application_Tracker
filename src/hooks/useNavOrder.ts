import { useEffect, useState } from 'react';
import { subscribeApplicantNavOrder, subscribeApplicantNavLabels } from '../services/navOrderService';

export function useApplicantNavOrder(): string[] | null {
  const [order, setOrder] = useState<string[] | null>(null);
  useEffect(() => subscribeApplicantNavOrder(setOrder), []);
  return order;
}

export function useApplicantNavLabels(): Record<string, string> {
  const [labels, setLabels] = useState<Record<string, string>>({});
  useEffect(() => subscribeApplicantNavLabels(setLabels), []);
  return labels;
}
