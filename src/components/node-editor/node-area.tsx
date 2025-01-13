import {
  Background,
  Controls,
  Edge,
  EdgeTypes,
  Node,
  NodeTypes,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
} from '@xyflow/react'

import { DevTools } from '@/components/devtools'

import { CustomEdge } from './edge.tsx'
import { CustomNode } from './node.tsx'

import '@xyflow/react/dist/style.css'

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

interface NodeAreaProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange?: OnNodesChange<Node>
  onEdgesChange?: OnEdgesChange<Edge>
  onConnect?: (params: any) => void
  onNodeClick?: (node: Node) => void
  onEdgeClick?: (edge: Edge) => void
}

export function NodeArea({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
}: NodeAreaProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => onNodeClick?.(node)}
      onEdgeClick={(_, edge) => onEdgeClick?.(edge)}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    >
      <Background />
      <Controls />
      <DevTools />
    </ReactFlow>
  )
}
