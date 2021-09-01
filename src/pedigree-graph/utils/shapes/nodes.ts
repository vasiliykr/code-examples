import {
  IBBox, IGroup, IShape, Item, ModelConfig,
} from '@antv/g6';
import { settingsUrl } from '@rootCommon/images';
import {
  drawMaleCancerHistory, drawAdopted, drawDeceased, drawInfertile, drawInfertileByChoice, drawInfertileReason,
  drawPregnancy, drawStillbirth, fittingString, getCoords, getLabelTextAttr, getMaxTextSize, getNodeSize, getStroke,
  hasAttributes, hasCancerHistory, hasChildAttributes, isProbandNode, ModelConfigData, drawContainer,
  drawBorder, drawProbandMarker, getLabelTextFromAttr, drawFemaleCancerHistory, drawUnknownCancerHistory,
} from '../index';
import { globalStyle } from '../../graph-config';

export const drawLabel = (cfg: ModelConfig, group: IGroup): IShape => {
  const size = getNodeSize(cfg.size);
  const coords = getCoords(size);
  const isTriangleNode = hasChildAttributes(cfg);
  const stillbirth = (cfg as ModelConfigData)?.attributes?.stillbirth;
  const isProband = isProbandNode(cfg.id);
  const isTitle = true;

  const labelText = getLabelTextFromAttr(cfg);

  const nodeNameGroup = group?.addGroup({
    name: 'node-name-group',
  });

  const nodeNameBackground = nodeNameGroup.addShape('rect', {
    attrs: { fill: 'white' },
    name: 'node-name-background',
  });

  const nodeName = nodeNameGroup.addShape('text', {
    attrs: getLabelTextAttr(coords.x.middle,
      (coords.y.end / (isTriangleNode ? 2 : 1)) + 13, labelText, isProband, isTitle),
    name: 'label',
  });

  const nodeNameBBox: IBBox = nodeName.getBBox();

  nodeNameBackground.attr({
    x: nodeNameBBox.x,
    y: nodeNameBBox.y,
    width: nodeNameBBox.width,
    height: nodeNameBBox.height,
  });

  if (hasAttributes(cfg) && stillbirth?.isStillbirth && stillbirth?.sbGestationalAge) {
    const stillbirthBackground = group.addShape('rect', {
      attrs: { fill: 'white' },
      name: 'node-name-background',
    });

    const stillbirthShape = group.addShape('text', {
      attrs: {
        x: coords.x.middle,
        y: coords.y.end + nodeNameBBox.width + globalStyle.text.fontSize,
        text: `wk ${stillbirth.sbGestationalAge}`,
        fontSize: globalStyle.text.fontSize,
        fill: globalStyle.text.color,
        textAlign: globalStyle.text.textAlign,
        fontFamily: globalStyle.text.fontFamily,
        stroke: 'white',
      },
      name: 'label-stillbirth-age',
    });

    const stillbirthShapeBox: IBBox = stillbirthShape.getBBox();

    stillbirthBackground.attr({
      x: stillbirthShapeBox.x,
      y: stillbirthShapeBox.y,
      width: stillbirthShapeBox.width,
      height: stillbirthShapeBox.height,
    });
  }

  if (hasCancerHistory(cfg) && !isTriangleNode && !stillbirth?.isStillbirth) {
    const cancerList = group?.addGroup({
      name: 'cancer-list-group',
    });

    const length = cfg.cancerHistory?.length || 0;
    const maxLength = length > globalStyle.cancers.maxVisibleOnList ? globalStyle.cancers.maxVisibleOnList : length;

    for (let index = 0; index < maxLength; index += 1) {
      const paddingHeader = 7 + ((index * 1.1 + 2) * globalStyle.text.fontSize);

      if (cfg.cancerHistory[index]) {
        const { name, age } = cfg.cancerHistory[index];

        const itemBackground = cancerList.addShape('rect', {
          attrs: { fill: 'white' },
          name: `background-cancer-name-${index + 1}`,
        });

        const item = cancerList.addShape('text', {
          attrs: getLabelTextAttr(
            coords.x.middle,
            coords.y.end + paddingHeader,
            `${name || 'Unknown'} ${age || ''}`,
            isProband,
          ),
          name: `label-cancer-name-${index + 1}`,
        });

        const {
          width, height, x, y,
        }: IBBox = item.getBBox();

        itemBackground.attr({
          x, y, width, height,
        });
      }
    }
  }

  return nodeName;
};

