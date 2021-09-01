import { cn } from '@bem-react/classname';
import { Button } from 'antd';
import { trashRed, plusGreen, wysiwygIconLink } from '@rootCommon/images';

import './NodeActions.css';

const block = cn('NodeActions');

interface Props {
  handleDelete: (nodeId?: string) => void;
  handleAddRelative: () => void;
  handleClickRelationshipOverlay: () => void;
  position?: {
    x: number;
    y: number;
  };
  innerRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const NodeActions = ({
  handleDelete, handleAddRelative, handleClickRelationshipOverlay, position, innerRef,
}: Props): JSX.Element => {
  const deleteBtnHandler = () => {
    handleDelete();
  };

  return (
    <div className={block()} style={position && { left: `${position.x}px`, top: `${position.y}px` }} ref={innerRef}>
      <Button className={block('Button')} onClick={deleteBtnHandler}>
        <img className={block('Icon')} src={trashRed} alt="" />
      </Button>
      <Button className={block('Button')} onClick={handleClickRelationshipOverlay}>
        <img className={block('Icon')} src={wysiwygIconLink} alt="" />
      </Button>
      <Button className={block('Button')} onClick={handleAddRelative}>
        <img className={block('Icon')} src={plusGreen} alt="" />
      </Button>
    </div>
  );
};

export default NodeActions;
