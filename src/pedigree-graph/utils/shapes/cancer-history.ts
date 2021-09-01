/* eslint-disable import/prefer-default-export */
import { IGroup } from '@antv/g6';
import {
  getCoords, getLineWidth, getNodeSize, getStroke, ModelConfigData,
} from '..';

export const drawMaleCancerHistory = (cfg: ModelConfigData, group: IGroup): void => {
  const colorGroup = group?.addGroup({
    name: 'color-group',
  });

  const length = cfg.cancerHistory?.length || 0;
  const stroke = getStroke(length);
  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const lineWidth = getLineWidth(cfg?.style?.lineWidth);

  for (let index = 0; index < length; index += 1) {
    const element = cfg.cancerHistory[index];

    switch (index) {
      case 0:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.start,
            y: coords.y.start,
            width: size,
            height: size,
            stroke,
            fill: element.color,
            lineWidth,
          },
          name: `cancer-shape-${index + 1}`,
        });
        break;

      case 1:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.middle,
            y: coords.y.start,
            width: size / 2,
            height: size,
            stroke,
            fill: element.color,
            lineWidth,
          },
          name: `cancer-shape-${index + 1}`,
        });

        break;

      case 2:
        if (length === 3) {
          colorGroup.addShape('polygon', {
            attrs: {
              points: [
                [coords.x.start, coords.y.end],
                [coords.x.middle, coords.x.middle],
                [coords.x.end, coords.y.end],
              ],
              stroke,
              fill: element.color,
              lineWidth,
            },
            name: `cancer-shape-${index + 1}`,
          });
        }
        if (length > 3) {
          colorGroup.addShape('rect', {
            attrs: {
              x: coords.x.start,
              y: coords.y.middle,
              width: size / 2,
              height: size / 2,
              stroke,
              fill: element.color,
              lineWidth,
            },
            name: `cancer-shape-${index + 1}`,
          });
        }
        break;

      case 3:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.middle,
            y: coords.y.middle,
            width: size / 2,
            height: size / 2,
            stroke,
            fill: element.color,
            lineWidth,
          },
          name: `cancer-shape-${index + 1}`,
        });
        break;

      default:
        break;
    }
  }
};

export const drawFemaleCancerHistory = (cfg: ModelConfigData, group: IGroup): void => {
  const colorGroup = group?.addGroup({
    name: 'color-group',
  });

  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const lineWidth = getLineWidth(cfg?.style?.lineWidth);
  const length = cfg.cancerHistory?.length || 0;
  const stroke = getStroke(length);
  const radius = size / 2;

  for (let index = 0; index < length; index += 1) {
    const element = cfg.cancerHistory[index];

    switch (index) {
      case 0:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.start,
            y: coords.y.start,
            width: size,
            height: size,
            stroke,
            fill: element.color,
            lineWidth,
            radius: [radius],
          },

          name: `cancer-shape-${index + 1}`,
        });
        break;

      case 1:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.middle,
            y: coords.y.start,
            width: size / 2,
            height: size,
            stroke,
            fill: element.color,
            lineWidth,
            radius: [0, radius, radius, 0],
          },

          name: `cancer-shape-${index + 1}`,
        });

        break;

      case 2:
        if (length === 3) {
          colorGroup.addShape('path', {
            attrs: {
              path: [['M', 34.555, 20], ['A', radius, radius, 0, 0, 1, -34.555, 19.333], ['L', 0, 0], ['Z']],
              stroke,
              fill: element.color,
              lineWidth,
            },

            name: `cancer-shape-${index + 1}`,
          });
        }
        if (length > 3) {
          colorGroup.addShape('rect', {
            attrs: {
              x: coords.x.start,
              y: coords.y.middle,
              width: size / 2,
              height: size / 2,
              stroke,
              fill: element.color,
              lineWidth,
              radius: [0, 0, 0, radius],
            },

            name: `cancer-shape-${index + 1}`,
          });
        }
        break;

      case 3:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.middle,
            y: coords.y.middle,
            width: size / 2,
            height: size / 2,
            stroke,
            fill: element.color,
            lineWidth,
            radius: [0, 0, radius, 0],
          },

          name: `cancer-shape-${index + 1}`,
        });
        break;

      default:
        break;
    }
  }
};

