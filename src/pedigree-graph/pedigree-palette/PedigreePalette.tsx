import { cn } from '@bem-react/classname';
import { IndividualGender } from '@rootCommon/types/individual';

import './PedigreePalette.css';
import Node from './PaletteNode';

export const block = cn('PedigreePalette');

interface Props {
  nodeSex?: IndividualGender;
}

const PedigreePalette = ({ nodeSex }: Props): JSX.Element => (
  <div className={block()}>
    <div className={block('Row')}>
      <Node nodeName="father" badgeCount={2} className={block('Father')}>
        Father
      </Node>
      <Node nodeName="mother" type={IndividualGender.FEMALE} className={block('Mother')}>
        Mother
      </Node>
    </div>
    <div className={block('Row')}>
      <Node nodeName="maleSpouse" className={block('Spouse')}>
        Spouse
      </Node>
      <Node nodeName="femaleSpouse" type={IndividualGender.FEMALE} className={block('Spouse')}>
        Spouse
      </Node>
      <Node nodeName="proband" isProband type={nodeSex} className={block('Proband')}>
        Proband
      </Node>
      <Node nodeName="brother" className={block('Brother')}>
        Brother
      </Node>
      <Node nodeName="sister" type={IndividualGender.FEMALE} className={block('Sister')}>
        Sister
      </Node>
    </div>
    <div className={block('Row')}>
      <Node
        nodeName="unknownChild"
        type={IndividualGender.UNKNOWN}
        className={block('Child', { type: 'unknown' })}
      >
        Unknown Child
      </Node>
      <Node nodeName="son" className={block('Child', { type: 'son' })}>
        Son
      </Node>
      <Node nodeName="daughter" type={IndividualGender.FEMALE} className={block('Child', { type: 'daughter' })}>
        Daughter
      </Node>
    </div>
  </div>
);

export default PedigreePalette;
