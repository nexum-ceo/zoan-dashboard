import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from '@xyflow/react';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface LocalNode {
  id: string;
  workflow_id: string;
  name: string;
  type: string;
  config: object;
  position: { x: number; y: number };
}

export interface LocalEdge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  type: string;
  isNew?: boolean;
}

export function usePersistWorkflow({
  nodes,
  edges,
  localNodes,
  localEdges,
  loadedFromIdb,
  idbNodesKey,
  idbEdgesKey,
  idbDraftNodesKey,
  idbDraftEdgesKey,
}: {
  nodes: Node[];
  edges: Edge[];
  localNodes: LocalNode[];
  localEdges: LocalEdge[];
  loadedFromIdb: boolean;
  idbNodesKey: string;
  idbEdgesKey: string;
  idbDraftNodesKey: string;
  idbDraftEdgesKey: string;
}) {
  const [hasLocalChange, setHasLocalChange] = useState(false);
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
}

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
}: {
  idbNodesKey: string;
  idbEdgesKey: string;
  idbDraftNodesKey: string;
  idbDraftEdgesKey: string;
  workflowId: string;
  fetchWorkflowProcess: () => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setLocalNodes: React.Dispatch<React.SetStateAction<LocalNode[]>>;
  setLocalEdges: React.Dispatch<React.SetStateAction<LocalEdge[]>>;
  setLoadedFromIdb: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setLocalNodes: React.Dispatch<React.SetStateAction<LocalNode[]>>;
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
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
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
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setLocalEdges: React.Dispatch<React.SetStateAction<LocalEdge[]>>;
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
