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
    id: 'n1',
    position: { x: 250, y: 100 },
    data: { label: 'Node 1' },
    type: 'baseFullDemo',
  },
  {
    id: 'n2',
    position: { x: 600, y: 100 },
    data: { label: 'Node 2' },
    type: 'baseFullDemo',
  },
];
const initialEdges: Edge[] = [];

const BaseNodeFullDemo = memo(
  ({
    data,
    id,
  }: {
    data?: { label?: string; showTopSource?: boolean };
    id?: string;
  }) => {
    return (
      <BaseNode className="w-96 relative">
        {/* Handles: absolutely positioned, always visible, high z-index */}
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
        {/* Handle mới ở top nếu có showTopSource */}
        {data?.showTopSource && (
          <BaseHandle
            type="source"
            position={Position.Top}
            id={id ? `${id}-top-source` : undefined}
            style={{
              position: 'absolute',
              top: -6,
              left: '50%',
              zIndex: 20,
              transform: 'translateX(-50%)',
            }}
          />
        )}
        <BaseNodeHeader className="border-b">
          <Rocket className="size-4" />
          <BaseNodeHeaderTitle>{data?.label ?? 'Header'}</BaseNodeHeaderTitle>
        </BaseNodeHeader>
        <BaseNodeContent>
          <h3 className="text-lg font-bold">Content</h3>
          <p className="text-xs">
            This is a full-featured node with a header, content, and footer. You
            can customize it as needed.
          </p>
        </BaseNodeContent>
        <BaseNodeFooter>
          <h4 className="text-md self-start font-bold">Footer</h4>
          <Button variant="outline" className="nodrag w-full">
            Action 1
          </Button>
        </BaseNodeFooter>
      </BaseNode>
    );
  },
);
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
      <WorkflowHeader name="Daniel" />
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
