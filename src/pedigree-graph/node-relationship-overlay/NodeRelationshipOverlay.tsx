import { Divider, Drawer, Select } from 'antd';

type Props = {
  onClose: () => void;
};

const NodeRelationshipOverlay = ({ onClose }: Props): JSX.Element => {
  const OverlayBody = (): JSX.Element => (
    <div>
      <div>Add Twin</div>
      <div className="form__label">Twin</div>
      <Select value="None" />

      <Divider />

      <div>Add Consanguinity</div>
      <div className="form__label">Consanguinity</div>
      <Select value="None" />
    </div>
  );

  return (
    <Drawer
      closable
      getContainer=".pedigree__graph"
      mask={false}
      placement="right"
      style={{ position: 'absolute' }}
      title="Relationship"
      visible
      width="358"
      onClose={onClose}
    >
      <OverlayBody />
    </Drawer>
  );
};

export default NodeRelationshipOverlay;
