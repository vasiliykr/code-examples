import { FC } from 'react';
import { cn } from '@bem-react/classname';
import { warningYellow } from '@rootCommon/images';

import './LockedCaption.css';

interface Props {
  description?: string;
}

const block = cn('LockedCaption');

const LockedCaption: FC<Props> = ({ description }): JSX.Element => (
  <div className={block()}>
    <div>
      <img src={warningYellow} />
      <span className={block('Header')}>Locked</span>
    </div>
    {description && <div className={block('Description')}>{description}</div>}
  </div>
);

export default LockedCaption;
