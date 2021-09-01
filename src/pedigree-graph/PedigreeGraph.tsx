import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Button, Drawer, Modal } from 'antd';
import G6, {
  G6Event, Graph as AntvGraph, Item, IPoint, INode, IEdge, ModelConfig, IShape,
} from '@antv/g6';
import { nanoid } from 'nanoid';
import { cn } from '@bem-react/classname';
import { useModal } from '@rootCommon/hooks';
import { useAppDispatch, useAppSelector } from '@common/hooks';
import uploadService from '@rootCommon/services/upload-service';
import Message from '@rootCommon/services/message';
import {
  clearPalette, setChosenNode, getPedigreeAttributes, fetchPedigreeGraphData,
  getPedigreeOverlayDemographics, getPedigreeOverlayCancerHistory,
} from '@actions';
import {
  getCancersData, getPalette, getPedigreeGraphData,
} from '@selectors';
import { Palette } from '@reducers/pedigree';
import { Individual, IndividualGender } from '@rootTypes/individual';
import { Cancer } from '@rootTypes/glossary';
import { IdType } from '@rootTypes/common';
import { UploadTypes } from '@rootTypes/upload';
import {
  IndividualNode, PedigreeLayout, PedigreeGraphData, RelativeEdge, PedigreeNode,
} from '@src/types/pedigree';
import { undo, redo } from '@rootCommon/images';

import PedigreePalette from './pedigree-palette';
import ControlButtons from './control-btns';
import AncestryBadge from './ancestry-badge';
import Legend from './legend';
import NodeActions from './node-actions';
import {
  recalculateLayout, addIndividual, IndividualSide, addChild, deleteRelative,
} from './data';
import {
  EDGES, EDGE_SHAPE_LINE, globalStyle, graphConfig,
} from './graph-config';
import SettingsPopup from './settings-popup';
import NodeRelationshipOverlay from './node-relationship-overlay';
import './PedigreeGraph.css';

const block = cn('PedigreeGraph');

const PALETTE_CENTER_NODE = {
  x: 300,
  y: 204,
};

const OFFSETS = {
  popup: 18,
  nodeActions: 42,
};

const DEFAULT_PEDIGREE_FILTERS = {
  Subtext: true,
  'Symbols Legend': true,
};

let graph: AntvGraph | null;

const getCancerData = (id: IdType, cancers: Cancer[] | null): Cancer | undefined => cancers?.find(
  (cancer) => cancer.id === id,
);

enum SettingsLayer {
  'settings',
}

type SettingsRelative = { id: string; edgeType: RelativeEdge; edge: IEdge };

export interface PedigreeViewFilters {
  [key: string]: boolean;
}

interface Props {
  proband: Individual;
  onNodeClick: (patient: Individual) => void;
}

