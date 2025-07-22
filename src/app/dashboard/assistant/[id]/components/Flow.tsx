// --- REFACTORED FLOW COMPONENT ---
import BaseHandleCustom from '@/components/base-handle-custom';
import { WorkflowHeader } from '@/components/workflow/workflow-header';
import { WorkflowLeftSideBar } from '@/components/workflow/workflow-left-sidebar';
import { WorkflowRightSideBar } from '@/components/workflow/workflow-right-sidebar';
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from '@xyflow/react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface FlowProps {
  onClose?: () => void;
  workflowId: string;
  workflowName?: string;
}

interface LocalEdge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  type: string;
  isNew?: boolean;
}

interface LocalNode {
  id: string;
  workflow_id: string;
  name: string;
  type: string;
  config: object;
  position: { x: number; y: number };
}

export default function Flow({ onClose, workflowId, workflowName }: FlowProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [localNodes, setLocalNodes] = useState<LocalNode[]>([]);
  const [localEdges, setLocalEdges] = useState<LocalEdge[]>([]);
  const [hasLocalChange, setHasLocalChange] = useState<boolean>(false);

  useEffect(() => {
    setHasLocalChange(localNodes.length > 0 || localEdges.length > 0);
  }, [localNodes, localEdges]);

  useEffect(() => {
    fetchWorkflowProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // --- API FETCH ---
  const fetchWorkflowProcess = async (): Promise<void> => {
    if (!workflowId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflow-process/${workflowId}`);
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.nodes)) {
        setNodes(
          data.nodes.map(
            (n: any): Node => ({
              id: n.id,
              position: n.position || { x: 0, y: 0 },
              data: { label: n.name, ...n },
              type: 'baseHandleCustom',
            }),
          ),
        );
        setEdges(
          Array.isArray(data.connections)
            ? data.connections.map(
                (c: any): Edge => ({
                  id: c.id,
                  source: c.from_node_id,
                  target: c.to_node_id,
                  type: 'default',
                }),
              )
            : [],
        );
        setLocalEdges(
          (data.connections || []).map(
            (c: any): LocalEdge => ({
              id: c.id,
              from_node_id: c.from_node_id,
              to_node_id: c.to_node_id,
              type: c.type || 'default',
            }),
          ),
        );
        setHasLocalChange(false);
      } else {
        setNodes([]);
        setEdges([]);
        setLocalEdges([]);
        setHasLocalChange(false);
      }
    } catch {
      setError('Error fetching workflow-process');
      setNodes([]);
      setEdges([]);
      setLocalEdges([]);
      setHasLocalChange(false);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const onNodesChange = useCallback((changes: NodeChange[]) => {
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
  }, []);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
    setLocalEdges((prev) => {
      const exists = prev.some(
        (edge) =>
          edge.from_node_id === params.source &&
          edge.to_node_id === params.target,
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          id: uuidv4(),
          from_node_id: params.source,
          to_node_id: params.target,
          type: 'default',
          isNew: true,
        },
      ];
    });
  }, []);

  const addNewNode = () => {
    let nodeId = uuidv4();
    while ([...localNodes, ...nodes].some((n) => n.id === nodeId)) {
      nodeId = uuidv4();
    }
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
    setLocalNodes((prev) => [...prev, newNodeBE]);
    setNodes((prev) => [...prev, newNodeRF]);
    setHasLocalChange(true);
  };

  const handleSaveChanges = async () => {
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
          return;
        }
        const res = await fetch('/api/workflow-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connections: newConnections, triggers: [] }),
        });
        if (res.ok) {
          toast.success('Successfully saved new connections!');
          setHasLocalChange(false);
          setLocalEdges([]);
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
        setHasLocalChange(false);
        setLocalNodes([]);
        setLocalEdges([]);
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
