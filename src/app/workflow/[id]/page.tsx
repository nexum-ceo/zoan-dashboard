'use client';
import { WorkflowLeftSideBar } from '@/app/workflow/[id]/components/WorkflowLeftSideBar';
import { BaseHandle } from '@/components/base-handle';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/base-node';
import { Button } from '@/components/ui/button';
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
  Position,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Rocket } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { WorkflowHeader } from './components/WorkflowHeader';
import { WorkflowRightSideBar } from './components/WorkflowRightSideBar';

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
    type: 'baseFullDemo',
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
    type: 'baseFullDemo',
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

const BaseNodeFullDemo = memo(({ data, id }: { data?: any; id?: string }) => {
  return (
    <BaseNode className="w-96 relative">
      <BaseHandle
        type="source"
        position={Position.Right}
        id={id ? `${id}-source` : undefined}
        style={{
          position: 'absolute',
          top: '50%',
          right: -6,
          zIndex: 20,
          transform: 'translateY(-50%)',
        }}
      />
      <BaseHandle
        type="target"
        position={Position.Left}
        id={id ? `${id}-target` : undefined}
        style={{
          position: 'absolute',
          top: '50%',
          left: -6,
          zIndex: 20,
          transform: 'translateY(-50%)',
        }}
      />
      <BaseNodeHeader className="border-b">
        <Rocket className="size-4" />
        <BaseNodeHeaderTitle>{data?.label ?? 'Header'}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <div className="mb-2">
          <span className="font-semibold">Type:</span> {data?.type}
        </div>
        {data?.config && (
          <div className="text-xs">
            <span className="font-semibold">Config:</span>
            <ul className="list-disc ml-4">
              {Object.entries(data.config).map(([key, value]) => (
                <li key={key}>
                  <span className="font-bold">{key}:</span> {String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </BaseNodeContent>
      <BaseNodeFooter>
        <Button variant="outline" className="nodrag w-full">
          Action
        </Button>
      </BaseNodeFooter>
    </BaseNode>
  );
});
BaseNodeFullDemo.displayName = 'BaseNodeFullDemo';

export default function Page() {
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
    baseFullDemo: (props) => <BaseNodeFullDemo {...props} />,
  };

  // Thêm node mới vào flow
  const addNewNode = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: `n${nds.length + 1}`,
        position: { x: 300 + nds.length * 200, y: 200 },
        data: { label: `Node ${nds.length + 1}` },
        type: 'baseFullDemo',
      },
    ]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkflowHeader name="Send Email on Form Submit" />
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