const PedigreeGraph = ({ proband, onNodeClick }: Props): JSX.Element => {
  const dispatch = useAppDispatch();

  const palette: Palette = useAppSelector(getPalette);
  const pedigreeGraphData: PedigreeGraphData | null = useAppSelector(getPedigreeGraphData);
  const cancersGlossary: Cancer[] | null = useAppSelector(getCancersData);

  const [showPalette, setPaletteState] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [filters, setFilters] = useState<PedigreeViewFilters>(DEFAULT_PEDIGREE_FILTERS);

  const [relationshipOverlay, showRelationshipOverlay, hideRelationshipOverlay] = useModal();

  const [nodeActionsVisible, setNodeActionsVisible] = useState<boolean>(false);
  const [nodeActionX, setNodeActionX] = useState(0);
  const [nodeActionY, setNodeActionY] = useState(0);

  const [settingsPopupVisible, setSettingsPopupVisible] = useState<boolean>(false);
  const [settingsPopupX, setSettingsPopupX] = useState(0);
  const [settingsPopupY, setSettingsPopupY] = useState(0);
  const [settingsRelative, setSettingsRelative] = useState<SettingsRelative[]>();

  const [currentNodeModel, setCurrentNodeModel] = useState<IndividualNode>({} as IndividualNode);

  // Store array of two Point coordinates: canvas and absolute
  const [currentNodePoint, setCurrentNodePoint] = useState<Array<IPoint>>();

  const [currentNodeSex, setCurrentNodeSex] = useState<IndividualGender>();
  const [currentNodeLevel, setCurrentNodeLevel] = useState<number>();

  const ref = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const nodeActionsRef = useRef<HTMLDivElement | null>(null);

  const handleResize = () => {
    if (ref.current) {
      const { clientWidth: x, clientHeight: y } = ref.current;

      graph?.changeSize(x, y);
    }
  };

  const clearFocusNodeState = useCallback(
    (pedigreeGraph: AntvGraph | null) => {
      const focusNodes = pedigreeGraph?.findAllByState('node', 'active');

      focusNodes?.forEach((fnode) => {
        pedigreeGraph?.setItemState(fnode, 'active', false); // false
      });

      if (editMode) {
        setNodeActionsVisible(false);
      }
    }, [editMode],
  );

  const handleHover = (value: boolean) => (event: { item: Item }) => {
    const { item } = event;

    graph?.setItemState(item, 'hover', value);
  };

  const createRelativeData = (item: Item) => {
    const model = item.getModel() as IndividualNode;
    const edges: IEdge[] | undefined = item.get('edges');

    edges?.forEach((edge) => edge.toBack());
    const sourceEdges = edges?.filter((edge) => edge.getModel().target === model.id);
    const relatives: SettingsRelative[] | undefined = sourceEdges?.map((edge) => (
      { id: edge.getID(), edgeType: edge?.getModel()?.type as RelativeEdge, edge }
    ));

    if (relatives?.length) setSettingsRelative(relatives);
  };

  const handleCanvasDrag = useCallback(
    (e: any) => {
      const item = graph?.findById(currentNodeModel.id);
      const model = item?.getModel() as IndividualNode;

      if (model) {
        const { x, y } = model;

        if (x && y) {
          const point = graph?.getCanvasByPoint(x, y);
          const absPoint = graph?.getClientByPoint(x, y);

          if (point && absPoint) setCurrentNodePoint([point, absPoint]);
        }
      }
    },
    [currentNodeModel],
  );

  const handleNodeClick = useCallback(
    (event: { item: Item }) => {
      clearFocusNodeState(graph);

      const { item } = event;
      const model = item.getModel() as IndividualNode;

      graph?.setItemState(item, 'active', !item.hasState('active'));

      if (graph && editMode) {
        // Prevent click when other popup is visible
        // if (graph?.getCurrentMode() === 'edit') {
        //   return;
        // }
        graph.zoomTo(1);
        if (model.type !== 'settings') graph.focusItem(item);
        const { x, y } = model;

        if (x && y) {
          const point = graph.getCanvasByPoint(x, y);
          const absPoint = graph.getClientByPoint(x, y);

          setCurrentNodePoint([point, absPoint]);
          setCurrentNodeSex(model.sex);
          setCurrentNodeLevel(model.level);
          setCurrentNodeModel(model);
        }

        switch (model.type) {
          case 'settings':
            setNodeActionsVisible(false);
            setSettingsPopupVisible(true);
            createRelativeData(item);
            break;

          default: {
            setSettingsPopupVisible(false);
            setNodeActionsVisible(true);
            break;
          }
        }
      } else if (graph && !editMode) {
        // if (model.id === 'proband') {
        //   onNodeClick(proband);
        // } else {
        onNodeClick({ id: model.individualId } as Individual); // TEMPORARY
        // }
      }
    }, [editMode, clearFocusNodeState, onNodeClick],
  );

  const getTypeByGender = (gender: IndividualGender): string => {
    switch (gender) {
      case IndividualGender.MALE:
        return 'pie-node-male';

      case IndividualGender.FEMALE:
        return 'pie-node-female';

      default:
        return 'pie-node-unknown';
    }
  };

  const updateGraphItems = (layoutArray: PedigreeLayout[]): void => {
    layoutArray.forEach((node) => {
      const { id, x, y } = node;

      graph?.updateItem(id, { x, y });
    });
  };

  const createPaletteRelatives = () => {
    // Update layout
    console.log(palette);

    Object.entries(palette).forEach(([key, value]) => {
      for (let i = 0; i < value; i += 1) {
        let name = '';
        let sex: IndividualGender = IndividualGender.UNKNOWN;
        let source = '';

        switch (key) {
          case 'brother':
            name = 'brother';
            sex = IndividualGender.MALE;
            source = 'parents';
            break;

          case 'sister':
            name = 'sister';
            sex = IndividualGender.FEMALE;
            source = 'parents';
            break;

          case 'son':
            name = 'son';
            sex = IndividualGender.MALE;
            source = 'spouse';
            break;

          case 'daughter':
            name = 'daughter';
            sex = IndividualGender.FEMALE;
            source = 'spouse';
            break;

          case 'unknownChild':
            name = 'unknownChild';
            sex = IndividualGender.UNKNOWN;
            source = 'spouse';
            break;

          case 'maleSpouse':
            name = 'maleSpouse';
            sex = IndividualGender.MALE;
            break;

          case 'femaleSpouse':
            name = 'femaleSpouse';
            sex = IndividualGender.FEMALE;
            break;

          default:
            break;
        }

        if (name) {
          const {
            id, x, y, parents, spouse, level,
          } = currentNodeModel;
          const idName = `${id}'s ${name} #${nanoid(2)}`;
          const settingsName = `settings-${idName}`;

          if (key === 'maleSpouse' || key === 'femaleSpouse') {
            const [newLevel] = addIndividual(currentNodeModel, idName, settingsName);

            if (newLevel) {
              // add spouse to current node
              currentNodeModel.spouse = settingsName;

              // add settings node between spouses
              graph?.addItem('node', {
                id: settingsName,
                type: 'settings',
                x: x ? x + 100 : undefined,
                y,
              });

              // add spouse node
              graph?.addItem('node', {
                id: idName,
                label: `${id}'s ${name}`,
                type: getTypeByGender(sex),
                sex,
                x: x ? x + 200 : undefined,
                y,
                spouse: settingsName,
                level,
              });

              // add links to setting from node
              graph?.addItem('edge', {
                source: id,
                target: settingsName,
                sourceAnchor: 1,
                targetAnchor: 3,
                type: RelativeEdge.NORMAL,
              });

              // add links to setting from spouse
              graph?.addItem('edge', {
                source: idName,
                target: settingsName,
                sourceAnchor: 1,
                targetAnchor: 3,
                type: RelativeEdge.NORMAL,
              });

              const newLayout = recalculateLayout(newLevel, idName, IndividualSide.right);

              updateGraphItems(newLayout);
            }
          } else if (key === 'brother' || key === 'sister') {
            if (parents) {
              const marriageNode = graph?.findById(parents);
              const potentialSiblings = (marriageNode?.getModel() as IndividualNode).jointChildren || [];
              const [newLevel, side] = addIndividual(currentNodeModel, idName);

              if (newLevel && side && marriageNode) {
                graph?.updateItem(marriageNode, { jointChildren: [...potentialSiblings, idName] });

                graph?.addItem('node', {
                  id: idName,
                  label: `${id}'s ${name}`,
                  type: getTypeByGender(sex),
                  sex,
                  x: x ? x + 160 : undefined,
                  y,
                  parents,
                  level,
                });

                graph?.addItem('edge', {
                  source: source === 'parents' ? parents : spouse || 'father-mother-settings',
                  target: idName,
                  type: RelativeEdge.POLYLINE,
                  sourceAnchor: 2,
                  targetAnchor: 0,
                });

                const newLayout = recalculateLayout(newLevel, id, side);

                updateGraphItems(newLayout);
              }
            }
          } else if (key === 'son' || key === 'daughter' || key === 'unknownChild') {
            if (spouse) {
              const marriageNode = graph?.findById(spouse);
              const potentialSiblings = (marriageNode?.getModel() as IndividualNode).jointChildren || [];
              const newLevel = addChild(currentNodeModel, idName, potentialSiblings);

              if (newLevel && marriageNode) {
                graph?.updateItem(marriageNode, { jointChildren: [...potentialSiblings, idName] });

                graph?.addItem('node', {
                  id: idName,
                  label: `${id}'s ${name}`,
                  type: getTypeByGender(sex),
                  sex,
                  // x: x + 160,
                  // y,
                  parents,
                  level: level + 1,
                });

                graph?.addItem('edge', {
                  source: source === 'parents' ? parents : spouse || 'father-mother-settings',
                  target: idName,
                  type: RelativeEdge.POLYLINE,
                  sourceAnchor: 0,
                  targetAnchor: 0,
                });

                const newLayout = recalculateLayout(newLevel, id, IndividualSide.right);

                updateGraphItems(newLayout);
              }
            }
          }
        }
      }
    });
  };

  const submitPalette = () => {
    // Create all relatives from store.pedigree.palette
    createPaletteRelatives();
    // Clear store.pedigree.palette
    dispatch(clearPalette());
    setPaletteState(!showPalette);
  };

  const hidePalette = () => {
    setPaletteState(false);
  };

  const handleFilterChange = (viewFilters: PedigreeViewFilters) => {
    setFilters(viewFilters);
  };

  const handleFitPress = () => {
    graph?.fitCenter();
  };

  const changeSettingsNodeVisibility = (visible?: boolean) => {
    const nodes = graph?.findAll('node', (node) => {
      const modelType = typeof node.getModel().type === 'string' ? (node.getModel().type as string) : '';

      return Object.values(SettingsLayer).includes(modelType);
    });

    nodes?.forEach((node) => {
      node.changeVisibility(visible ?? !node.isVisible());
    });
  };

  const handleEditChange = () => {
    changeSettingsNodeVisibility();
    setEditMode(!editMode);
  };

  const handleDiscardBtn = () => {
    changeSettingsNodeVisibility(false);
    setNodeActionsVisible(false);
    setEditMode(false);
  };

  const deleteNode = (nodeId?: string) => {
    if (!graph) return;

    // const node = graph.findById(nodeId);
    // const nodeModel = node.getModel();
    const { id, spouse, parents } = nodeId
      ? graph
        .findById(nodeId)
        .getModel() as PedigreeNode
      : currentNodeModel as PedigreeNode;

    // Check if the node is independent
    if (!spouse) {
      // dispatch(deleteChosenNode);
      graph.removeItem(id);
      // delete from layout
      deleteRelative([id]);
    } else if (spouse && !parents) {
      // Node is a spouse but hasn't parents

      // find second spouse
      const spouses = graph.findAll('node', (node) => {
        const { spouse: nodeSpouse, parents } = node.getModel();

        return (nodeSpouse === spouse && !parents);
      }).map((spouse) => spouse.getID());

      // remove node itself
      graph.removeItem(id);
      deleteRelative([id]);

      const spouseNode = graph.findById(spouse);
      const spouseModel = spouseNode.getModel();
      const children = spouseModel.jointChildren;

      // remove spouse settings node
      graph?.removeItem(spouse);
      deleteRelative([spouse]);

      // remove connected spouses
      spouses.forEach((spouse) => {
        graph?.removeItem(spouse);
        deleteRelative([spouse]);
      });

      // remove children
      if (Array.isArray(children)) {
        children.forEach((child) => deleteNode(child));
        deleteRelative(children);
      }
    }

    setNodeActionsVisible(false);
  };

  const addRelative = () => {
    if (relationshipOverlay) { hideRelationshipOverlay(); }
    if (currentNodeLevel) dispatch(setChosenNode({ level: currentNodeLevel }));
    setNodeActionsVisible(false);
    setPaletteState(true);
  };

  const handleMakeSnapshot = () => {
    /**
     * Make a File object from base64 string
     * @param url base64 string
     * @returns promise with js File object
     */
    const getFileFromUrl = async (url: string) => {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();

      return new File([buf], 'pedigree.png', { type: 'image/png' });
    };

    const makeSnapshot = async (url: string) => {
      const file = await getFileFromUrl(url);

      try {
        await uploadService.uploadFile(UploadTypes.PEDIGREE, file);

        await Message.success(
          'All Snapshots can be viewed or downloaded in Activity Stream',
          undefined,
          'Snapshot successfully created!',
        );
      } catch (error) {
        console.log(error);
      }
    };

    graph?.toFullDataURL(makeSnapshot, 'image/png', { backgroundColor: 'white', padding: 20 });
  };

  const highlightEdges = (value: RelativeEdge, edge: IEdge): void => {
    const type = value.toUpperCase() as keyof typeof EDGES;

    if (value === EDGES[type].name) {
      const group = edge.getContainer();
      const shape = group?.find((i: IShape) => i.get('name') === EDGES[type].shapeName);
      shape?.attr('stroke', globalStyle.stroke.active);
    }
  };

  const clearHighlightEdges = (edge: IEdge): void => {
    const group = edge.getContainer();

    const shapes = group.findAll(
      (el: IShape) => String(el.get('name')).includes(EDGE_SHAPE_LINE.base)
      && !String(el.get('name')).includes(EDGE_SHAPE_LINE.additional),
    );

    for (let index = 0; index < shapes.length; index += 1) {
      shapes[index]?.attr('stroke', globalStyle.stroke.common);
    }
  };

  const changeRelativeEdge = (value: RelativeEdge): void => {
    settingsRelative?.forEach((rel) => {
      rel.edge?.setState('active', true);
      rel.edge?.update({ type: value } as ModelConfig);

      highlightEdges(value, rel.edge);
    });
  };

  const changeRelativeState = (states: { name: string; value: boolean }[]): void => {
    settingsRelative?.forEach((rel) => states.forEach((state) => {
      rel.edge?.setState('changed', true);
      rel.edge?.setState(state.name, state.value);
    }));
  };

  const closeSettingsPopup = (): void => {
    settingsRelative?.forEach((rel) => {
      rel.edge?.setState('changed', false);

      clearHighlightEdges(rel.edge);
    });

    setSettingsPopupVisible(false);
    setSettingsRelative(undefined);
  };

  const changeVisibleSubtextLegend = (viewFilters: PedigreeViewFilters): void => {
    Object.keys(viewFilters).forEach(() => {
      const isSubtextLegendVisible = viewFilters.Subtext;
      const groups = graph?.getGroup();
      const cancersListGroup = groups?.findAll((i: INode) => i.get<string>('name') === 'cancer-list-group');
      cancersListGroup?.forEach((label) => { (isSubtextLegendVisible ? label.show() : label.hide()); });
    });
  };

  const handleClickRelationshipOverlay = (): void => {
    if (relationshipOverlay) {
      hideRelationshipOverlay();
    } else {
      showRelationshipOverlay();
    }
  };

  const paintGraph = (pedigreeGraphData: PedigreeGraphData) => {
    graph?.destroy();
    const container = ref.current;

    if (container) {
      const { clientHeight: height, clientWidth: width } = container;

      graph = new G6.Graph({
        container,
        width, // Number, required, the width of the graph
        height, // Number, required, the height of the graph
        ...graphConfig,
      });

      graph?.changeData((pedigreeGraphData));
      graph?.refresh();
      graph?.fitCenter();
    }
  };

  const makeColored = useCallback((pedigreeGraphData: PedigreeGraphData) => {
    const newColoredNodes = pedigreeGraphData.nodes.map((node) => {
      const newNode = node;
      newNode.cancerHistory?.forEach((cancer, index) => {
        if (newNode.cancerHistory && newNode.cancerHistory[index]) {
          newNode.cancerHistory[index].color = getCancerData(cancer.cancerId, cancersGlossary)?.color;
          newNode.cancerHistory[index].name = getCancerData(cancer.cancerId, cancersGlossary)?.name;
        }
      });

      return newNode;
    });
    return { ...pedigreeGraphData, nodes: newColoredNodes };
  }, [cancersGlossary]);

  useEffect(() => {
    dispatch(getPedigreeOverlayDemographics.request(proband.id));
    dispatch(getPedigreeOverlayCancerHistory.request(proband.id));
    dispatch(getPedigreeAttributes.request(proband.id));
  }, [dispatch, proband.id]);

  useEffect(() => {
    dispatch(fetchPedigreeGraphData.request());
  }, [dispatch]);

  useEffect(() => {
    if (pedigreeGraphData) paintGraph(makeColored(pedigreeGraphData));
  }, [pedigreeGraphData, makeColored]);

  useEffect(() => {
    // add touch
    graph?.off(G6Event.NODE_TOUCHEND);
    graph?.on(G6Event.NODE_TOUCHEND, handleNodeClick);

    graph?.off(G6Event.NODE_CLICK);
    graph?.on(G6Event.NODE_CLICK, handleNodeClick);
    graph?.on(G6Event.NODE_MOUSEENTER, handleHover(true));
    graph?.on(G6Event.NODE_MOUSELEAVE, handleHover(false));
    graph?.on(G6Event.CANVAS_CLICK, () => clearFocusNodeState(graph));

    if (editMode) {
      graph?.on(G6Event.CANVAS_DRAG, handleCanvasDrag);
    } else {
      graph?.off(G6Event.CANVAS_DRAG, handleCanvasDrag);
    }
  }, [editMode, pedigreeGraphData, clearFocusNodeState, handleNodeClick, handleCanvasDrag]);

  useEffect(() => {
    if (settingsPopupVisible) {
      graph?.setMode('settings');
    } else if (nodeActionsVisible) {
      graph?.setMode('edit');
    } else {
      graph?.setMode('default');
    }
    // graph?.setMode(settingsPopupVisible || nodeActionsVisible ? 'edit' : 'default');
  }, [settingsPopupVisible, nodeActionsVisible]);

  useEffect(() => {
    const point = currentNodePoint;

    if (settingsPopupVisible && point && popupRef.current) {
      setSettingsPopupX(point[0].x - popupRef.current.offsetWidth / 2);
      setSettingsPopupY(point[0].y - popupRef.current.offsetHeight + OFFSETS.popup);
    }
  }, [settingsPopupVisible, currentNodePoint]);

  useEffect(() => {
    const point = currentNodePoint;

    if (nodeActionsVisible && point && nodeActionsRef.current) {
      setNodeActionX(point[0].x - nodeActionsRef.current.offsetWidth / 2);
      setNodeActionY(point[0].y - nodeActionsRef.current.offsetHeight - OFFSETS.nodeActions);
    }
  }, [nodeActionsVisible, currentNodePoint]);

  useEffect(() => {
    changeVisibleSubtextLegend(filters);
  }, [filters]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getCancerIds = (pedigreeGraphData: PedigreeGraphData | null) => {
    const res = pedigreeGraphData?.nodes.map((node) => (
      node.cancerHistory?.map((cancer) => cancer.cancerId)
    )?.flat()).flat().filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

    return res as number[];
  };

  return (
    <div className={block()} ref={ref}>
      {settingsPopupVisible && (
        <SettingsPopup
          position={{ x: settingsPopupX, y: settingsPopupY }}
          handleClose={closeSettingsPopup}
          innerRef={popupRef}
          valueRelative={settingsRelative?.[0].edgeType}
          stateRelative={settingsRelative?.[0].edge.getStates() as RelativeEdge[]}
          onChangeRelative={changeRelativeEdge}
          onChangeState={changeRelativeState}
        />
      )}
      {nodeActionsVisible && (
        <NodeActions
          {...{ handleClickRelationshipOverlay }}
          position={{ x: nodeActionX, y: nodeActionY }}
          handleDelete={deleteNode}
          handleAddRelative={addRelative}
          innerRef={nodeActionsRef}
        />
      )}
      {relationshipOverlay && <NodeRelationshipOverlay onClose={hideRelationshipOverlay} />}
      <div className={block('AncestryBadge')}>
        <AncestryBadge patient={proband} />
      </div>
      {!editMode && (
        <div className={block('Legend')}>
          {filters['Symbols Legend'] && <Legend cancerIds={getCancerIds(pedigreeGraphData)} />}
        </div>
      )}
      <div className={block('ControlButtons')}>
        <ControlButtons
          filters={filters}
          onFilterChange={handleFilterChange}
          onFitPress={handleFitPress}
          onEditChange={handleEditChange}
          onMakeSnapshot={handleMakeSnapshot}
        />
      </div>
      <Modal
        className={block('Palette')}
        visible={showPalette}
        cancelText="CANCEL"
        okText="SUBMIT"
        okButtonProps={{
          className: block('PaletteBtn', ['btn', 'btn-fill', 'btn-fill-green']),
        }}
        cancelButtonProps={{
          className: block('PaletteBtn', { type: 'cancel' }, ['btn', 'btn-outline', 'btn-outline-green']),
        }}
        onOk={submitPalette}
        onCancel={hidePalette}
        width={600}
        bodyStyle={{ marginBottom: '20px' }}
        style={
          currentNodePoint && {
            left: currentNodePoint[1].x - PALETTE_CENTER_NODE.x,
            top: currentNodePoint[1].y - PALETTE_CENTER_NODE.y,
          }
        }
      >
        <PedigreePalette nodeSex={currentNodeSex} />
      </Modal>
      <Drawer
        mask={false}
        placement="bottom"
        closable={false}
        visible={editMode}
        getContainer={false}
        style={{ position: 'absolute' }}
        height={70}
      >
        <div className="flex align-items-center justify-content-between w-100">
          <div className="flex align-items-center">
            <Button className="btn btn-link mr-1" onClick={handleDiscardBtn}>
              Discard
            </Button>
            <Button className="btn btn-outline btn-outline-green btn-undo btn-small mr-1">
              <img src={undo} alt="" />
              Undo
            </Button>
            <Button className="btn btn-outline btn-outline-green btn-redo btn-small">
              Redo
              <img src={redo} alt="" />
            </Button>
          </div>
          <Button className="btn btn-fill btn-fill-green btn-small">Save</Button>
        </div>
      </Drawer>
    </div>
  );
};

export default PedigreeGraph;
