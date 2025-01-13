import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MiniMap, ReactFlowProvider } from '@xyflow/react'
import { addEdge, Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import { debounce } from 'lodash'
import { merge } from 'lodash'
import { ArrowLeft } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

import { useStore, useStoreActions } from '@/app/store.tsx'
import { Editor as NodeEditor } from '@/components/node-editor/editor'
import { NodeArea } from '@/components/node-editor/node-area'
import { NodeType } from '@/components/node-editor/types'
import { typeToIcon } from '@/components/node-editor/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

export function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useStore()
  const { editCourse, editNode, addNode, removeEdge, removeNode } = useStoreActions()

  const course = state.courses.find((c) => c.id === id)
  const stateNodes = state.nodes.filter((n) => course?.nodes.includes(n.id))

  const [nodes, setNodes, onNodesChange] = useNodesState(stateNodes as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState((course?.edges as Edge[]) || [])

  const richEdges = edges.map((edge) => ({
    ...edge,
    data: {
      courseId: id,
      onDelete: (edgeId: string) => {
        if (!id) return

        removeEdge(id, edgeId)
        setEdges((eds) => eds.filter((e) => e.id !== edgeId))
      },
    },
  }))

  const richNodes = nodes.map((node) => ({
    ...node,
    type: 'custom',
    data: {
      ...node.data,
      onDelete: (nodeId: string) => {
        removeNode(nodeId)
        setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      },
      onEdit: (nodeId: string, data: any) => {
        editNode(nodeId, { data })
        setNodes((nds) =>
          nds.map((n) => (n.id === nodeId ? { ...n, data: merge(n.data, data) } : n))
        )
      },
    },
  }))

  const debouncedEditNode = useCallback(
    debounce((nodes: any[]) => {
      nodes.forEach((node) => {
        editNode(node.id, node)
      })
    }, 3000),
    []
  )

  useEffect(() => {
    debouncedEditNode(nodes)

    return () => {
      debouncedEditNode.cancel()
    }
  }, [nodes, debouncedEditNode])

  const handleConnect = useCallback(
    (params: any) => {
      if (!course) return

      const newEdge = {
        id: uuidv4(),
        type: 'custom',
        source: params.source,
        target: params.target,
      }

      setEdges((eds) => addEdge(newEdge as Edge, eds))

      editCourse(course.id, {
        edges: [...course.edges, newEdge],
      })
    },
    [course, editCourse, setEdges]
  )

  if (!course) {
    return null
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        <aside className="flex w-80 flex-col border-r">
          <div className="flex items-center gap-2 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium">{course.name}</h1>
          </div>
          <Separator />
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={course.name}
                onChange={(e) => editCourse(course.id, { name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={course.description}
                onChange={(e) => editCourse(course.id, { description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startNode">Start Node</Label>
              <Select
                value={course.startNodeId}
                onValueChange={(value) => editCourse(course.id, { startNodeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => {
                    const TypeIcon = typeToIcon[node.data.type as NodeType]
                    return (
                      <SelectItem key={node.id} value={node.id} className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" /> {node.data.label as string}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor="#e2e2e2"
            maskColor="rgb(240, 240, 240, 0.6)"
            style={{ width: 320, height: 240, margin: 0 }}
          />
        </aside>
        <main className="relative flex-1">
          <NodeArea
            nodes={richNodes}
            edges={richEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
          />
          <NodeEditor
            id=""
            data={{
              label: 'New Node',
              type: 'text',
              onAdd: (data) => {
                console.log('onAdd', data)
                const newNode = {
                  data,
                  id: uuidv4(),
                  position: { x: 0, y: 0 },
                }
                addNode(course.id, newNode as any)
                setNodes((nds) => nds.concat(newNode))
              },
            }}
            isNew
          />
        </main>
      </div>
    </ReactFlowProvider>
  )
}
