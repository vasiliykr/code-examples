import { ForwardedRef, forwardRef } from 'react';
import { Progress } from 'antd';
import moment from 'moment';
import { cn } from '@rootCommon/lib/classname';
import { AppointmentConflict, AppointmentListItem, AppointmentStatus } from '@rootCommon/types/appointment';
import { PROGRESS_COLOR, TIME_FORMAT } from '@rootCommon/constants/common';

import { Event } from './schema';
import './SchedulerEvent.scss';

const eventCn = cn('SchedulerEvent');

type Props = {
  appointment: AppointmentListItem;
  onEventClick?: (event: AppointmentListItem) => void;
};

const CELL_HEIGHT = 84;
const MINIMUM_EVENT_HEIGHT = CELL_HEIGHT / 2;

const getHeight = ({ startTime, endTime }: AppointmentConflict) => {
  const minutesOffset = startTime ? (moment(startTime).minutes() * CELL_HEIGHT) / 60 : 0;
  const hoursOffset = startTime ? moment(startTime).hours() * CELL_HEIGHT : 0;
  const topOffset = hoursOffset + minutesOffset;
  let height = startTime && endTime ? (moment(endTime).diff(startTime, 'minutes') * CELL_HEIGHT) / 60 - 3 : 0;

  height = height < MINIMUM_EVENT_HEIGHT ? MINIMUM_EVENT_HEIGHT : height || MINIMUM_EVENT_HEIGHT;

  return { height, top: topOffset };
};

const SchedulerEvent = ({ appointment, onEventClick }: Props, ref: ForwardedRef<HTMLDivElement>) => {
  const event: Event = {
    dateFrom: moment(appointment.appointmentDateStartTime),
    dateTo: moment(appointment.appointmentDateEndTime),
    patientName: appointment.individual.patientName || 'G',
    description: appointment.individual.patientId,
    percent: appointment.fhq.progress || 0,
  };

  const position = getHeight({
    startTime: appointment.appointmentDateStartTime,
    endTime: appointment.appointmentDateEndTime,
  });

  return (
    <>
      <div
        onClick={() => onEventClick && onEventClick(appointment)}
        className={eventCn({
          selected: appointment.isSelected || undefined,
          state: appointment.status,
        })}
        style={{ ...position }}
        ref={ref}
      >
        <div className={eventCn('card')}>
          <div className={eventCn('info')}>
            <div className={eventCn('period')}>
              {`${event.dateFrom.format(TIME_FORMAT)} - ${event.dateTo.format(TIME_FORMAT)}`}
            </div>
            <div>{event.patientName}</div>
            <div className={eventCn('description')}>{event.description}</div>
          </div>
          <div className={eventCn('progress')}>
            <span className={eventCn('percent')}>
              {event.percent}
              %
            </span>
            <Progress
              type="circle"
              width={18}
              percent={event.percent}
              strokeColor={PROGRESS_COLOR}
              strokeWidth={12}
              showInfo={false}
              trailColor="#E8B5E6"
            />
          </div>
        </div>
      </div>
      {appointment.conflicts?.map((conflict, index) => {
        const positionError = getHeight(conflict);

        return (
          <div
            key={`${index}-${conflict.startTime}-${conflict.endTime}`}
            onClick={() => onEventClick && onEventClick(appointment)}
            className={eventCn({ state: AppointmentStatus.ERROR })}
            style={{ ...positionError }}
          />
        );
      })}
    </>
  );
};

export default forwardRef(SchedulerEvent);
