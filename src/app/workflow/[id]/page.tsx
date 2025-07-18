'use client';
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
      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
            }}
            title="Go back"
          >
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
              Daniel
            </span>
            <button
              style={{
                width: 20,
                height: 20,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#6b7280',
              }}
              title="Edit name"
            >
              ✏️
            </button>
          </div>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: 12,
              background: '#dcfce7',
              color: '#166534',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Published
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            style={{
              padding: '6px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              color: '#6b7280',
            }}
          >
            🕒 Version history
          </button>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: '#374151',
            }}
          >
            Save changes
          </button>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#dc2626',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
            }}
          >
            Unpublished
          </button>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            👁️ Preview
          </button>
        </div>
      </header>

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
          position="top-right"
        />
        <MiniMap />
      </ReactFlow>
      {selectedNode && (
        <aside
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: 320,
            height: '100vh',
            background: '#18181b',
            color: '#fff',
            boxShadow: '-2px 0 8px #0002',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <h2 className="font-bold text-lg mb-2">Node info</h2>
          <div className="mb-2">
            ID: <span className="font-mono">{selectedNode.id}</span>
          </div>
          <div className="mb-2">
            Label:{' '}
            <span className="font-mono">
              {String((selectedNode.data as any)?.label ?? '')}
            </span>
          </div>
          <div className="mb-2">
            Type: <span className="font-mono">{selectedNode.type}</span>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
            onClick={() => setSelectedNode(null)}
          >
            Đóng
          </button>
        </aside>
      )}
    </div>
  );
}
