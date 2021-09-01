/* eslint-disable @typescript-eslint/no-unused-vars */
import { IndividualGender } from '@rootCommon/types/individual';
import { IndividualNode, PedigreeLayoutData, PedigreeLayout } from '@src/types/pedigree';

export const layout: PedigreeLayoutData = [
  [
    { id: "father's father", x: 200, y: 140 },
    { id: 'fathersfather-fathersmother-settings', x: 300, y: 140 },
    { id: "father's mother", x: 400, y: 140 },
    { id: "mother's father", x: 600, y: 140 },
    { id: 'mothersfather-mothersmother-settings', x: 700, y: 140 },
    { id: "mother's mother", x: 800, y: 140 },
  ],
  [
    {
      id: 'father', x: 300, y: 320, fixed: true, parents: 'fathersfather-fathersmother-settings',
    },
    {
      id: 'father-mother-settings', x: 500, y: 320, fixed: true,
    },
    {
      id: 'mother', x: 700, y: 320, fixed: true, parents: 'mothersfather-mothersmother-settings',
    },
  ],
  [{
    id: 'proband', x: 500, y: 500, parents: 'father-mother-settings',
  }],
  [],
  [],
];

const HORIZONTAL_SHIFT = 100;
const VERTICAL_SHIFT = 180;

export enum IndividualSide {
  left = 'left',
  right = 'right',
}

export const recalculateLayout = (
  layoutArray: PedigreeLayout[], id: string, side: IndividualSide,
): PedigreeLayout[] => {
  // const fixedNodeId = layoutArray.findIndex(node => node.id === id);
  // const baseX = layoutArray[fixedNodeId].x;
  // let recalculatedPart;

  // if (side === IndividualSide.right) {
  //     recalculatedPart = layoutArray.slice(fixedNodeId).map((item: Layout, index: number) => {
  //         return {...item, x: baseX + HORIZONTAL_SHIFT * index};
  //     });

  //     layoutArray.splice(fixedNodeId, recalculatedPart.length, ...recalculatedPart);
  // }

  // if (side === IndividualSide.left) {
  //     recalculatedPart = layoutArray
  //         .slice(0, fixedNodeId)
  //         .reverse()
  //         .map((item: Layout, index: number) => {
  //             return {...item, x: baseX - HORIZONTAL_SHIFT * (index + 1)};
  //         })
  //         .reverse();

  //     layoutArray.splice(0, fixedNodeId, ...recalculatedPart);
  // }
  const firstFixed = layoutArray.findIndex((item) => item.fixed);
  const lastFixed = layoutArray.length - 1 - [...layoutArray].reverse().findIndex((item) => item.fixed);

  if (firstFixed === -1) {
    const firstX = layoutArray[0].x;

    return layoutArray.map((item, index) => ({ ...item, x: firstX + HORIZONTAL_SHIFT * index }));
  }
  const leftPart = layoutArray.slice(0, firstFixed);
  const rightPart = layoutArray.slice(lastFixed + 1);
  const leftX = layoutArray[firstFixed].x;
  const rightX = layoutArray[lastFixed].x;

  const newLeft = leftPart
    .reverse()
    .map((item, index) => ({ ...item, x: leftX - HORIZONTAL_SHIFT * (index + 1) }))
    .reverse();
  const newRight = rightPart
    .map((item, index) => ({ ...item, x: rightX + HORIZONTAL_SHIFT * (index + 1) }));

  layoutArray.splice(0, firstFixed, ...newLeft);
  layoutArray.splice(lastFixed + 1, layoutArray.length, ...newRight);

  return layoutArray;
};

const getSide = (node: IndividualNode): IndividualSide => {
  const { id, level } = node;
  const levelNodes = layout[level - 1];
  const idx = levelNodes.findIndex((item) => item.id === id);
  const prev = levelNodes[idx - 1];
  const next = levelNodes[idx + 1];

  if (prev && prev.id.search('setting') !== -1) {
    return IndividualSide.right;
  }

  if (next && next.id.search('setting') !== -1) {
    return IndividualSide.left;
  }

  return IndividualSide.right;
};

