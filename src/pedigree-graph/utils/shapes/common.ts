import {
  IGroup, IShape, ModelConfig, Util,
} from '@antv/g6';
import { IndividualGender } from '@rootTypes/individual';
import { EDGES, globalStyle } from '../../graph-config';
import {
  Coords, G6Util, getCoords, getFill, getLabelTextAttr, getLineWidth,
  getNodeSize, getProbandMarkerAttrs, getStroke, hasChildAttributes, ModelConfigData,
} from '..';

export const drawContainer = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const isChildAttrs = hasChildAttributes(cfg);
  const shapeType = isChildAttrs ? 'path' : 'rect';
  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const fill = getFill(cfg?.style?.fill);
  const lineWidth = getLineWidth(cfg?.style?.lineWidth);
  const isFemaleNode = cfg?.type?.includes(IndividualGender.FEMALE.toLowerCase());

  const trianglePath = [
    ['M', coords.x.start, coords.y.end / 2],
    ['L', coords.x.end, coords.y.end / 2],
    ['L', coords.x.middle, coords.y.start / 2],
    ['L', coords.x.start, coords.y.end / 2],
    ['L', coords.x.end, coords.y.end / 2],
  ];

  const attrs = {
    x: coords.x.start,
    y: coords.y.start,
    path: trianglePath,
    width: size,
    height: size,
    lineWidth,
    fill,
    radius: isFemaleNode ? [size / 2] : undefined,
  };

  return group?.addShape(shapeType, {
    attrs,
    name: 'shape-container',
  }) as IShape;
};

export const drawBorder = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const isFemaleNode = cfg?.type?.includes(IndividualGender.FEMALE.toLowerCase());
  const isUnknownNode = cfg?.type?.includes(IndividualGender.UNKNOWN.toLowerCase());
  const isChildAttrs = hasChildAttributes(cfg);
  const shapeType = (isChildAttrs || isUnknownNode) ? 'path' : 'rect';
  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const lineWidth = getLineWidth(cfg?.style?.lineWidth);
  const cancersLength = (cfg as ModelConfigData)?.cancerHistory?.length || 0;
  const stroke = getStroke(cancersLength);

  const trianglePath = [
    ['M', coords.x.start, coords.y.end / 2],
    ['L', coords.x.end, coords.y.end / 2],
    ['L', coords.x.middle, coords.y.start / 2],
    ['L', coords.x.start, coords.y.end / 2],
    ['L', coords.x.end, coords.y.end / 2],
  ];

  const rhombus = [
    ['M', coords.x.start, coords.y.middle],
    ['L', coords.x.middle, coords.y.start],
    ['L', coords.x.end, coords.y.middle],
    ['L', coords.x.middle, coords.y.end],
    ['L', coords.x.start, coords.y.middle],
  ];

  const attrs = {
    x: coords.x.start,
    y: coords.y.start,
    path: isChildAttrs ? trianglePath : rhombus,
    width: size,
    height: size,
    lineWidth,
    stroke,
    radius: isFemaleNode ? [size / 2] : undefined,
  };

  return group?.addShape(shapeType, {
    attrs,
    name: 'shape-border',
  }) as IShape;
};

export const drawProbandMarker = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const isTriangleNode = hasChildAttributes(cfg);
  const isUnknownNode = cfg?.type?.includes(IndividualGender.UNKNOWN.toLowerCase());
  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const lineWidth = getLineWidth(cfg?.style?.lineWidth);

  return group?.addShape('marker', {
    attrs: getProbandMarkerAttrs(
      coords.x.start / ((!isTriangleNode && isUnknownNode) ? 2 : 1) - (lineWidth / 2),
      (coords.y.end / ((isTriangleNode || isUnknownNode) ? 2 : 1)) + lineWidth / 2 - 1,
    ),
    name: 'proband-marker',
  }) as IShape;
};

export const drawInfertile = (
  group: IGroup, { x, y }: { x: number; y: number }, isDivorced?: boolean, isChanged?: boolean,
): IShape => {
  const { height, width } = globalStyle.infertileEdge;

  group?.addShape('path', {
    attrs: {
      path: [
        ['M', x - width, y + height - globalStyle.stroke.lineWidth],
        ['L', x + width, y + height - globalStyle.stroke.lineWidth],
      ],
      stroke: 'white',
      lineWidth: globalStyle.stroke.lineWidth * 1.5,
    },
    name: EDGES.INFERTILE.shapeNameAdditional,
  });

  return group?.addShape('path', {
    attrs: {
      path: [
        ['M', x, y + (isDivorced ? 2 : 0)], // when the type divorced a couple of pixels come out on it. Fix it
        ['L', x, y + height - globalStyle.stroke.lineWidth * 2],
        ['M', x - width, y + height - globalStyle.stroke.lineWidth * 2],
        ['L', x + width, y + height - globalStyle.stroke.lineWidth * 2],
        ['M', x - width, y + height],
        ['L', x + width, y + height],
      ],
      stroke: isChanged ? globalStyle.stroke.active : globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,
    },
    name: EDGES.INFERTILE.shapeName,
  });
};

