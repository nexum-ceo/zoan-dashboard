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

// initialNodes/initialEdges will be set from API

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
  // Fetch workflow-process data from API
  useEffect(() => {
    if (!workflowId) return;
    async function fetchWorkflowProcess() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/workflow-process/${workflowId}`);
        const data = await res.json();
        if (res.ok && data && Array.isArray(data.nodes)) {
          // Convert API nodes to React Flow nodes
          const apiNodes = data.nodes.map((n: any) => ({
            id: n.id,
            position: n.position || { x: 0, y: 0 },
            data: {
              label: n.name,
              ...n,
            },
            type: 'baseHandleCustom',
          }));
          // Convert API connections to React Flow edges
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
        } else {
          setNodes([]);
          setEdges([]);
        }
      } catch (err: any) {
        setError('Lỗi khi fetch workflow-process');
        setNodes([]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflowProcess();
  }, [workflowId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const nodeTypes: NodeTypes = {
    baseHandleCustom: (props) => <BaseHandleCustom {...props} />,
  };

  const addNewNode = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: `n${nds.length + 1}`,
        position: { x: 300 + nds.length * 200, y: 200 },
        data: { label: `Node ${nds.length + 1}` },
        type: 'baseHandleCustom',
      },
    ]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkflowHeader name={workflowName || 'Workflow'} onClose={onClose} />
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
          nodeTypes={nodeTypes}
          fitView
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