export const addIndividual = (
  individual: IndividualNode, newNodeId: string, newSettingsNodeId?: string,
): [PedigreeLayout[], IndividualSide | undefined] | [] => {
  let side;
  const defaultIndividual = {
    level: 3, sex: IndividualGender.MALE, spouse: null, id: 'proband', x: 500, y: 500,
  };
  const {
    level, spouse, parents, id, x, y,
  } = individual || defaultIndividual;

  if (spouse && newSettingsNodeId) return [];
  const innerLevel = layout[Number(level) - 1];
  const individualPosition = innerLevel.findIndex((item) => item.id === id);
  const newNode: PedigreeLayout = {
    id: newNodeId, x: Number(x) + HORIZONTAL_SHIFT * 2, y: Number(y), fixed: false, parents,
  };

  if (newSettingsNodeId) {
    const settingsNode = { id: newSettingsNodeId, x: Number(x) + HORIZONTAL_SHIFT, y: Number(y) };

    innerLevel.splice(individualPosition + 1, 0, settingsNode, newNode);
  } else {
    if (!parents) return [];
    // Find node's spouse and check if he/she has parents
    // If so, add sibling to respective side
    side = getSide(individual);

    switch (side) {
      case IndividualSide.left:
        newNode.x = Number(x) - HORIZONTAL_SHIFT;
        innerLevel.unshift(newNode);
        break;

      case IndividualSide.right:
        innerLevel.push(newNode);
        break;

      default:
        break;
    }
  }

  return [innerLevel, side];
};

export const deleteRelative = (relativeIds: string[]): void => {
  relativeIds.forEach((relative) => {
    layout.forEach((level) => {
      const position = level.findIndex((item) => item.id === relative);

      if (position !== -1) {
        level.splice(position, 1);
      }
    });
  });
};

const whereIsTheChildWillBe = (individual: IndividualNode): number => {
  let position = 0;
  const { level, spouse } = individual;
  const goalSpouse = spouse;
  const currentLevel = [...layout[level - 1]];
  const childrenLevel = [...layout[level]];
  const marriageOrderSet = new Set<string>();
  currentLevel.forEach((layout) => {
    if (layout.id.search(/settings/gm) !== -1) marriageOrderSet.add(layout.id);
  });
  const marriageOrder: string[] = [...marriageOrderSet];
  const shift = marriageOrder.findIndex((marriage) => marriage === spouse);

  //   if (shift) {
  //     goalSpouse = marriageOrder[shift - 1];
  //   }

  // define where to place the new node in the level
  const lastChildPosition = childrenLevel.findIndex((item) => item.parents === goalSpouse);

  if (lastChildPosition !== -1) {
    // Find if the last sibling has a spouse
    const hasSpouse = childrenLevel[lastChildPosition + 1]?.id.search(/settings/gm) !== -1;

    if (hasSpouse) {
      const spouseHasParents = childrenLevel[lastChildPosition + 2]?.parents;
      position = lastChildPosition + (spouseHasParents ? 0 : 2);

      return position;
    }

    return lastChildPosition + 1;
  }

  return position;
};

export const addChild = (
  individual: IndividualNode, newNodeId: string, potentialSiblings: string[],
): PedigreeLayout[] => {
  const position = whereIsTheChildWillBe(individual);
  const defaultIndividual = {
    level: 3, sex: IndividualGender.MALE, spouse: null, id: 'proband', x: 500, y: 500,
  };
  const {
    level, spouse, parents, id, x, y,
  } = individual || defaultIndividual;
  const innerLevel = layout[level];

  const newNode: PedigreeLayout = {
    id: newNodeId,
    x: innerLevel[position]?.x || Number(x),
    y: innerLevel[position]?.y || Number(y) + VERTICAL_SHIFT,
    fixed: false,
  };

  innerLevel.splice(position, 0, newNode);

  return innerLevel;
};
