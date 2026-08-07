import { useEffect, useState } from 'react';
import { subscribeAboutHiddenSections, subscribeHelpHiddenSections } from '../services/siteContentService';
import { subscribeApplicantNavHidden } from '../services/navOrderService';

export function useAboutHiddenSections(): string[] {
  const [keys, setKeys] = useState<string[]>([]);
  useEffect(() => subscribeAboutHiddenSections(setKeys), []);
  return keys;
}

export function useHelpHiddenSections(): string[] {
  const [keys, setKeys] = useState<string[]>([]);
  useEffect(() => subscribeHelpHiddenSections(setKeys), []);
  return keys;
}

export function useApplicantNavHidden(): string[] {
  const [keys, setKeys] = useState<string[]>([]);
  useEffect(() => subscribeApplicantNavHidden(setKeys), []);
  return keys;
}
