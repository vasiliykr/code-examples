/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ModelConfig, Util } from '@antv/g6';
import { IndividualAttributes } from '@rootTypes/family-builder';
import { PedigreeCancerHistory } from '@src/types/pedigree';
import { globalStyle } from '../graph-config';

export type G6Util = {
  getTextSize: (ellipsis: string, fontSize: number) => number[];
  getLetterWidth: (letter: string, fontSize: number) => number;
};

export interface ModelConfigData extends ModelConfig {
  cancerHistory: PedigreeCancerHistory[];
  attributes: IndividualAttributes ;
  size: number;
}

export type Coord = {
  start: number;
  middle: number;
  end: number;
};

export type Coords = {
  x: Coord;
  y: Coord;
};

export const fittingString = (str: string, maxWidth: number, fontSize: number): string => {
  const ellipsis = '...';
  const ellipsisLength: number = (Util as G6Util).getTextSize(ellipsis, fontSize)?.[0];
  let currentWidth = 0;
  let res = str;

  str?.split('')?.forEach((letter, i) => {
    if (currentWidth > maxWidth - ellipsisLength) return;

    // get the width of single letter according to the fontSize
    currentWidth += (Util as G6Util).getLetterWidth(letter, fontSize);

    if (currentWidth > maxWidth - ellipsisLength && i !== str.length - 1) {
      res = `${str.substr(0, i)}${ellipsis}`;
    }
  });

  return res;
};

export const getStroke = (length = 0): string => (
  length > globalStyle.cancers.maxVisibleOnList ? globalStyle.stroke.full : globalStyle.stroke.common
);

export const getLineWidth = (lineWidth?: number): number => lineWidth || globalStyle.stroke.lineWidth;

export const getNodeSize = (size: number | number[] | undefined): number => (
  typeof size === 'number' ? size : globalStyle.nodeSize
);

export const getFill = (fill?: string | null): string => fill || globalStyle.fill.common;

export const getCoords = (size: number): Coords => ({
  x: {
    start: -size / 2,
    middle: 0,
    end: size / 2,
  },
  y: {
    start: -size / 2,
    middle: 0,
    end: size / 2,
  },
});

export const getProbandMarkerAttrs = (x: number, y: number) => ({
  x,
  y,
  r: globalStyle.markerSize,
  fill: globalStyle.fill.active,
  symbol: (x: number, y: number, r: number) => [['M', x, y], ['L', x, y + r], ['L', x - r, y], ['Z']],
});

export const getMaxTextSize = (hasMarker?: boolean): number => (hasMarker
  ? globalStyle.nodeSize + globalStyle.stroke.lineWidth * 2
  : globalStyle.nodeSize + globalStyle.nodePadding * 4);

export const getLabelText = (label: unknown): string => (typeof label === 'string' ? label : '');

export const getLabelTextAttr = (x: number, y: number, text: string, hasMarker?: boolean, isTitle?: boolean) => {
  const maxSize = getMaxTextSize(hasMarker);

  return {
    x,
    y,
    text: fittingString(text, maxSize, isTitle ? globalStyle.text.fontSizeTitle : globalStyle.text.fontSize),
    fontWeight: isTitle ? globalStyle.text.fontWeight + 200 : globalStyle.text.fontWeight,
    fontSize: isTitle ? globalStyle.text.fontSizeTitle : globalStyle.text.fontSize,
    fill: globalStyle.text.color,
    textAlign: globalStyle.text.textAlign,
    fontFamily: globalStyle.text.fontFamily,
    stroke: 'white',
  };
};

export const hasCancerHistory = (cfg: ModelConfig | undefined): cfg is ModelConfigData => (
  (typeof cfg === 'object') && ('cancerHistory' in cfg) && (cfg?.cancerHistory !== null)
);

export const hasAttributes = (cfg: ModelConfig | undefined): cfg is ModelConfigData => (
  (typeof cfg === 'object') && ('attributes' in cfg) && (cfg?.attributes !== null)
);

export const hasChildAttributes = (cfg: ModelConfig | undefined) => hasAttributes(cfg) && (
  cfg.attributes?.spontaneousAbortion?.isSab
  || cfg.attributes?.terminationOfPregnancy?.isTop
  || cfg.attributes?.ectopicPregnancy?.isECT
);

export const getTriangleLabelText = (cfg: ModelConfig): string => {
  let label = '';

  if (hasAttributes(cfg)) {
    const SAB = cfg.attributes.spontaneousAbortion;
    const TOP = cfg.attributes.terminationOfPregnancy;
    const ECT = cfg.attributes.ectopicPregnancy;

    if (SAB.isSab && SAB.sabGestationalAge) label = `${SAB.sabGestationalAge} wk`;
    if (TOP.isTop && TOP.topGestationalAge) label = `${TOP.topGestationalAge} wk`;
    if (ECT.isECT) label = 'ECT';
  }

  return label;
};

export const getLabelTextFromAttr = (cfg: ModelConfig): string => {
  const isTriangleNode = hasChildAttributes(cfg);
  const isStillbirth = hasAttributes(cfg) && cfg.attributes.stillbirth?.isStillbirth;

  if (isTriangleNode) {
    return getTriangleLabelText(cfg);
  } if (isStillbirth) {
    return 'SB';
  }
  return getLabelText(cfg.label) || `Individual (${getLabelText(cfg.sex) || 'Unknown'})`;
};

export const isProbandNode = (id: unknown): boolean => id === 'proband';
