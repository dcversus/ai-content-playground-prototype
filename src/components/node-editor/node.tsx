import { Handle, NodeProps, NodeToolbar, Position } from '@xyflow/react'
import { Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Editor } from './editor.tsx'
import { NodeType, typeToIcon } from './types'

type NodeData = {
  type: NodeType
  baked?: string
  bakedImgUrl?: string
  label: string
  difficult?: number
  userContext?: string
  companyContext?: string

  onDelete?: (id: string) => void
  onEdit?: (id: string, data: any) => void
  onAdd?: (data: any) => void
}

export function CustomNode({ data, id, selected }: NodeProps & { data: NodeData }) {
  const getDifficultColor = (difficult: number) => {
    if (difficult <= 3) return 'text-foreground'
    if (difficult <= 8) return 'text-muted-foreground'
    return 'text-muted-foreground/50'
  }

  const Icon = typeToIcon[data.type as keyof typeof typeToIcon]

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card p-4 shadow-sm',
        selected && 'border-primary'
      )}
    >
      <NodeToolbar
        className="bg-background/80 backdrop-blur-sm"
        position={Position.Top}
        offset={10}
      >
        <div className="flex items-center gap-1">
          <Editor data={data} id={id} key={id} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the node and its
                  connections.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => data.onDelete?.(id)}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </NodeToolbar>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="flex items-center gap-2">
        <span className="text-lg">
          <Icon />
        </span>
        <span className="font-medium">{data?.label}</span>
        {data?.difficult && (
          <Badge variant="secondary" className={cn('text-sm', getDifficultColor(data.difficult))}>
            {data.difficult}
          </Badge>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {data.userContext && (
          <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-500">
            user context
          </Badge>
        )}
        {data.companyContext && (
          <Badge variant="secondary" className="bg-red-500/10 text-red-500">
            company context
          </Badge>
        )}
        {(data.baked || data.bakedImgUrl) && (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">
            baked
          </Badge>
        )}
      </div>
    </div>
  )
}
