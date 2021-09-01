import G6 from '@antv/g6';
import { RelativeEdge } from '@src/types/pedigree';
import {
  setNodeState, drawLabel, drawShapeFemale, drawShapeMale, drawShapeUnknown, drawEdgeNormal,
  drawEdgePolyline, setEdgeState, drawEdgeCasual, drawShapeSettings, afterDrawEdgeSeparated, afterDrawEdgeDivorced,
} from './utils';

export const EDGE_SHAPE_LINE = { base: 'edge-shape-line', additional: 'additional' };

const getShapeData = (name: RelativeEdge) => {
  const shapeName = `${EDGE_SHAPE_LINE.base}-${name}`;
  const shapeNameAdditional = `${shapeName}-${EDGE_SHAPE_LINE.additional}`;

  return ({ name, shapeName, shapeNameAdditional });
};

export const EDGES = {
  POLYLINE: getShapeData(RelativeEdge.POLYLINE),
  NORMAL: getShapeData(RelativeEdge.NORMAL),
  SEPARATED: getShapeData(RelativeEdge.SEPARATED),
  DIVORCED: getShapeData(RelativeEdge.DIVORCED),
  CASUAL: getShapeData(RelativeEdge.CASUAL),
  CONSANGUINEOUS: getShapeData(RelativeEdge.CONSANGUINEOUS),
  INFERTILE_BY_CHOICE: getShapeData(RelativeEdge.INFERTILE_BY_CHOICE),
  INFERTILE: getShapeData(RelativeEdge.INFERTILE),
  DECEASED: getShapeData(RelativeEdge.DECEASED),
  ADOPTED_IN: getShapeData(RelativeEdge.ADOPTED_IN),
};

export interface PedigreeGlobalStyle {
  nodeSize: number;
  nodePadding: number;
  markerSize: number;
  fill: {
    active: string;
    common: string;
  };
  stroke: {
    active: string;
    common: string;
    full: string;
    lineWidth: number;
    lineWidthActive: number;
    edgeLineWidth: number;
  };
  text: {
    fontSizeTitle: number;
    fontSize: number;
    fontWeight: number;
    textAlign: 'center' | 'start' | 'end' | 'left' | 'right' | undefined;
    color: string;
    fontFamily: string;
  };
  infertileEdge: {
    width: number;
    height: number;
  };
  polyline: {
    step: number;
  };
  cancers: {
    maxVisibleOnList: number;
  };
}

export const globalStyle: PedigreeGlobalStyle = {
  nodeSize: 80,
  nodePadding: 10,
  markerSize: 24,
  fill: {
    active: '#C85FC4',
    common: '#FFFCFF',
  },
  stroke: {
    active: '#C85FC4',
    common: '#AEAEAE',
    full: '#000000',
    lineWidth: 2,
    lineWidthActive: 2.6,
    edgeLineWidth: 1,
  },
  text: {
    fontSizeTitle: 10,
    fontSize: 9,
    fontWeight: 400,
    textAlign: 'center',
    color: '#525252',
    fontFamily: 'SF Pro Display, sans-serif',
  },
  infertileEdge: {
    width: 25,
    height: 102,
  },
  polyline: {
    step: 115,
  },
  cancers: {
    maxVisibleOnList: 4,
  },
};

G6.registerNode(
  'pie-node-male',
  {
    drawLabel,
    drawShape: drawShapeMale,
    setState: setNodeState,
  },
  'single-node',
);

G6.registerNode(
  'pie-node-female',
  {
    drawLabel,
    drawShape: drawShapeFemale,
    setState: setNodeState,
  },
  'single-node',
);

G6.registerNode(
  'pie-node-unknown',
  {
    drawLabel,
    drawShape: drawShapeUnknown,
    setState: setNodeState,
  },
  'single-node',
);

G6.registerNode('settings', {
  drawShape: drawShapeSettings,
  getAnchorPoints: () => [
    [0.5, 0.5],
  ]
  ,
});

G6.registerEdge(
  EDGES.NORMAL.name,
  {
    draw: drawEdgeNormal,
    setState: setEdgeState,
  },
  'polyline',
);

G6.registerEdge(
  EDGES.CASUAL.name,
  {
    draw: drawEdgeCasual,
  },
  EDGES.NORMAL.name,
);

G6.registerEdge(
  EDGES.SEPARATED.name,
  {
    afterDraw: afterDrawEdgeSeparated,
  },
  EDGES.NORMAL.name,
);

G6.registerEdge(
  EDGES.DIVORCED.name,
  {
    afterDraw: afterDrawEdgeDivorced,
  },
  EDGES.NORMAL.name,
);

G6.registerEdge(
  EDGES.POLYLINE.name,
  {
    draw: drawEdgePolyline,
  },
);

export const graphConfig = {
  defaultNode: {
    size: globalStyle.nodeSize,
    style: {
      fill: globalStyle.fill.common,
      stroke: globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.lineWidth,
      textColor: globalStyle.text.color,
      fontSize: globalStyle.text.fontSize,
      fontFamily: globalStyle.text.fontFamily,
    },
    labelCfg: {
      position: 'bottom',
    },
    anchorPoints: [
      [0.5, 0],
      [1, 0.5],
      [0.5, 1],
      [0, 0.5],
    ],
  },
  modes: {
    default: [
      // 'drag-node',
      'zoom-canvas',
      'drag-canvas',
    ],
    edit: [],
    settings: [
      'drag-canvas',
    ],
  },
  defaultEdge: {
    type: EDGES.POLYLINE.name,
  },
  nodeStateStyles: {
    hover: {
      fill: globalStyle.fill.active,
      stroke: globalStyle.stroke.active,
      lineWidth: globalStyle.stroke.lineWidth,
    },
  },
  edgeStateStyles: {
    active: {
      fill: globalStyle.fill.active,
      stroke: globalStyle.stroke.active,
      lineWidth: globalStyle.stroke.lineWidth,
    },
  },
};