export const setNodeState = (name?: string, value?: string | boolean, item?: Item): void => {
  const group: IGroup | undefined = item?.get('group');
  const rectShape = group?.find((i: IShape) => i.get('name') === 'shape-border');
  const nodeTitleShape = group?.find((i: IShape) => i.get('name') === 'label');
  const cancerNamesShapes = group?.findAll((i: IShape) => String(i.get('name')).includes('label-cancer-name-'));
  const infertileReason = group?.find((i: IShape) => i.get('name') === 'label-infertile-reason');
  const cfg = item?.getModel() as ModelConfigData;
  const isProband = isProbandNode(cfg?.id);

  if (name === 'active' || name === 'hover') {
    if (rectShape) {
      const cancersLength = cfg?.cancerHistory?.length || 0;
      const isActive = item?.hasState('active');
      const defaultStroke = getStroke(cancersLength);

      rectShape.attr('stroke', (value || isActive)
        ? globalStyle.stroke.active
        : defaultStroke);

      rectShape.attr('lineWidth', (value || isActive)
        ? globalStyle.stroke.lineWidthActive
        : globalStyle.stroke.lineWidth);
    }
    if (name === 'active' && (nodeTitleShape || cancerNamesShapes || infertileReason)) {
      const maxSize = getMaxTextSize(value ? undefined : isProband);

      if (nodeTitleShape) {
        const text = getLabelTextFromAttr(cfg);
        nodeTitleShape.attr('text', value
          ? text
          : fittingString(text, maxSize, globalStyle.text.fontSizeTitle));
      }

      if (cancerNamesShapes) {
        for (let index = 0; index < cancerNamesShapes.length; index += 1) {
          const element = cancerNamesShapes[index];
          const name = cfg?.cancerHistory?.[index]?.name || '';
          const age = cfg?.cancerHistory?.[index]?.age || '';
          const text = `${name} ${age}`;

          element.attr('text', value
            ? text
            : fittingString(text, maxSize, globalStyle.text.fontSize));
        }
      }

      if (infertileReason && cfg?.attributes?.infertile.isInfertile) {
        const text = (cfg?.attributes?.infertile.infertileReason as string) || '';

        infertileReason.attr('text', value
          ? text
          : fittingString(text, maxSize, globalStyle.text.fontSize));
      }

      if (infertileReason && cfg?.attributes?.infertileByChoice.isInfertileByChoice) {
        const text = (cfg?.attributes?.infertileByChoice.infertileByChoiceReason) || '';

        infertileReason.attr('text', value
          ? text
          : fittingString(text, maxSize, globalStyle.text.fontSize));
      }
    }
  }
};

const drawInfertileGroup = (cfg: ModelConfigData, group: IGroup) => {
  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const { height } = globalStyle.infertileEdge;

  const infertileGroup = group.addGroup({
    name: 'infertile-group',
  });

  if (cfg.attributes?.infertile?.isInfertile) {
    const reason = cfg.attributes.infertile.infertileReason;

    drawInfertile(infertileGroup, { x: coords.x.middle, y: coords.y.middle });

    if (reason) {
      drawInfertileReason(infertileGroup, { x: coords.x.middle, y: coords.y.middle + height + 10 }, reason);
    }
  }

  if (cfg.attributes?.infertileByChoice?.isInfertileByChoice) {
    const reason = cfg.attributes.infertileByChoice.infertileByChoiceReason;

    drawInfertileByChoice(infertileGroup, { x: coords.x.middle, y: coords.y.middle });

    if (reason) {
      drawInfertileReason(infertileGroup, { x: coords.x.middle, y: coords.y.middle + height + 10 }, reason);
    }
  }
};

const drawAttributesGroup = (cfg: ModelConfigData, group: IGroup) => {
  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);

  const attributesGroup = group.addGroup({
    name: 'attributes-group',
  });

  if (cfg.attributes?.deceased?.isDeceased) {
    drawDeceased(attributesGroup, coords);
  }

  if (cfg.attributes?.adoptedIn?.isAdoptedIn || cfg.attributes?.adoptedOut?.isAdoptedOut) {
    drawAdopted(attributesGroup, coords);
  }

  if (cfg.attributes?.pregnancy?.isPregnant) {
    drawPregnancy(attributesGroup, coords);
  }

  if (cfg.attributes?.stillbirth?.isStillbirth) {
    drawStillbirth(attributesGroup, coords);
  }
};

export const drawShapeMale = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const isProbandMarker = isProbandNode(cfg?.id);

  if (hasAttributes(cfg) && group) {
    drawInfertileGroup(cfg, group);
  }

  const container = drawContainer(cfg, group);

  if (hasCancerHistory(cfg) && !hasChildAttributes(cfg) && group) {
    drawMaleCancerHistory(cfg, group);
  }

  if (hasAttributes(cfg) && group) {
    drawAttributesGroup(cfg, group);
  }

  drawBorder(cfg, group);

  if (isProbandMarker) {
    drawProbandMarker(cfg, group);
  }

  return container;
};

export const drawShapeFemale = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const isProbandMarker = isProbandNode(cfg?.id);

  if (hasAttributes(cfg) && group) {
    drawInfertileGroup(cfg, group);
  }

  const container = drawContainer(cfg, group);

  if (hasCancerHistory(cfg) && !hasChildAttributes(cfg) && group) {
    drawFemaleCancerHistory(cfg, group);
  }

  if (hasAttributes(cfg) && group) {
    drawAttributesGroup(cfg, group);
  }

  drawBorder(cfg, group);

  if (isProbandMarker) {
    drawProbandMarker(cfg, group);
  }

  return container;
};

export const drawShapeUnknown = (cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const isProbandMarker = isProbandNode(cfg?.id);

  if (hasAttributes(cfg) && group) {
    drawInfertileGroup(cfg, group);
  }

  const container = drawContainer(cfg, group);

  if (hasCancerHistory(cfg) && !hasChildAttributes(cfg) && group) {
    drawUnknownCancerHistory(cfg, group);
  }

  if (hasAttributes(cfg) && group) {
    drawAttributesGroup(cfg, group);
  }

  drawBorder(cfg, group);

  if (isProbandMarker) {
    drawProbandMarker(cfg, group);
  }

  return container;
};

export const drawShapeSettings = (_cfg: ModelConfig | undefined, group: IGroup | undefined): IShape => {
  const imageSize = 52;

  return group?.addShape('image', {
    attrs: {
      x: -imageSize / 2,
      y: -imageSize / 2,
      width: imageSize,
      height: imageSize,
      img: settingsUrl,
      cursor: 'pointer',
    },

    name: 'settings',
  }) as IShape;
};
