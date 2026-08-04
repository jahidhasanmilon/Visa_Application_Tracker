import type { ApplicantFormData } from '../types';
import { todayStr } from '../utils/dateHelpers';

export const EMPTY_FORM: ApplicantFormData = {
  serialNo: '', name: '', email: '', status: 'Applied', created: '', submitted: '', notes: '',
  lastUpdated: todayStr(), reminderMailSent: 'Not yet',
};
