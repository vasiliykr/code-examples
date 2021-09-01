/* eslint-disable jsx-a11y/control-has-associated-label */
import {
  FC, ReactElement, useEffect, useRef,
} from 'react';
import moment from 'moment';
import { AppointmentListItem, CalendarViewMode } from '@rootCommon/types/appointment';
import { CALENDAR_HEADER_DATE_FORMAT, CALENDAR_HOURS_FORMAT, DAY_HOURS } from '@rootCommon/constants/common';
import { UserListResponse } from '@rootCommon/types/user';
import { isToday } from '@rootCommon/utilities';
import { calendarToday } from '@rootCommon/images';
import { cn } from '@rootCommon/lib/classname';

import SchedulerEvent from './SchedulerEvent';
import './Scheduler.css';

const UNASSIGNED_USER_ID = -1;

const NO_ASSIGNED_PROVIDER: UserListResponse = { id: UNASSIGNED_USER_ID, userName: 'Unassigned' };
const NO_PROVIDER: UserListResponse = { id: 0, userName: '' };

const schedulerCn = cn('Scheduler');

type Props = {
  appointments?: AppointmentListItem[];
  resources?: UserListResponse[] | null;
  date?: string | undefined;
  dateStartTime?: string;
  dateEndTime?: string;
  eventClickHandler?: (event: AppointmentListItem) => void;
  viewMode?: CalendarViewMode;
  noAssignedProvider?: boolean;
};

const makeRange = (startDate: string | undefined, endDate: string | undefined) => {
  const date = [];

  while (moment(startDate) <= moment(endDate)) {
    date.push(startDate);
    // eslint-disable-next-line no-param-reassign
    startDate = moment(startDate)
      .add(1, 'days')
      .toISOString();
  }
  return date;
};

const getStartOfDay = (appointmentDate: string | null) => moment(appointmentDate)
  .startOf('day')
  .toISOString();

const isSameTime = (startDate: string | null, endDate: string | null) => moment(startDate).isSame(endDate, 'minutes');

const Scheduler: FC<Props> = ({
  appointments,
  resources,
  date,
  dateStartTime,
  dateEndTime,
  eventClickHandler,
  viewMode = CalendarViewMode.WEEK,
  noAssignedProvider,
}:Props) => {
  const calendarRange = makeRange(dateStartTime, dateEndTime);

  // eslint-disable-next-line no-nested-ternary
  const resourceMap: UserListResponse[] | null = resources?.length
    ? noAssignedProvider
      ? [NO_ASSIGNED_PROVIDER, ...resources]
      : resources
    : noAssignedProvider
      ? [NO_ASSIGNED_PROVIDER]
      : [NO_PROVIDER];

  const userIds = resourceMap?.map((user) => user.id);
  const userEvents = appointments?.filter(
    (appointment) => userIds?.find((id) => appointment.user.id === (id === UNASSIGNED_USER_ID ? null : id)),
  );

  const activeEvent = userEvents?.find((event) => event.isSelected);

  const todayRef = useRef<HTMLTableHeaderCellElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);

  const scrollToToday = (behavior: ScrollBehavior) => {
    todayRef.current?.scrollIntoView({ block: 'start', inline: 'start', behavior });
  };

  const scrollToActive = (behavior: ScrollBehavior) => {
    activeRef.current?.scrollIntoView({ block: 'center', inline: 'center', behavior });
  };

  useEffect(() => {
    scrollToToday('smooth');
  }, []);

  useEffect(() => {
    scrollToToday('auto');
  }, [resources]);

  useEffect(() => {
    scrollToActive('auto');
  }, [activeEvent?.appointmentDateStartTime, activeEvent?.appointmentDateEndTime]);

  const getRows = () => {
    const rows: ReactElement[] = [];

    for (let i = 0; i < DAY_HOURS; i += 1) {
      rows.push(
        <tr key={`row${i}`} className={schedulerCn('row')}>
          <td className={schedulerCn('time-cell')}>
            <div className="inner">
              {moment()
                .hour(i)
                .format(CALENDAR_HOURS_FORMAT)}
            </div>
          </td>
          {calendarRange.map((date) => resourceMap?.map((user) => {
            const isSameDay = (appointmentDate: string | null) => moment(appointmentDate).isSame(date, 'day');

            let events: AppointmentListItem[] | undefined = [];

            if (i === 0) {
              events = userEvents?.filter((event) => {
                if (event.user.id === (user.id === UNASSIGNED_USER_ID ? null : user.id)) {
                  const sameDate = isSameDay(event.appointmentDateStartTime) || isSameDay(event.appointmentDateEndTime);

                  return sameDate;
                }

                return false;
              });
            }

            return (
              <td className={schedulerCn('cell', { today: isToday(moment(date)) })} key={`${date || ''}${user.id}`}>
                {i === 0
                    && events?.map((event, index) => {
                      const startOfDay = getStartOfDay(event.appointmentDateEndTime);

                      const mappedEvent: AppointmentListItem = {
                        ...event,

                        appointmentDateStartTime: isSameDay(event.appointmentDateStartTime)
                          ? event.appointmentDateStartTime
                          : startOfDay,

                        appointmentDateEndTime: isSameDay(event.appointmentDateEndTime)
                          ? event.appointmentDateEndTime
                          : startOfDay,
                      };

                      const isZeroDuration = isSameTime(
                        mappedEvent.appointmentDateStartTime,
                        mappedEvent.appointmentDateEndTime,
                      );

                      return isZeroDuration ? null : (
                        // eslint-disable-next-line react/no-array-index-key
                        <div className={schedulerCn('event-wrapper')} key={`${event.id}${index}`}>
                          <SchedulerEvent
                            appointment={mappedEvent}
                            onEventClick={eventClickHandler}
                            // eslint-disable-next-line no-return-assign
                            ref={(ref) => event.isSelected && (activeRef.current = ref)}
                          />
                        </div>
                      );
                    })}
              </td>
            );
          }))}
        </tr>,
      );
    }

    return rows;
  };

  return (
    <div className={schedulerCn({ 'view-mode': viewMode })}>
      <table className={schedulerCn('table')}>
        <thead>
          <tr>
            <th>
              <div className="inner" />
            </th>
            {calendarRange.map((item) => (
              <th
                colSpan={resourceMap?.length}
                key={moment(item).format('DDMMYYYY')}
                // eslint-disable-next-line no-return-assign
                ref={(ref) => moment(item).isSame(date, 'day') && (todayRef.current = ref)}
                className={schedulerCn('cell', { today: isToday(moment(item)) })}
              >
                <div className="inner">
                  {moment(item).format(CALENDAR_HEADER_DATE_FORMAT)}
                  {isToday(moment(item)) && <img src={calendarToday} alt="" />}
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <th>
              <div className="inner" />
            </th>
            {calendarRange.map((item) => resourceMap?.map((res) => (
              <th key={`${res.id}${item || ''}`} className={schedulerCn('cell', { today: isToday(moment(item)) })}>
                <div className="inner">{res.userName}</div>
              </th>
            )))}
          </tr>
          <tr>
            <th />
            {calendarRange.map((item) => resourceMap?.map((res) => (
              <th key={`${res.id}${item || ''}`} className={schedulerCn('cell', { today: isToday(moment(item)) })}>
                <div className="inner" />
              </th>
            )))}
          </tr>
        </thead>
        <tbody className={schedulerCn('table-body')}>{appointments && getRows()}</tbody>
      </table>
    </div>
  );
};

export default Scheduler;