export const drawUnknownCancerHistory = (cfg: ModelConfigData, group: IGroup): void => {
  const colorGroup = group?.addGroup({
    name: 'color-group',
  });

  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const lineWidth = getLineWidth(cfg?.style?.lineWidth);
  const length = cfg.cancerHistory?.length || 0;
  const stroke = getStroke(length);

  for (let index = 0; index < length; index += 1) {
    const element = cfg.cancerHistory[index];

    switch (index) {
      case 0:
        colorGroup.addShape('polygon', {
          attrs: {
            points: [
              [coords.x.start, coords.y.middle],
              [coords.x.middle, coords.y.start],
              [coords.x.end, coords.y.middle],
              [coords.x.middle, coords.y.end],
            ],
            stroke,
            fill: element.color,
            lineWidth,
          },

          name: `cancer-shape-${index + 1}`,
        });
        break;

      case 1:
        colorGroup.addShape('polygon', {
          attrs: {
            points: [
              [coords.x.middle, coords.y.middle],
              [coords.x.middle, coords.y.start],
              [coords.x.end, coords.y.middle],
              [coords.x.middle, coords.y.end],
            ],
            stroke,
            fill: element.color,
            lineWidth,
          },

          name: `cancer-shape-${index + 1}`,
        });
        break;

      case 2:
        if (length === 3) {
          colorGroup.addShape('polygon', {
            attrs: {
              points: [
                [coords.x.start / 2, coords.y.end / 2],
                [coords.x.middle, coords.y.middle],
                [coords.x.end / 2, coords.y.end / 2],
                [coords.x.middle, coords.y.end],
              ],
              stroke,
              fill: element.color,
              lineWidth,
            },

            name: `cancer-shape-${index + 1}`,
          });
        }
        if (length > 3) {
          colorGroup.addShape('polygon', {
            attrs: {
              points: [
                [coords.x.start, coords.y.middle],
                [coords.x.middle, coords.y.middle],
                [coords.x.middle, coords.y.end],
              ],
              stroke,
              fill: element.color,
              lineWidth,
            },

            name: `cancer-shape-${index + 1}`,
          });
        }
        break;

      case 3:
        colorGroup.addShape('polygon', {
          attrs: {
            points: [
              [coords.x.end, coords.y.middle],
              [coords.x.middle, coords.y.middle],
              [coords.x.middle, coords.y.end],
            ],
            stroke,
            fill: element.color,
            lineWidth,
          },

          name: `cancer-shape-${index + 1}`,
        });
        break;

      default:
        break;
    }
  }
};

export const drawCancerHistory = (cfg: ModelConfigData, group: IGroup): void => {
  const colorGroup = group?.addGroup({
    name: 'color-group',
  });

  const length = cfg.cancerHistory?.length || 0;
  const stroke = getStroke(length);
  const size = getNodeSize(cfg?.size);
  const coords = getCoords(size);
  const lineWidth = getLineWidth(cfg?.style?.lineWidth);

  for (let index = 0; index < length; index += 1) {
    const element = cfg.cancerHistory[index];

    switch (index) {
      case 0:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.start,
            y: coords.y.start,
            width: size,
            height: size,
            stroke,
            fill: element.color,
            lineWidth,
          },
          name: `cancer-shape-${index + 1}`,
        });
        break;

      case 1:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.middle,
            y: coords.y.start,
            width: size / 2,
            height: size,
            stroke,
            fill: element.color,
            lineWidth,
          },
          name: `cancer-shape-${index + 1}`,
        });

        break;

      case 2:
        if (length === 3) {
          colorGroup.addShape('polygon', {
            attrs: {
              points: [
                [coords.x.start, coords.y.end],
                [coords.x.middle, coords.x.middle],
                [coords.x.end, coords.y.end],
              ],
              stroke,
              fill: element.color,
              lineWidth,
            },
            name: `cancer-shape-${index + 1}`,
          });
        }
        if (length > 3) {
          colorGroup.addShape('rect', {
            attrs: {
              x: coords.x.start,
              y: coords.y.middle,
              width: size / 2,
              height: size / 2,
              stroke,
              fill: element.color,
              lineWidth,
            },
            name: `cancer-shape-${index + 1}`,
          });
        }
        break;

      case 3:
        colorGroup.addShape('rect', {
          attrs: {
            x: coords.x.middle,
            y: coords.y.middle,
            width: size / 2,
            height: size / 2,
            stroke,
            fill: element.color,
            lineWidth,
          },
          name: `cancer-shape-${index + 1}`,
        });
        break;

      default:
        break;
    }
  }
};
