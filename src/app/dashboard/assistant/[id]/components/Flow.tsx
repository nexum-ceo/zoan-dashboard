import BaseHandleCustom from '@/components/base-handle-custom';
import { WorkflowHeader } from '@/components/workflow/workflow-header';
import { WorkflowLeftSideBar } from '@/components/workflow/workflow-left-sidebar';
import { WorkflowRightSideBar } from '@/components/workflow/workflow-right-sidebar';
import type { WorkflowConnection, WorkflowNode } from '@/types/workflow';
import type { Edge, Node } from '@xyflow/react';
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { del as idbDel, set as idbSet } from 'idb-keyval';
import { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  LocalEdge,
  LocalNode,
  useConnectHandler,
  useEdgeHandlers,
  useNodeHandlers,
  usePersistWorkflow,
  useRestoreWorkflow,
} from '../../../../../hooks/useWorkflow';

interface FlowProps {
  onClose?: () => void;
  workflowId: string;
  workflowName?: string;
}

export default function Flow({ onClose, workflowId, workflowName }: FlowProps) {
  // IndexedDB keys (move inside function)
  const idbNodesKey = `flow_fullNodes_${workflowId}`;
  const idbEdgesKey = `flow_fullEdges_${workflowId}`;
  const idbDraftNodesKey = `flow_draftNodes_${workflowId}`;
  const idbDraftEdgesKey = `flow_draftEdges_${workflowId}`;

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [localNodes, setLocalNodes] = useState<LocalNode[]>([]);
  const [localEdges, setLocalEdges] = useState<LocalEdge[]>([]);
  const [loadedFromIdb, setLoadedFromIdb] = useState<boolean>(false);

  const fetchWorkflowProcess = async (): Promise<void> => {
    if (!workflowId) return;
    // If already loaded from idb, skip fetch
    if (loadedFromIdb) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflow-process/${workflowId}`);
      const data: {
        nodes: WorkflowNode[];
        connections: WorkflowConnection[];
      } = await res.json();
      if (res.ok && data && Array.isArray(data.nodes)) {
        const nodesRF = data.nodes.map(
          (n): Node => ({
            id: n.id,
            position: n.position || { x: 0, y: 0 },
            data: { label: n.name, ...n },
            type: 'baseHandleCustom',
          }),
        );
        const edgesRF = Array.isArray(data.connections)
          ? data.connections.map(
              (c): Edge => ({
                id: c.id,
                source: c.from_node_id,
                target: c.to_node_id,
                type: c.type || 'default',
              }),
            )
          : [];
        setNodes(nodesRF);
        setEdges(edgesRF);
        setLocalEdges(
          (data.connections || []).map(
            (c): LocalEdge => ({
              id: c.id,
              from_node_id: c.from_node_id,
              to_node_id: c.to_node_id,
              type: c.type || 'default',
            }),
          ),
        );
        // Save to idb for next time
        if (!loadedFromIdb) {
          idbSet(idbNodesKey, nodesRF);
          idbSet(idbEdgesKey, edgesRF);
        }
      } else {
        setNodes([]);
        setEdges([]);
        setLocalEdges([]);
        if (!loadedFromIdb) {
          idbSet(idbNodesKey, []);
          idbSet(idbEdgesKey, []);
        }
      }
    } catch {
      setError('Error fetching workflow-process');
      setNodes([]);
      setEdges([]);
      setLocalEdges([]);
      if (!loadedFromIdb) {
        idbSet(idbNodesKey, []);
        idbSet(idbEdgesKey, []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Custom hook: persist workflow and draft state
  const hasLocalChange = usePersistWorkflow({
    nodes,
    edges,
    localNodes,
    localEdges,
    loadedFromIdb,
    idbNodesKey,
    idbEdgesKey,
    idbDraftNodesKey,
    idbDraftEdgesKey,
  });

  // Custom hook: restore workflow and draft state from IndexedDB
  useRestoreWorkflow({
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
  });

  // Custom hooks: handlers
  const onNodesChange = useNodeHandlers({ setNodes, setLocalNodes });
  const onEdgesChange = useEdgeHandlers({ setEdges });
  const onConnect = useConnectHandler({
    setEdges,
    setLocalEdges,
    idbDraftEdgesKey,
  });

  const addNewNode = () => {
    const nodeId = uuidv4();
    const nodeName = `Node ${nodeId.slice(0, 4)}`;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offset = 100 + Math.random() * 100;
    const newNodeBE: LocalNode = {
      id: nodeId,
      workflow_id: workflowId,
      name: nodeName,
      type: 'text_and_image',
      config: {},
      position: { x: centerX + offset, y: centerY },
    };
    const newNodeRF: Node = {
      id: nodeId,
      position: { x: centerX + offset, y: centerY },
      data: { label: nodeName, ...newNodeBE },
      type: 'baseHandleCustom',
    };
    // Add draftNodes into dbDraftNodes
    setLocalNodes((prev) => {
      const next = [...prev, newNodeBE];
      idbSet(idbDraftNodesKey, next);
      return next;
    });
    // Add full nodes into dbNodes
    setNodes((prev) => {
      const next = [...prev, newNodeRF];
      idbSet(idbNodesKey, next);
      return next;
    });
  };

  const handleSaveChanges = async () => {
    // Clear IDB before/after successful save
    setLoading(true);
    try {
      // Save only new connections if no new nodes
      if (localNodes.length === 0 && localEdges.length > 0) {
        const newConnections = localEdges
          .filter((c) => c.isNew)
          .map((c) => ({
            id: uuidv4(),
            from_node_id: c.from_node_id,
            to_node_id: c.to_node_id,
            condition: {},
            created_at: '0001-01-01T00:00:00Z',
            updated_at: '0001-01-01T00:00:00Z',
          }));
        if (newConnections.length === 0) {
          toast.info('No new connections to save.');
          setLoading(false);
          await idbDel(idbDraftEdgesKey);
          await idbDel(idbDraftNodesKey);
          return;
        }
        const res = await fetch('/api/workflow-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connections: newConnections, triggers: [] }),
        });
        if (res.ok) {
          toast.success('Successfully saved new connections!');
          setLocalEdges([]);
          await idbDel(idbDraftEdgesKey);
          await idbDel(idbDraftNodesKey);
          fetchWorkflowProcess();
        } else {
          toast.error('Failed to save new connections!');
        }
        setLoading(false);
        return;
      }
      // Save new nodes and new connections
      if (localNodes.length === 0) {
        toast.info('No new nodes or connections to save.');
        setLoading(false);
        await idbDel(idbDraftEdgesKey);
        await idbDel(idbDraftNodesKey);
        return;
      }
      const newConnections = localEdges
        .filter((c) => c.isNew)
        .map((c) => ({
          workflow_id: workflowId,
          from_node_id: c.from_node_id,
          to_node_id: c.to_node_id,
          condition: {},
        }));
      const res = await fetch('/api/workflow-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: localNodes,
          connections: newConnections,
          triggers: [],
        }),
      });
      if (res.ok) {
        toast.success('Successfully saved new nodes!');
        setLocalNodes([]);
        setLocalEdges([]);
        await idbDel(idbDraftEdgesKey);
        await idbDel(idbDraftNodesKey);
        fetchWorkflowProcess();
      } else {
        toast.error('Failed to save new nodes!');
      }
    } catch {
      toast.error('Failed to save new nodes!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkflowHeader
        name={workflowName || 'Workflow'}
        onClose={onClose}
        onSave={hasLocalChange ? handleSaveChanges : undefined}
        saving={loading}
      />
      <WorkflowLeftSideBar onAddNode={addNewNode} />
      {loading ? (
        <div className="flex items-center justify-center h-full text-lg">
          Loading workflow...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full text-red-500 text-lg">
          {error}
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={{
            baseHandleCustom: (props) => <BaseHandleCustom {...props} />,
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          onEdgeClick={(_event, edge) =>
            setEdges((eds) => eds.filter((e) => e.id !== edge.id))
          }
          onNodeClick={(_event, node) => setSelectedNode(node)}
        >
          <Background />
          <Controls style={{ color: 'black' }} position="center-right" />
          <MiniMap />
        </ReactFlow>
      )}
      {selectedNode && (
        <WorkflowRightSideBar
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          selectedNode={selectedNode}
        />
      )}
    </div>
  );
}