export const drawInfertileReason = (
  group: IGroup, { x, y }: { x: number; y: number }, reason: string,
): void => {
  group.addShape('text', {
    attrs: getLabelTextAttr(
      x,
      y,
      reason,
    ),
    name: 'label-infertile-reason',
  });
};

export const drawInfertileByChoice = (
  group: IGroup, { x, y }: { x: number; y: number }, isDivorced?: boolean, isChanged?: boolean,
): void => {
  const { height, width } = globalStyle.infertileEdge;

  group?.addShape('path', {
    attrs: {
      path: [
        ['M', x, y + (isDivorced ? 2 : 0)], // when the type divorced a couple of pixels come out on it. Fix it
        ['L', x, y + height],
        ['M', x - width, y + height],
        ['L', x + width, y + height],
      ],
      stroke: isChanged ? globalStyle.stroke.active : globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,
    },
    name: EDGES.INFERTILE_BY_CHOICE.shapeName,
  });
};

export const drawDeceased = (
  group: IGroup, coords: Coords, isChanged?: boolean,
): void => {
  group?.addShape('path', {
    attrs: {
      path: [
        ['M', coords.x.start + 1, coords.y.end - 1],
        ['L', coords.x.end, coords.y.start],
      ],
      stroke: isChanged ? globalStyle.stroke.active : globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.lineWidth,
    },
    name: EDGES.DECEASED.shapeName,
  });
};

export const drawConsanguineous = (
  group: IGroup, { xStart, xEnd, y }: { xStart: number;xEnd: number; y: number }, isChanged?: boolean,
): void => {
  group?.addShape('path', {
    attrs: {
      path: [
        ['M', xEnd, y - globalStyle.stroke.lineWidth],
        ['L', xStart, y - globalStyle.stroke.lineWidth],
      ],
      stroke: isChanged ? globalStyle.stroke.active : globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,
    },
    name: EDGES.CONSANGUINEOUS.shapeName,
  });
};

export const drawAdopted = (
  group: IGroup, coords: Coords, isChanged?: boolean,
): void => {
  group?.addShape('path', {
    attrs: {
      path: [
        ['M', coords.x.start + 20, coords.y.start - 10],
        ['L', coords.x.start - 10, coords.y.start - 10],
        ['L', coords.x.start - 10, coords.y.end + 10],
        ['L', coords.x.start + 20, coords.y.end + 10],
        ['M', coords.x.end - 20, coords.y.start - 10],
        ['L', coords.x.end + 10, coords.y.start - 10],
        ['L', coords.x.end + 10, coords.y.end + 10],
        ['L', coords.x.end - 20, coords.y.end + 10],
      ],
      stroke: isChanged ? globalStyle.stroke.active : globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.lineWidth,
    },
    name: EDGES.DECEASED.shapeName,
  });
};

export const drawPregnancy = (
  group: IGroup, coords: Coords,
): void => {
  const { x, y } = coords;
  const fontSize = 40;
  const letterWidth = (Util as G6Util).getLetterWidth('+', fontSize);

  group.addShape('text', {
    attrs: {
      x: x.middle,
      y: y.middle + letterWidth,
      text: 'P',
      fontSize,
      fill: globalStyle.text.color,
      textAlign: globalStyle.text.textAlign,
      fontFamily: globalStyle.text.fontFamily,
      stroke: 'white',
    },
    name: 'label-pregnancy',
  });
};

export const drawStillbirth = (
  group: IGroup, coords: Coords, isChanged?: boolean,
): void => {
  group?.addShape('path', {
    attrs: {
      path: [
        ['M', coords.x.start + 1, coords.y.end - 1],
        ['L', coords.x.end, coords.y.start],
      ],
      stroke: isChanged ? globalStyle.stroke.active : globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.lineWidth,
    },
    name: EDGES.DECEASED.shapeName,
  });
};
