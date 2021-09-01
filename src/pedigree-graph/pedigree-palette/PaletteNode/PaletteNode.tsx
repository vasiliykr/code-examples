import { memo, useEffect, useState } from 'react';
import { Button } from 'antd';
import { useAppDispatch, useAppSelector } from '@common/hooks';
import { updatePalette } from '@actions';
import { NodeState } from '@reducers/pedigree';
import { getPalette, getSelectedNode } from '@selectors';
import { IndividualGender } from '@rootCommon/types/individual';
import { cross, minusGreen } from '@rootCommon/images';
import { cn } from '@bem-react/classname';

import './PaletteNode.css';

const block = cn('PaletteNode');

interface Props {
  nodeName: string;
  badgeCount?: number;
  children?: string;
  className?: string;
  type?: IndividualGender;
  isProband?: boolean;
}

const getPluralType = (type: string, children: string, count: number): string => {
  if (type === IndividualGender.UNKNOWN) {
    return count > 1 ? 'Children' : 'Child';
  }
  return count > 1 ? `${children}s` : children;
};

const PaletteNode = ({
  nodeName,
  badgeCount,
  children,
  className,
  type = IndividualGender.MALE,
  isProband,
  ...props
}: Props) => {
  const dispatch = useAppDispatch();
  const currentCount = useAppSelector(getPalette)[nodeName];
  const [count, setCount] = useState<number>(currentCount);
  const selectedNode = useAppSelector(getSelectedNode);
  const clickedNodeIsParent = ['mother', 'father'].includes(nodeName);
  const clickedNodeIsChild = ['son', 'daughter', 'unknownChild'].includes(nodeName);

  useEffect(() => {
    setCount(currentCount);
  }, [currentCount]);

  const checkPossibilityToAdd = (node: NodeState | null): boolean => {
    if (!node) return false;

    const nodeIsOnRightLevel = (node.level > 1 && node.level < 5)
            || (node.level === 1 && !clickedNodeIsParent)
            || (node.level === 5 && !clickedNodeIsChild);

    if (nodeIsOnRightLevel) {
      return true;
    }

    return false;
  };

  const increaseCount = () => {
    if (checkPossibilityToAdd(selectedNode)) {
      setCount(count + 1);
      dispatch(updatePalette({ nodeName, count: 1 }));
    }
  };

  const decreaseCount = () => {
    setCount(count - 1);
    dispatch(updatePalette({ nodeName, count: -1 }));
  };

  const deleteMyself = () => {
    console.log('delete');
  };

  return (
    <div className={block({ type: type?.toLowerCase() }, [className])} {...props}>
      {type === IndividualGender.UNKNOWN && <div className={block('Rhombus')} />}
      {badgeCount && <div className={block('Badge')}>{badgeCount}</div>}
      {isProband ? (
        <Button onClick={deleteMyself} className={block('Button')}>
          <img className={block('Icon', { cross: true })} src={cross} alt="" />
        </Button>
      ) : (
        count > 0 && (
          <Button onClick={decreaseCount} className={block('Button')}>
            <img className={block('Icon', { minus: true })} src={minusGreen} alt="" />
          </Button>
        )
      )}
      <div onClick={isProband ? undefined : increaseCount} className={block('Caption')}>
        {!isProband && (
          <>
            <span>Add</span>
            <span>{children}</span>
          </>
        )}
      </div>
      {count > 0 && (
        <div className={block('Counter')}>
          +
          {count}
          {' '}
          {getPluralType(type, children?.toString() || '', count)}
        </div>
      )}
    </div>
  );
};

export default memo(PaletteNode);
