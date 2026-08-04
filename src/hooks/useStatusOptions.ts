import { useEffect, useState } from 'react';
import { STATUS_OPTIONS } from '../constants/status';
import { subscribeCustomStatuses, addCustomStatus } from '../services/statusOptionsService';

// Merges the base statuses with any custom ones an admin has added, live.
export function useStatusOptions() {
  const [custom, setCustom] = useState<string[]>([]);

  useEffect(() => subscribeCustomStatuses(setCustom), []);

  const statusOptions = [...STATUS_OPTIONS, ...custom.filter(s => !STATUS_OPTIONS.includes(s))];

  return { statusOptions, addStatus: addCustomStatus };
}
