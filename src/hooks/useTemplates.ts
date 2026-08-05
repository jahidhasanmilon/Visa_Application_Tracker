import { useEffect, useState } from 'react';
import { subscribeChecklistTemplate, subscribeRoadmapTemplate } from '../services/templatesService';
import type { ChecklistItem } from '../types';

// null while the initial snapshot hasn't arrived yet.
export function useChecklistTemplate(): ChecklistItem[] | null {
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  useEffect(() => subscribeChecklistTemplate(setItems), []);
  return items;
}

export function useRoadmapTemplate(): ChecklistItem[] | null {
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  useEffect(() => subscribeRoadmapTemplate(setItems), []);
  return items;
}
