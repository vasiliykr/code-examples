import { useCallback, useEffect, useState } from 'react';
import { cn } from '@bem-react/classname';
import { Button, Checkbox, Radio } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { RelativeEdge } from '@src/types/pedigree';
import { cross } from '@rootCommon/images';

import './SettingsPopup.css';

const block = cn('SettingsPopup');

const RELATIVES = [RelativeEdge.NORMAL, RelativeEdge.SEPARATED, RelativeEdge.DIVORCED, RelativeEdge.CASUAL];
const STATES = [RelativeEdge.CONSANGUINEOUS, RelativeEdge.INFERTILE_BY_CHOICE, RelativeEdge.INFERTILE];

type Props = {
  position?: { x: number; y: number };
  innerRef?: React.MutableRefObject<HTMLDivElement | null>;
  valueRelative?: RelativeEdge;
  stateRelative?: RelativeEdge[];
  handleClose?: () => void;
  onChangeRelative?: (value: RelativeEdge) => void;
  onChangeState?: (values: { name: RelativeEdge; value: boolean }[]) => void;
};

const SettingsPopup = ({
  handleClose, valueRelative, stateRelative, position, innerRef, onChangeRelative, onChangeState,
}: Props): JSX.Element => {
  const [relativeValue, setRelativeValue] = useState(valueRelative);
  const [relativeState, setRelativeState] = useState<CheckboxValueType[] | undefined>(stateRelative);

  const handleChangeRelative = useCallback((value: RelativeEdge) => {
    setRelativeValue(value);
    onChangeRelative && onChangeRelative(value);
  }, [onChangeRelative]);

  const handleChangeState = useCallback((values: CheckboxValueType[]) => {
    const nextValue: string[] = [];
    const valueHasConsanguineous = values?.includes(RelativeEdge.CONSANGUINEOUS);
    const valueHasInfertile = values?.includes(RelativeEdge.INFERTILE);
    const stateHasInfertile = relativeState?.includes(RelativeEdge.INFERTILE);
    const valueHasInfertileByChoice = values?.includes(RelativeEdge.INFERTILE_BY_CHOICE);
    const stateHasInfertileByChoice = relativeState?.includes(RelativeEdge.INFERTILE_BY_CHOICE);

    if (valueHasConsanguineous) {
      nextValue.push(RelativeEdge.CONSANGUINEOUS);
    }

    if (valueHasInfertile && !valueHasInfertileByChoice) {
      nextValue.push(RelativeEdge.INFERTILE);
    }

    if (valueHasInfertileByChoice && !valueHasInfertile) {
      nextValue.push(RelativeEdge.INFERTILE_BY_CHOICE);
    }

    if (valueHasInfertile && valueHasInfertileByChoice) {
      nextValue.push(
        stateHasInfertile && !stateHasInfertileByChoice
          ? RelativeEdge.INFERTILE_BY_CHOICE
          : RelativeEdge.INFERTILE,
      );
    }

    const mappedStates = STATES.map((state) => ({ name: state, value: nextValue.includes(state) }));

    onChangeState && onChangeState(mappedStates);
    setRelativeState(nextValue);
  }, [onChangeState, relativeState]);

  useEffect(() => {
    setRelativeValue(valueRelative);
  }, [valueRelative]);

  useEffect(() => {
    setRelativeState(stateRelative);
  }, [stateRelative]);

  return (
    <div className={block()} style={position && { left: `${position.x}px`, top: `${position.y}px` }} ref={innerRef}>
      <div className={block('Handlers')}>
        <Radio.Group className={block('Relatives')} value={relativeValue}>
          {RELATIVES.map((relative) => (
            <Radio
              className={block('Relative')}
              key={relative}
              value={relative}
              onChange={(e) => {
                const value = String(e.target.value) as RelativeEdge;
                handleChangeRelative(value);
              }}
            >
              {relative}
            </Radio>
          ))}
        </Radio.Group>
        <Checkbox.Group options={STATES} value={relativeState} onChange={handleChangeState} />
      </div>
      <Button className={block('Btn', ['btn-round'])} type="default" shape="circle" onClick={handleClose}>
        <img src={cross} alt="close" />
      </Button>
    </div>
  );
};

export default SettingsPopup;
