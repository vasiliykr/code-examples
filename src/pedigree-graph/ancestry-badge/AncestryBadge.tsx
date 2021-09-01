import {
  FC, useCallback, useEffect, useMemo,
} from 'react';
import { useAppSelector, useAppDispatch } from '@common/hooks';
import { getPedigreeAncestryBadge } from '@actions';
import { getAncestriesData, getProbandAncestries } from '@selectors';
import PedigreeAncestryBadgeDto from 'types/pedigreeAncestryBadge';
import { Individual } from '@rootTypes/individual';
import { IdType } from '@rootTypes/common';
import { Ancestry } from '@rootTypes/glossary';
import { getGlossaryItemName } from '@rootCommon/utilities';
import { cn } from '@bem-react/classname';

import './AncestryBadge.css';

const block = cn('AncestryBadge');

enum AncestryBadgeType {
  Paternal = 'Paternal',
  Maternal = 'Maternal',
}

type Props = {
  patient: Individual;
};

type PanelProps = {
  type: AncestryBadgeType;
  value?: string;
};

const AncestryBadgePanel: FC<PanelProps> = ({ type, value }:PanelProps):JSX.Element => (
  <div className={block('Panel')}>
    <span className={block('Caption')}>
      {type}
      {' '}
      Ancestry
    </span>
    <span className={block('Value', { type: value ? false : 'undefined' })}>{value || 'Undefined'}</span>
  </div>
);

const AncestryBadge: FC<Props> = ({ patient }:Props): JSX.Element => {
  const ancentryData: PedigreeAncestryBadgeDto | null = useAppSelector(getProbandAncestries);
  const ancentriesGlossary: Ancestry[] | null = useAppSelector(getAncestriesData);
  const dispatch = useAppDispatch();

  const getStringNames = useCallback(
    (ids?: IdType[] | null): string => (ancentriesGlossary && ids
      ? ids.map((id) => getGlossaryItemName(ancentriesGlossary, id) || '')?.join(',')
      : ''),
    [ancentriesGlossary],
  );

  const paternalValues = useMemo(() => getStringNames(ancentryData?.paternalAncestry), [
    getStringNames,
    ancentryData?.paternalAncestry,
  ]);
  const maternalValues = useMemo(() => getStringNames(ancentryData?.maternalAncestry), [
    getStringNames,
    ancentryData?.maternalAncestry,
  ]);

  useEffect(() => {
    if (patient?.id) dispatch(getPedigreeAncestryBadge.request(patient.id));
  }, [dispatch, patient?.id]);

  return (
    <div className={block()}>
      <AncestryBadgePanel type={AncestryBadgeType.Paternal} value={paternalValues} />
      <AncestryBadgePanel type={AncestryBadgeType.Maternal} value={maternalValues} />
    </div>
  );
};

export default AncestryBadge;
