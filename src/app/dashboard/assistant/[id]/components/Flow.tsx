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
  // Track local changes for save
  const [localNodes, setLocalNodes] = useState<any[]>([]);
  const [localEdges, setLocalEdges] = useState<any[]>([]);
  const [hasLocalChange, setHasLocalChange] = useState(false);
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
        setError('Lỗi khi fetch workflow-process');
        setNodes([]);
        setEdges([]);
        setLocalEdges([]);
        setHasLocalChange(false);
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
    // Tạo node mới với id unique, không trùng node cũ
    let nodeId = uuidv4();
    while ([...localNodes, ...nodes].some((n) => n.id === nodeId)) {
      nodeId = uuidv4();
    }
    const nodeName = `Node ${nodeId.slice(0, 4)}`;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offset = 100 + Math.random() * 100;
    const newNode = {
      id: nodeId,
      workflow_id: workflowId,
      name: nodeName,
      type: 'text_and_image',
      config: {},
      position: { x: centerX + offset, y: centerY + Math.random() * 100 },
    };
    setLocalNodes((prev) => [...prev, newNode]);
    setHasLocalChange(true);
  };

  // Chỉ gửi các node mới (localNodes) lên khi save
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      if (localNodes.length === 0) {
        toast.info('Không có node mới để lưu.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/workflow-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: localNodes,
          connections: [],
          triggers: [],
        }),
      });
      if (res.ok) {
        toast.success('Lưu node mới thành công!');
        setHasLocalChange(false);
        setLocalNodes([]); // clear node mới sau khi lưu thành công
        // Reload lại từ BE
        setTimeout(() => {
          setNodes([]);
          setEdges([]);
        }, 500);
      } else {
        toast.error('Lưu node mới thất bại!');
      }
    } catch (err) {
      toast.error('Lưu node mới thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Render nodes: nodes từ BE + localNodes (node mới)
  const allNodes = [
    ...nodes,
    ...localNodes.map((n) => ({
      id: n.id,
      position: n.position,
      data: { label: n.name, ...n },
      type: 'baseHandleCustom',
    })),
  ];

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
