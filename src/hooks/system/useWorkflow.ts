import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from '@xyflow/react';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type LocalNode = {
  id: string;
  workflow_id: string;
  name: string;
  type: string;
  config: object;
  position: { x: number; y: number };
};

export type LocalEdge = {
  id: string;
  from_node_id: string;
  to_node_id: string;
  type: string;
  isNew?: boolean;
};

type UsePersistWorkflowProps = {
  nodes: Node[];
  edges: Edge[];
  localNodes: LocalNode[];
  localEdges: LocalEdge[];
  loadedFromIdb: boolean;
  idbNodesKey: string;
  idbEdgesKey: string;
  idbDraftNodesKey: string;
  idbDraftEdgesKey: string;
};

export const usePersistWorkflow: FC<UsePersistWorkflowProps> = ({
  nodes,
  edges,
  localNodes,
  localEdges,
  loadedFromIdb,
  idbNodesKey,
  idbEdgesKey,
  idbDraftNodesKey,
  idbDraftEdgesKey,
}) => {
  const [hasLocalChange, setHasLocalChange] = useState<boolean>(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    setHasLocalChange(localNodes.length > 0 || localEdges.length > 0);
    if (loadedFromIdb || (!loadedFromIdb && nodes.length > 0)) {
      idbSet(idbNodesKey, nodes);
      idbSet(idbEdgesKey, edges);
    }
    if (localNodes.length > 0) {
      idbSet(idbDraftNodesKey, localNodes);
    }
    if (localEdges.length > 0) {
      idbSet(idbDraftEdgesKey, localEdges);
    }
  }, [
    nodes,
    edges,
    localNodes,
    localEdges,
    loadedFromIdb,
    idbNodesKey,
    idbEdgesKey,
    idbDraftNodesKey,
    idbDraftEdgesKey,
  ]);

  return hasLocalChange;
};

type UseRestoreWorkflowProps = {
  idbNodesKey: string;
  idbEdgesKey: string;
  idbDraftNodesKey: string;
  idbDraftEdgesKey: string;
  workflowId: string;
  fetchWorkflowProcess: () => void;
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setLocalNodes: Dispatch<SetStateAction<LocalNode[]>>;
  setLocalEdges: Dispatch<SetStateAction<LocalEdge[]>>;
  setLoadedFromIdb: Dispatch<SetStateAction<boolean>>;
};

export function useRestoreWorkflow({
  idbNodesKey,
  idbEdgesKey,
  idbDraftNodesKey,
  idbDraftEdgesKey,
  workflowId,
  fetchWorkflowProcess,
  setNodes,
  setEdges,
  setLocalNodes,
  setLocalEdges,
  setLoadedFromIdb,
}: UseRestoreWorkflowProps) {
  useEffect(() => {
    (async () => {
      const [idbNodes, idbEdges, idbDraftNodes, idbDraftEdges] =
        await Promise.all([
          idbGet(idbNodesKey),
          idbGet(idbEdgesKey),
          idbGet(idbDraftNodesKey),
          idbGet(idbDraftEdgesKey),
        ]);
      let loaded = false;
      if (
        Array.isArray(idbNodes) &&
        idbNodes.length > 0 &&
        Array.isArray(idbEdges)
      ) {
        setNodes(idbNodes);
        setEdges(idbEdges);
        loaded = true;
      } else {
        setNodes([]);
        setEdges([]);
      }
      setLocalNodes(Array.isArray(idbDraftNodes) ? idbDraftNodes : []);
      setLocalEdges(Array.isArray(idbDraftEdges) ? idbDraftEdges : []);
      setLoadedFromIdb(loaded);
      if (!loaded) {
        fetchWorkflowProcess();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    workflowId,
    idbNodesKey,
    idbEdgesKey,
    idbDraftNodesKey,
    idbDraftEdgesKey,
  ]);
}

export function useNodeHandlers({
  setNodes,
  setLocalNodes,
}: {
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setLocalNodes: Dispatch<SetStateAction<LocalNode[]>>;
}) {
  return useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setLocalNodes((prev) => {
        const updated = [...prev];
        changes.forEach((change: NodeChange) => {
          if (change.type === 'position' && change.id) {
            const idx = updated.findIndex((n) => n.id === change.id);
            if (idx !== -1 && change.position) {
              updated[idx] = { ...updated[idx], position: change.position };
            }
          }
        });
        return updated;
      });
    },
    [setNodes, setLocalNodes],
  );
}

export function useEdgeHandlers({
  setEdges,
}: {
  setEdges: Dispatch<SetStateAction<Edge[]>>;
}) {
  return useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
}

export function useConnectHandler({
  setEdges,
  setLocalEdges,
  idbDraftEdgesKey,
}: {
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setLocalEdges: Dispatch<SetStateAction<LocalEdge[]>>;
  idbDraftEdgesKey: string;
}) {
  return useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setLocalEdges((prev) => {
        const exists = prev.some(
          (edge) =>
            edge.from_node_id === params.source &&
            edge.to_node_id === params.target,
        );
        if (exists) return prev;
        const next = [
          ...prev,
          {
            id: uuidv4(),
            from_node_id: params.source,
            to_node_id: params.target,
            type: 'default',
            isNew: true,
          },
        ];
        idbSet(idbDraftEdgesKey, next);
        return next;
      });
    },
    [setEdges, setLocalEdges, idbDraftEdgesKey],
  );
}
