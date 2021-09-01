import {
  EdgeConfig, IEdge, IGroup, IShape, Item, ModelConfig,
} from '@antv/g6';
import { RelativeEdge } from '@src/types/pedigree';
import {
  drawConsanguineous, drawInfertile, drawInfertileByChoice, ModelConfigData,
} from '..';
import { EDGES, globalStyle } from '../../graph-config';

export const setEdgeState = (name?: string, value?: string | boolean, item?: Item): void => {
  const isChanged = item?.hasState('changed');
  const isConsanguineous = name === EDGES.CONSANGUINEOUS.name;
  const isInfertile = (name === EDGES.INFERTILE.name);
  const isInfertileByChoice = (name === EDGES.INFERTILE_BY_CHOICE.name);
  const hasCustomState = isConsanguineous || isInfertile || isInfertileByChoice;

  const { endPoint, startPoint, type } = item?.getModel() as EdgeConfig;

  if (startPoint && endPoint && item && hasCustomState) {
    const group = item.getContainer();
    const shapeLine = group?.find(
      (i: IShape) => i.get('name') === EDGES.NORMAL.shapeName || i.get('name') === EDGES.CASUAL.shapeName,
    );
    const isDivorced = type === RelativeEdge.DIVORCED;

    if (isInfertile) {
      const shapeInfertile = group?.find((i: IShape) => i.get('name') === EDGES.INFERTILE.shapeName);
      const shapeInfertileClear = group?.find((i: IShape) => i.get('name') === EDGES.INFERTILE.shapeNameAdditional);
      shapeInfertile?.remove();
      shapeInfertileClear?.remove();

      if (value) {
        drawInfertile(group, { x: endPoint.x, y: startPoint.y + 1 }, isDivorced, isChanged);
      }
    }

    if (isInfertileByChoice) {
      const shapeInfertileByChoice = group?.find(
        (i: IShape) => i.get('name') === EDGES.INFERTILE_BY_CHOICE.shapeName,
      );
      shapeInfertileByChoice?.remove();

      if (value) {
        drawInfertileByChoice(group, { x: endPoint.x, y: startPoint.y + 1 }, isDivorced, isChanged);
      }
    }

    if (isConsanguineous) {
      // Shape X coordinate - Change x coordinate
      shapeLine?.attr('path', [
        ['M', startPoint.x, startPoint.y + (value ? globalStyle.stroke.lineWidth : 0)],
        ['L', endPoint.x, endPoint.y + (value ? globalStyle.stroke.lineWidth : 0)],
      ]);

      // Shape Consanguineous - Create | Delete
      const shapeConsanguineous = group?.find((i: IShape) => i.get('name') === EDGES.CONSANGUINEOUS.shapeName);
      shapeConsanguineous?.remove();

      if (value) {
        drawConsanguineous(group, { xStart: startPoint.x, xEnd: endPoint.x, y: endPoint.y }, isChanged);
      }
    }
  }
};

export const drawEdgePolyline = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const startPoint = cfg?.startPoint || { x: 0, y: 0 };
  const endPoint = cfg?.endPoint || { x: 0, y: 0 };
  const { step } = globalStyle.polyline;

  const item: IEdge = group?.get('item');
  const model = item.getTarget().getModel() as ModelConfig & ModelConfigData;
  const isAdoptedOut = model.attributes?.adoptedOut?.isAdoptedOut;

  const keyShape = group?.addShape('path', {
    attrs: {
      path: [
        ['M', startPoint.x, startPoint.y],
        ['L', startPoint.x, startPoint.y + step],
        ['L', endPoint.x, startPoint.y + step],
        ['L', endPoint.x, endPoint.y],
      ],
      stroke: globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,
      lineDash: isAdoptedOut ? [globalStyle.stroke.edgeLineWidth * 6] : null,
    },
    name: EDGES.POLYLINE.shapeName,
  });

  return keyShape as IShape;
};

export const drawEdgeNormal = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const startPoint = cfg?.startPoint || { x: 0, y: 0 };
  const endPoint = cfg?.endPoint || { x: 0, y: 0 };

  const keyShape = group?.addShape('path', {
    attrs: {
      path: [
        ['M', startPoint.x, startPoint.y],
        ['L', endPoint.x, endPoint.y],
      ],
      stroke: globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,
    },
    name: EDGES.NORMAL.shapeName,
  });

  return keyShape as IShape;
};

export const drawEdgeCasual = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const startPoint = cfg?.startPoint || { x: 0, y: 0 };
  const endPoint = cfg?.endPoint || { x: 0, y: 0 };

  const keyShape = group?.addShape('path', {
    attrs: {
      path: [
        ['M', startPoint.x, startPoint.y],
        ['L', endPoint.x, endPoint.y],
      ],
      stroke: globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,
      lineDash: [globalStyle.stroke.edgeLineWidth * 6],
    },
    name: EDGES.CASUAL.shapeName,
  });

  return keyShape as IShape;
};

export const afterDrawEdgeSeparated = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const startPoint = cfg?.startPoint || { x: 0, y: 0 };
  const endPoint = cfg?.endPoint || { x: 0, y: 0 };
  const { width } = globalStyle.infertileEdge;

  const keyShape = group?.addShape('path', {
    attrs: {
      path: [
        ['M', endPoint.x + width, startPoint.y - width],
        ['L', endPoint.x - width, startPoint.y + width],
      ],
      stroke: globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,

    },
    name: EDGES.SEPARATED.shapeName,
  });

  return keyShape as IShape;
};

export const afterDrawEdgeDivorced = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const startPoint = cfg?.startPoint || { x: 0, y: 0 };
  const endPoint = cfg?.endPoint || { x: 0, y: 0 };
  const { width } = globalStyle.infertileEdge;

  group?.addShape('path', {
    attrs: {
      path: [
        ['M', endPoint.x + width, startPoint.y - width],
        ['L', endPoint.x - width, startPoint.y + width],
      ],
      stroke: 'white',
      lineWidth: globalStyle.stroke.edgeLineWidth * 4,
    },
    name: EDGES.DIVORCED.shapeNameAdditional,
  });

  const keyShape = group?.addShape('path', {
    attrs: {
      path: [
        ['M', endPoint.x + (width + 3), startPoint.y - width],
        ['L', endPoint.x - (width - 3), startPoint.y + width],
        ['M', endPoint.x + (width - 3), startPoint.y - width],
        ['L', endPoint.x - (width + 3), startPoint.y + width],
      ],
      stroke: globalStyle.stroke.common,
      lineWidth: globalStyle.stroke.edgeLineWidth,
    },
    name: EDGES.DIVORCED.shapeName,
  });

  return keyShape as IShape;
};
