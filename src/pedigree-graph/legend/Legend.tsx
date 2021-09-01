import {
  FC, useCallback, useMemo,
} from 'react';
import { nanoid } from 'nanoid';
import { useAppSelector } from '@common/hooks';
import { getCancersData } from '@selectors';
import { Cancer } from '@rootTypes/glossary';
import { cn } from '@bem-react/classname';

import './Legend.css';

const block = cn('Legend');

type ItemProps = {
  cancerType: string;
  color: string;
};

const LegendItem: FC<ItemProps> = ({ cancerType, color }: ItemProps): JSX.Element => (
  <div className={block('Item')}>
    <span className={block('Color')} style={{ backgroundColor: color }} />
    <span className={block('Type')}>{cancerType}</span>
  </div>
);

type Props = {
  cancerIds: number[];
};

const Legend: FC<Props> = ({ cancerIds }: Props): JSX.Element | null => {
  const cancerGlossary: Cancer[] | null = useAppSelector(getCancersData);

  const getCancerList = useCallback(
    (cancerIds?: number[] | null) => (cancerGlossary && cancerIds
      ? cancerGlossary.filter((item) => cancerIds.includes(item.id))
      : null),
    [cancerGlossary],
  );

  const cancerList = useMemo(() => getCancerList(cancerIds), [cancerIds, getCancerList]);

  if (!cancerList?.length) return null;

  return (
    <div className={block()}>
      {cancerList.map((item) => item && <LegendItem key={nanoid()} cancerType={item?.name} color={item?.color} />)}
    </div>
  );
};

export default Legend;
