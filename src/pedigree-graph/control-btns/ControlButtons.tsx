import { FC, useState } from 'react';
import { Button, Checkbox, Popover } from 'antd';
import { cn } from '@bem-react/classname';
import {
  cameraGreenSmall, showAllGreen, eye, pencilWhite, cross,
} from '@rootCommon/images';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

import { PedigreeViewFilters } from '../PedigreeGraph';

import LockedCaption from './LockedCaption/LockedCaption';
import './ControlButtons.css';

interface Props {
  filters: PedigreeViewFilters;
  onFilterChange: (filters: PedigreeViewFilters) => void;
  onFitPress: () => void;
  onEditChange: () => void;
  onMakeSnapshot: () => void;
}

const block = cn('ControlButtons');

const ControlButtons: FC<Props> = ({
  filters,
  onFilterChange,
  onFitPress,
  onEditChange,
  onMakeSnapshot,
}: Props): JSX.Element => {
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [isPedigreeLocked, changePedigreeLockedState] = useState<boolean>(true);

  const getFilterMenu = (filters: PedigreeViewFilters) => {
    const options = Object.keys(filters);
    const defaultValues = Object.entries(filters)
      .filter(([key, value]) => value && key)
      .map(([key]) => key);

    const handler = () => (val: CheckboxValueType[]) => {
      const newFilters: PedigreeViewFilters = {};

      options.forEach((item) => {
        newFilters[item] = !!val.includes(item);
      });

      onFilterChange(newFilters);
    };

    return (
      <Checkbox.Group
        className={block('Menu')}
        options={options}
        defaultValue={defaultValues}
        onChange={handler()}
      />
    );
  };

  const handleMenuVisibility = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleEditBtn = () => {
    changePedigreeLockedState(!isPedigreeLocked);
  };

  return (
    <div className={block()}>
      {/* Snapshot */}
      <Button className={block('Btn', null, ['btn-round'])} shape="circle" onClick={onMakeSnapshot}>
        <img src={cameraGreenSmall} alt="snapshot" />
      </Button>
      {/* ShowAll */}
      <Button className={block('Btn', undefined, ['btn-round'])} shape="circle" onClick={onFitPress}>
        <img src={showAllGreen} alt="fit" />
      </Button>
      {/* Filter */}
      <Popover
        onVisibleChange={handleMenuVisibility}
        content={getFilterMenu(filters)}
        trigger="click"
        placement="topRight"
        overlayClassName={block('Popover')}
      >
        <Button className={block('Btn', undefined, ['btn-round'])} shape="circle">
          <img src={showFilterMenu ? cross : eye} alt="menu" />
        </Button>
      </Popover>
      {/* Edit */}
      {isPedigreeLocked ? (
        <Button className={block('Btn', { locked: true })} onClick={handleEditBtn}>
          <LockedCaption description="Dr. John Johnson is Editing..." />
        </Button>
      ) : (
        <Button
          className={block('Btn', undefined, ['btn', 'btn-fill', 'btn-fill-green', 'btn-round'])}
        //   shape="circle"
          onClick={onEditChange}
        >
          <img src={pencilWhite} alt="edit" />
        </Button>
      )}
    </div>
  );
};

export default ControlButtons;
