import { Moment } from 'moment';
import { GlossaryType } from '@rootCommon/types/common';

export interface Event {
  dateFrom: Moment;
  dateTo: Moment;
  patientName: string;
  description: string | number | null;
  percent: number;
}

export type Resource = GlossaryType;

export interface Scheduler {
  [date: string]: {
    events: Event[];
    resources?: Resource[];
  };
}
