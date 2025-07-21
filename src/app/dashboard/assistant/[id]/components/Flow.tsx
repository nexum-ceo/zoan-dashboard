'use client';
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
  NodeTypes,
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

export default function Flow({ onClose, workflowId, workflowName }: FlowProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track local changes for save
  const [localNodes, setLocalNodes] = useState<any[]>([]);
  const [localEdges, setLocalEdges] = useState<any[]>([]);
  const [hasLocalChange, setHasLocalChange] = useState(false);
  // Fetch workflow-process data from API
  // Move fetchWorkflowProcess to the top level so it can be reused
  const fetchWorkflowProcess = async () => {
    if (!workflowId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflow-process/${workflowId}`);
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.nodes)) {
        // Map node BE into node ReactFlow for UI
        const apiNodes = data.nodes.map((n: any) => ({
          id: n.id,
          position: n.position || { x: 0, y: 0 },
          data: {
            label: n.name,
            ...n,
          },
          type: 'baseHandleCustom',
        }));
        const apiEdges = Array.isArray(data.connections)
          ? data.connections.map((c: any) => ({
              id: c.id,
              source: c.from_node_id,
              target: c.to_node_id,
              type: 'default',
            }))
          : [];
        setNodes(apiNodes);
        setEdges(apiEdges);
        setLocalEdges(data.connections || []);
        setHasLocalChange(false);
      } else {
        setNodes([]);
        setEdges([]);
        setLocalEdges([]);
        setHasLocalChange(false);
      }
    } catch (err: any) {
      setError('Error fetching workflow-process');
      setNodes([]);
      setEdges([]);
      setLocalEdges([]);
      setHasLocalChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // When nodes are moved/changed in UI, update both nodes (UI) and localNodes (for BE)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    // Sync position in localNodes for new nodes
    setLocalNodes((prev) => {
      let updated = [...prev];
      changes.forEach((change) => {
        if (change.type === 'position' && change.id) {
          const idx = updated.findIndex((n) => n.id === change.id);
          if (idx !== -1 && change.position) {
            updated[idx] = {
              ...updated[idx],
              position: change.position,
            };
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
  // When a new connection is made, add to edges (UI) and localEdges (for saving if both nodes are new)
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      // Only track connection if both source and target are new nodes (in localNodes)
      setLocalEdges((prev) => {
        const isSourceNew = localNodes.some((n) => n.id === params.source);
        const isTargetNew = localNodes.some((n) => n.id === params.target);
        if (isSourceNew && isTargetNew) {
          // Generate a unique id for the connection
          const connId = uuidv4();
          return [
            ...prev,
            {
              id: connId,
              from_node_id: params.source,
              to_node_id: params.target,
              type: 'default',
            },
          ];
        }
        return prev;
      });
    },
    [localNodes],
  );

  const nodeTypes: NodeTypes = {
    baseHandleCustom: (props) => <BaseHandleCustom {...props} />,
  };

  const addNewNode = () => {
    // Create a new node with a unique id, not conflicting with old nodes
    let nodeId = uuidv4();
    while ([...localNodes, ...nodes].some((n) => n.id === nodeId)) {
      nodeId = uuidv4();
    }
    const nodeName = `Node ${nodeId.slice(0, 4)}`;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offset = 100 + Math.random() * 100;
    // Node BE: only contains data to send to API
    const newNodeBE = {
      id: nodeId,
      workflow_id: workflowId,
      name: nodeName,
      type: 'text_and_image',
      config: {},
      position: { x: centerX + offset, y: centerY },
    };
    // Node ReactFlow: used for UI
    const newNodeRF = {
      id: nodeId,
      position: { x: centerX + offset, y: centerY },
      data: { label: nodeName, ...newNodeBE },
      type: 'baseHandleCustom',
    };
    console.log('[addNewNode] newNodeBE:', newNodeBE);
    setLocalNodes((prev) => {
      const next = [...prev, newNodeBE];
      console.log('[addNewNode] localNodes after add:', next);
      return next;
    });
    setNodes((prev) => [...prev, newNodeRF]);
    setHasLocalChange(true);
  };

  // Only send new nodes (localNodes) and new connections (localEdges) when saving
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      if (localNodes.length === 0) {
        toast.info('No new nodes to save.');
        setLoading(false);
        return;
      }
      // Only send connections where both source and target are new nodes
      const newNodeIds = localNodes.map((n) => n.id);
      // Map localEdges to BE format: { workflow_id, from_node_id, to_node_id, condition }
      const newConnections = localEdges
        .filter(
          (c) =>
            newNodeIds.includes(c.from_node_id) &&
            newNodeIds.includes(c.to_node_id),
        )
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
        setLocalNodes([]); // clear new nodes after successful save
        setLocalEdges([]); // clear new connections after successful save
        fetchWorkflowProcess();
      } else {
        toast.error('Failed to save new nodes!');
      }
    } catch (err) {
      toast.error('Failed to save new nodes!');
    } finally {
      setLoading(false);
    }
  };

  // Render nodes: only use nodes (ReactFlow) for UI, no need to merge localNodes anymore as they have been pushed into nodes when added
  const allNodes = nodes;
  console.log('[render] nodes (UI):', nodes);
  console.log('[render] localNodes (BE):', localNodes);
  console.log('[render] allNodes:', allNodes);

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
          nodes={allNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          onEdgeClick={(_event, edge) => {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
          }}
          onNodeClick={(_event, node) => setSelectedNode(node)}
        >
          <Background />
          <Controls
            style={{
              color: 'black',
            }}
            position="center-right"
          />
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
