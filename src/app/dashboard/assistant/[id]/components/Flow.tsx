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

import { useCallback, useState } from 'react';

const initialNodes: Node[] = [
  {
    id: 'node1',
    position: { x: 100, y: 200 },
    data: {
      label: 'Webhook Trigger',
      type: 'webhook',
      config: {
        path: '/submit-form',
        method: 'POST',
      },
    },
    type: 'baseHandleCustom',
  },
  {
    id: 'node2',
    position: { x: 400, y: 200 },
    data: {
      label: 'Send Welcome Email',
      type: 'emailSend',
      config: {
        to: '{{ $json.email }}',
        subject: 'Welcome!',
        body: 'Thanks for signing up.',
      },
    },
    type: 'baseHandleCustom',
  },
];
const initialEdges: Edge[] = [
  {
    id: 'edge-node1-node2',
    source: 'node1',
    target: 'node2',
    type: 'default',
  },
];

interface FlowProps {
  onClose?: () => void;
}

export default function Flow({ onClose }: FlowProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
      <WorkflowHeader name="Send Email on Form Submit" onClose={onClose} />
      <WorkflowLeftSideBar onAddNode={addNewNode} />
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
