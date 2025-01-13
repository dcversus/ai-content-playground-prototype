import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronUp, CirclePlus, Lightbulb, Pen, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

import { useStore } from '@/app/store'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { NodeType, typeToIcon } from './types'

interface EditorProps {
  id: string
  data: {
    label: string
    type: NodeType
    difficult?: number
    userContext?: string
    companyContext?: string
    prompt?: string
    promptInput?: string
    baked?: string
    imgUrlContent?: string
    imgUrlBaked?: string
    imgPrompt?: string
    videoUrlBaked?: string
    content?: string
    quizOptions?: {
      id: string
      label: string
      isRight: boolean
      nextNode?: string
      upLevel: boolean
    }[]
    onEdit?: (id: string, data: any) => void
    onDelete?: (id: string) => void
    onAdd?: (data: any) => void
  }
  isNew?: boolean
}

export function Editor({ data, id, isNew }: EditorProps) {
  const { id: courseId } = useParams()
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(data)

  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-dialog-open', open.toString())
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('formData', formData)

    const { onEdit, onAdd, onDelete, ...data } = formData

    if (isNew) {
      onAdd?.(data)
    } else {
      onEdit?.(id, data)
    }
    setFormData({ type: 'text', label: 'New Node', onEdit, onAdd, onDelete })
    setOpen(false)
  }

  const handleQuizOptionToggle = (
    optionId: string,
    field: 'isRight' | 'upLevel',
    value: boolean
  ) => {
    console.log(formData.quizOptions)
    const newOptions = formData.quizOptions?.map((option) => {
      if (field === 'isRight') {
        // Only one option can be right
        return {
          ...option,
          isRight: option.id === optionId ? true : false,
        }
      }

      if (option.id === optionId) {
        return { ...option, [field]: value }
      }
      return option
    })
    console.log(newOptions)
    setFormData({ ...formData, quizOptions: newOptions })
  }

  const currentCourse = state.courses.find((c) => c.id === courseId)
  const connectedNodeIds =
    currentCourse?.edges?.filter((edge) => edge.source === id)?.map((edge) => edge.target) || []
  const connectedNodes = state.nodes.filter((node) => connectedNodeIds.includes(node.id))

  const handleDeleteOption = (optionId: string) => {
    const newOptions = formData.quizOptions?.filter((o) => o.id !== optionId)
    setFormData({ ...formData, quizOptions: newOptions })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {isNew ? (
          <Button size="lg" className="fixed bottom-4 right-4 h-12 w-12 rounded-full">
            <CirclePlus className="h-6 w-6" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pen className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isNew ? 'Add Node' : 'Edit Node'}</SheetTitle>
          <SheetDescription>
            Make changes to the node here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: NodeType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeToIcon).map(([type, Icon]) => (
                    <SelectItem key={type} value={type}>
                      <span className="inline-flex items-center gap-2 capitalize">
                        <Icon className="h-4 w-4" /> {type}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="difficult">Difficulty (1-13)</Label>
              <Input
                id="difficult"
                type="number"
                min="1"
                max="13"
                value={formData.difficult || 1}
                onChange={(e) =>
                  setFormData({ ...formData, difficult: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>

          <Accordion type="single" collapsible>
            {['text', 'quiz', 'cards', 'input', 'image'].includes(formData.type) && (
              <AccordionItem value="context">
                <AccordionTrigger>Context</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userContext">User Context</Label>
                    <Textarea
                      id="userContext"
                      value={formData.userContext}
                      onChange={(e) => setFormData({ ...formData, userContext: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyContext">Company Context</Label>
                    <Textarea
                      id="companyContext"
                      value={formData.companyContext}
                      onChange={(e) => setFormData({ ...formData, companyContext: e.target.value })}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {['text', 'quiz', 'cards', 'image', 'input'].includes(formData.type) && (
              <AccordionItem value="baked">
                <AccordionTrigger>Baked</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {['quiz', 'cards', 'text', 'input'].includes(formData.type) && (
                      <div className="space-y-2">
                        <Label htmlFor="imgUrl">Baked Content</Label>
                        <Textarea
                          id="baked"
                          value={formData.baked}
                          onChange={(e) => setFormData({ ...formData, baked: e.target.value })}
                        />
                      </div>
                    )}

                    {['image', 'cards'].includes(formData.type) && (
                      <div className="space-y-2">
                        <Label htmlFor="imgUrl">Baked Image Url</Label>
                        <Input
                          id="imgUrl"
                          value={formData.imgUrlBaked}
                          onChange={(e) =>
                            setFormData({ ...formData, imgUrlBaked: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {['image', 'cards'].includes(formData.type) && (
            <div className="space-y-2">
              <Label htmlFor="imgPrompt">Image Prompt</Label>
              <Textarea
                id="imgPrompt"
                value={formData.imgPrompt}
                onChange={(e) => setFormData({ ...formData, imgPrompt: e.target.value })}
              />
            </div>
          )}

          {formData.type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrlBaked}
                onChange={(e) => setFormData({ ...formData, videoUrlBaked: e.target.value })}
              />
            </div>
          )}

          {['cards', 'text', 'quiz', 'input'].includes(formData.type) && (
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              />
            </div>
          )}

          {['input'].includes(formData.type) && (
            <div className="space-y-2">
              <Label htmlFor="promptInput">Prompt for user input reaction</Label>
              <Textarea
                id="promptInput"
                value={formData.promptInput}
                onChange={(e) => setFormData({ ...formData, promptInput: e.target.value })}
              />
            </div>
          )}

          {['quiz', 'cards'].includes(formData.type) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Quiz Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      quizOptions: [
                        ...(formData.quizOptions || []),
                        {
                          id: uuidv4(),
                          label: '',
                          isRight: false,
                          upLevel: false,
                        },
                      ],
                    })
                  }
                >
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {formData.quizOptions?.map((option) => (
                  <div key={option.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = formData.quizOptions?.map((o) =>
                            o.id === option.id ? { ...o, label: e.target.value } : o
                          )
                          setFormData({ ...formData, quizOptions: newOptions })
                        }}
                        placeholder="Option label"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleDeleteOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <ToggleGroup type="single" value={option.isRight ? option.id : undefined}>
                        <ToggleGroupItem
                          value={option.id}
                          onClick={() =>
                            handleQuizOptionToggle(option.id, 'isRight', !option.isRight)
                          }
                          className="gap-2"
                        >
                          <Lightbulb className="h-4 w-4" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <ToggleGroup type="multiple" value={option.upLevel ? [option.id] : []}>
                        <ToggleGroupItem
                          value={option.id}
                          onClick={() =>
                            handleQuizOptionToggle(option.id, 'upLevel', !option.upLevel)
                          }
                          className="gap-2"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <Select
                        value={option.nextNode}
                        onValueChange={(value) => {
                          const newOptions = formData.quizOptions?.map((o) =>
                            o.id === option.id ? { ...o, nextNode: value } : o
                          )
                          setFormData({ ...formData, quizOptions: newOptions })
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select next node" />
                        </SelectTrigger>
                        <SelectContent>
                          {connectedNodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.data.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="mt-6">
            Save
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
