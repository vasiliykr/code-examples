import {
  FC, useState, useEffect, useCallback, memo,
} from 'react';
import { Button, Popover } from 'antd';
import { Formik } from 'formik';
import { Form } from 'formik-antd';
import moment, { Moment } from 'moment';
import AssignBoard from '@common/assign-board';
import CalendarSmall from '@rootCommon/components/calendar-small';
import { useAppDispatch, useAppSelector } from '@common/hooks';
import { setAppointmentsFilter } from '@actions';
import { getAppointmentsFilter, getUsersData, getAppointmentsViewMode } from '@selectors';
import { AppointmentListItem, CalendarViewMode } from '@rootCommon/types/appointment';
import { UserListResponse } from '@rootCommon/types/user';
import { cn } from '@rootCommon/lib/classname';
import { filter, calendarGreen } from '@rootCommon/images';
import { getRange } from '@src/helpers/appointments';

import Scheduler from './Scheduler';
import './Calendar.scss';

const calendarCn = cn('calendar');

type Props = {
  appointments?: AppointmentListItem[];
  viewMode?: CalendarViewMode;
  eventClickHandler?: (event: AppointmentListItem) => void;
  doctorsPopover?: boolean;
  todayPopover?: boolean;
  rangePopover?: boolean;
};

const Calendar: FC<Props> = (props:Props): JSX.Element => {
  const {
    appointments, viewMode, eventClickHandler, doctorsPopover, todayPopover, rangePopover,
  } = props;
  const filters = useAppSelector(getAppointmentsFilter);
  const users = useAppSelector(getUsersData);
  const [doctorsList, setDoctorsList] = useState<UserListResponse[] | null>(null);

  const dispatch = useAppDispatch();

  const appointmentsViewMode: CalendarViewMode = useAppSelector(getAppointmentsViewMode);

  useEffect(() => {
    setDoctorsList(users?.filter((user) => filters.userIds?.includes(user.id)) || null);
  }, [users, filters]);

  const handleChange = useCallback(
    (date: Moment) => {
      const appointmentDate = date.format();
      const dateRange = getRange(appointmentDate, appointmentsViewMode);
      dispatch(setAppointmentsFilter({ ...filters, ...dateRange, appointmentDate }));
    },
    [appointmentsViewMode, dispatch, filters],
  );

  const handleToday = useCallback(
    () => {
      const appointmentDate = moment().format();

      dispatch(setAppointmentsFilter({ ...filters, appointmentDate }));
    },
    [dispatch, filters],
  );

  const handleChangeDoctors = useCallback(
    (userIds: number[] | null) => {
      const newDoctorsList: UserListResponse[] | null = userIds?.map((id) => {
        const user = users?.find((u) => u.id === id);
        const userName = user?.userName || '';

        return { id, userName };
      }) || null;

      setDoctorsList(newDoctorsList);
      dispatch(setAppointmentsFilter({ ...filters, userIds }));
    },
    [dispatch, filters, users],
  );

  return (
    <div className={calendarCn()}>
      {doctorsPopover && (
        <Popover
          placement="bottomRight"
          trigger="click"
          content={(
            <div className={calendarCn('assign-board')}>
              <Formik
                enableReinitialize
                initialValues={{ userIds: doctorsList?.map((item) => item.id) }}
                validate={(values) => handleChangeDoctors(values.userIds || null)}
                onSubmit={() => undefined}
              >
                <Form>
                  <AssignBoard
                    label="Assignee(s)"
                    providerName="userIds"
                    providerLabel="Provider Name"
                  />
                </Form>
              </Formik>
            </div>
          )}
        >
          <Button className="calendar__filter-scheduler-btn btn btn-round btn-outline btn-outline-green">
            <img src={filter} alt="" />
          </Button>
        </Popover>
      )}
      {todayPopover && (
        <Button shape="round" onClick={handleToday}>
          Today
        </Button>
      )}
      {rangePopover && (
        <Popover
          placement="bottomRight"
          trigger="click"
          content={(
            <div className={calendarCn('calendar-small', ['calendar-small'])}>
              <CalendarSmall onChange={handleChange} selected={filters.appointmentDate} />
            </div>
          )}
        >
          <Button className="calendar__range-scheduler-btn btn btn-round btn-outline btn-outline-green">
            <img src={calendarGreen} alt="" />
          </Button>
        </Popover>
      )}
      <Scheduler
        appointments={appointments}
        resources={doctorsList}
        date={filters.appointmentDate}
        dateStartTime={filters.dateStartTime}
        dateEndTime={filters.dateEndTime}
        eventClickHandler={eventClickHandler}
        viewMode={viewMode}
        noAssignedProvider={filters.noAssignedProvider}
      />
    </div>
  );
};

export default memo(Calendar);
