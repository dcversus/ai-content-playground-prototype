import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react'
import { merge } from 'lodash'
import { toast } from 'sonner'

import {
  BASE_HISTORY_PROMPT,
  generateImage,
  llmRequest,
  llmSystemRequest,
  NEXT_NODE_DECISION_PROMPT,
  SYSTEM_CARDS_PROMPT,
  SYSTEM_FINISH_COURSE_PROMPT,
  SYSTEM_INPUT_PROMPT,
  SYSTEM_QUIZ_PROMPT,
  SYSTEM_TEXT_PROMPT,
} from '@/lib/openai'
import seedData from '@/seed.json'

type NodeId = string
type OptionId = string

interface Course {
  name: string
  description: string
  id: string
  nodes: NodeId[]
  startNodeId: NodeId
  edges: Edge[]
  path: NodeId[]
}

interface Edge {
  id: string
  type: string
  source: NodeId
  target?: NodeId
}

interface Node {
  id: NodeId
  position: { x?: number; y?: number }
  data: {
    label?: string
    companyContext?: string
    userContext?: string
    difficult?: number
    prompt?: string
    promptInput?: string
    userResponse?: string
    promptInputContent?: string
    baked?: string
    imgUrlBaked?: string
    imgUrlContent?: string
    imgPrompt?: string
    videoUrlBaked?: string
    answerId?: OptionId
    content?: string
    type?: 'text' | 'quiz' | 'image' | 'cards' | 'input' | 'video'
    quizOptions?: {
      id: OptionId
      label: string
      isRight: boolean
      nextNode?: NodeId
      upLevel: boolean
    }[]
  }
}

interface Store {
  courses: Course[]
  nodes: Node[]
  level: number
  systemContext: string
  isLoading: boolean
}

type Action =
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'REMOVE_COURSE'; payload: string }
  | { type: 'EDIT_COURSE'; payload: { id: string; course: Partial<Course> } }
  | { type: 'ADD_NODE'; payload: { courseId: string; node: Node } }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'EDIT_NODE'; payload: { id: string; node: Partial<Node> } }
  | { type: 'RESET_COURSE'; payload: string }
  | { type: 'RESET_LEVEL' }
  | { type: 'START_COURSE'; payload: string }
  | {
      type: 'NEXT_NODE'
      payload: {
        currentCourseId: string
        nextNodeId: string
        currentNodeId: string
        type: 'next' | 'quiz' | 'input'
        data?: any
      }
    }
  | { type: 'REMOVE_EDGE'; payload: { courseId: string; edgeId: string } }
  | { type: 'START_LOADING' }
  | { type: 'END_LOADING' }
  | { type: 'UPDATE_SYSTEM_CONTEXT'; payload: string }
  | { type: 'LEVEL_UP' }
  | { type: 'FINISH_COURSE'; payload: string }
  | { type: 'SEED_STORAGE' }

const initialState: Store = {
  courses: [],
  nodes: [],
  level: 0,
  systemContext: '',
  isLoading: false,
}

const StoreContext = createContext<{
  state: Store
  dispatch: React.Dispatch<Action>
} | null>(null)

function reducer(state: Store, action: Action): Store {
  switch (action.type) {
    case 'ADD_COURSE':
      return {
        ...state,
        courses: [...state.courses, action.payload],
      }
    case 'REMOVE_COURSE':
      const courseToRemove = state.courses.find((c) => c.id === action.payload)
      if (!courseToRemove) return state
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.payload),
        nodes: state.nodes.filter((n) => !courseToRemove.nodes.includes(n.id)),
      }
    case 'EDIT_COURSE':
      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.course } : c
        ),
      }
    case 'ADD_NODE':
      const course = state.courses.find((c) => c.id === action.payload.courseId)
      if (!course) return state

      const nodeWithPosition = {
        ...action.payload.node,
        position: action.payload.node.position || { x: 100, y: 100 },
      }

      return {
        ...state,
        nodes: [...state.nodes, nodeWithPosition],
        courses: state.courses.map((c) =>
          c.id === action.payload.courseId ? { ...c, nodes: [...c.nodes, nodeWithPosition.id] } : c
        ),
      }
    case 'REMOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.id !== action.payload),
        courses: state.courses.map((c) => ({
          ...c,
          nodes: c.nodes.filter((n) => n !== action.payload),
          edges: c.edges.filter((e) => e.source !== action.payload && e.target !== action.payload),
        })),
      }
    case 'EDIT_NODE':
      console.log('edit_node', action.payload)
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.payload.id
            ? {
                ...merge(n, action.payload.node),
                position: {
                  x: n.position.x || action.payload.node.position?.x || 0,
                  y: n.position.y || action.payload.node.position?.y || 0,
                },
              }
            : n
        ),
      }
    case 'RESET_COURSE':
      const targetCourse = state.courses.find((c) => c.id === action.payload)
      if (!targetCourse) return state
      return {
        ...state,
        courses: state.courses.map((c) => (c.id === action.payload ? { ...c, path: [] } : c)),
        nodes: state.nodes.map((n) =>
          targetCourse.nodes.includes(n.id)
            ? {
                ...n,
                data: {
                  ...n.data,
                  content: undefined,
                  answerId: undefined,
                  inputContentResponse: undefined,
                  userResponse: undefined,
                  imgUrlContent: undefined,
                },
              }
            : n
        ),
      }
    case 'RESET_LEVEL':
      return {
        ...state,
        level: 0,
      }
    case 'START_COURSE':
      const startCourse = state.courses.find((c) => c.id === action.payload)

      if (!startCourse) return state

      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.payload ? { ...c, path: [startCourse.startNodeId] } : c
        ),
      }
    case 'NEXT_NODE':
      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.payload.currentCourseId
            ? { ...c, path: [...c.path, action.payload.nextNodeId] }
            : c
        ),
        nodes: state.nodes.map((n) =>
          n.id === action.payload.currentNodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  answerId: action.payload.type === 'quiz' ? action.payload.data : undefined,
                  userResponse: action.payload.type === 'input' ? action.payload.data : undefined,
                },
              }
            : n
        ),
      }
    case 'REMOVE_EDGE':
      const courseToUpdate = state.courses.find((c) => c.id === action.payload.courseId)
      if (!courseToUpdate) return state

      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.payload.courseId
            ? { ...c, edges: c.edges.filter((e) => e.id !== action.payload.edgeId) }
            : c
        ),
      }
    case 'START_LOADING':
      return { ...state, isLoading: true }
    case 'END_LOADING':
      return { ...state, isLoading: false }
    case 'UPDATE_SYSTEM_CONTEXT':
      return { ...state, systemContext: action.payload }
    case 'LEVEL_UP':
      return { ...state, level: state.level + 1 }
    case 'FINISH_COURSE':
      return { ...state, systemContext: `${action.payload} \n\n ${SYSTEM_FINISH_COURSE_PROMPT}` }
    case 'SEED_STORAGE':
      return seedData as Store
    default:
      return state
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const storedState = localStorage.getItem('ai-lmao-store')
    return storedState ? JSON.parse(storedState) : initialState
  })

  useEffect(() => {
    console.log('state saved', state)
    localStorage.setItem('ai-lmao-store', JSON.stringify(state))
  }, [state])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
export function useStoreActions() {
  const { dispatch, state } = useStore()

  return {
    addCourse: (course: Course) => {
      dispatch({ type: 'ADD_COURSE', payload: course })
      toast.success(`Course "${course.name}" added successfully`)
    },
    removeCourse: (courseId: string) => {
      const courseName = state.courses.find((c) => c.id === courseId)?.name
      dispatch({ type: 'REMOVE_COURSE', payload: courseId })
      toast.success(`Course ${courseName || courseId} removed successfully`)
    },
    editCourse: (courseId: string, course: Partial<Course>) => {
      dispatch({ type: 'EDIT_COURSE', payload: { id: courseId, course } })
      toast.success(`Course "${course.name || courseId}" updated successfully`)
    },
    addNode: (courseId: string, node: Node) => {
      dispatch({ type: 'ADD_NODE', payload: { courseId, node } })
      toast.success(`Node "${node.data.label}" added to course #${courseId}`)
    },
    removeNode: (nodeId: string) => {
      dispatch({ type: 'REMOVE_NODE', payload: nodeId })
      const nodeLabel = state.nodes.find((n) => n.id === nodeId)?.data.label
      toast.success(`Node ${nodeLabel || nodeId} removed successfully`)
    },
    editNode: (nodeId: string, node: Partial<Node>) => {
      dispatch({ type: 'EDIT_NODE', payload: { id: nodeId, node } })
      toast.success(`Node "${node.data?.label || nodeId}" updated successfully`)
    },
    resetCourse: (courseId: string) => {
      dispatch({ type: 'RESET_COURSE', payload: courseId })
      const courseName = state.courses.find((c) => c.id === courseId)?.name
      toast.success(`Course "${courseName}" progress has been reset`)
    },
    resetProgress: () => {
      dispatch({ type: 'RESET_LEVEL' })
      dispatch({ type: 'UPDATE_SYSTEM_CONTEXT', payload: '' })
      dispatch({ type: 'END_LOADING' })
      toast.success('Current level and context has been reset')
    },
    startCourse: async (courseId: string) => {
      dispatch({ type: 'START_LOADING' })
      const currentCourse = state.courses.find((c) => c.id === courseId)
      const startNode = state?.nodes.find((n) => n.id === currentCourse?.startNodeId)
      if (!currentCourse?.startNodeId || !startNode) return

      const systemContext = buildSystemContext(
        state.systemContext,
        startNode.data.userContext,
        startNode.data.companyContext,
        'User started the course'
      )
      const { content, imgUrlContent } = await getNodeContent(startNode, systemContext)
      generateNewContext(systemContext, content).then((newContext) => {
        dispatch({ type: 'UPDATE_SYSTEM_CONTEXT', payload: newContext })
        console.log(
          'new context delivered... dont shame me for race condition, i know :/',
          newContext
        )
      })

      dispatch({
        type: 'EDIT_NODE',
        payload: { id: currentCourse.startNodeId, node: { data: { content, imgUrlContent } } },
      })
      dispatch({ type: 'START_COURSE', payload: courseId })
      dispatch({ type: 'END_LOADING' })
    },
    nextNode: async (
      courseId: string,
      nodeId: string,
      type: 'next' | 'quiz' | 'input',
      data?: any
    ) => {
      const currentCourse = state.courses.find((c) => c.id === courseId)
      if (!currentCourse) return
      const currentNode = state.nodes.find(
        (n) => n.id === currentCourse.path[currentCourse.path.length - 1]
      )
      if (!currentNode) return

      dispatch({ type: 'START_LOADING' })

      const nextNodeIds = currentCourse.edges
        .filter((e) => e.source === nodeId)
        .map((e) => e.target)
        .filter((id) => id !== undefined) as string[]

      const nextNodes = nextNodeIds.map((id) => state.nodes.find((n) => n.id === id))

      let nextNodeId: string | undefined
      let preparedDataForContext = ''
      let isLvlUp = false
      switch (type) {
        case 'next':
          preparedDataForContext = `User read ${currentNode?.data.content} and pressed next button`
          break
        case 'input':
          preparedDataForContext = `User answered with the following: ${data} for our question: ${currentNode?.data.content}`
          break
        case 'quiz':
          const selectedOption = currentNode?.data.quizOptions?.find((o) => o.id === data)
          preparedDataForContext = `We asked: ${currentNode?.data.content}\nand user choose: ${selectedOption?.label} ${selectedOption?.isRight ? ', we marked it right' : ''} ${selectedOption?.upLevel ? 'and its high beyound his level, we level up him' : ''}`
          isLvlUp = selectedOption?.upLevel || false
          nextNodeId = selectedOption?.nextNode || undefined
          break
      }

      // navigation
      if (nextNodes.length === 1 && nextNodeIds[0]) {
        nextNodeId = nextNodeIds[0]
        dispatch({
          type: 'NEXT_NODE',
          payload: {
            currentCourseId: courseId,
            nextNodeId: nextNodeIds[0],
            currentNodeId: currentNode.id,
            type: 'next',
          },
        })
      } else if (nextNodeId) {
        dispatch({
          type: 'NEXT_NODE',
          payload: {
            currentCourseId: courseId,
            nextNodeId: nextNodeId,
            currentNodeId: currentNode.id,
            type: 'next',
          },
        })
      } else {
        const nextNodesPrepared = nextNodes.map((n, i) => ({
          nodeIndex: i,
          label: n?.data.label,
          type: n?.data.type,
          difficult: n?.data.difficult,
        }))

        const prompt = `
          ${NEXT_NODE_DECISION_PROMPT}
          userLevel: ${state.level},
          lastUserInteraction: ${preparedDataForContext},
          nextNodesPrepared: ${JSON.stringify(nextNodesPrepared)}
        `

        const nextNodeIndex = await llmSystemRequest<string>(prompt, 'number', state.systemContext)
        const decidedNextNodeId = nextNodes[parseInt(nextNodeIndex, 10)]?.id || nextNodeIds[0]
        nextNodeId = decidedNextNodeId

        if (!nextNodes[parseInt(nextNodeIndex, 10)]?.id) {
          console.error(
            `Next node index (${nextNodeIndex}) is out of bounds, fallback to first node...`,
            nextNodesPrepared
          )
        }

        dispatch({
          type: 'NEXT_NODE',
          payload: {
            currentCourseId: courseId,
            nextNodeId: decidedNextNodeId,
            currentNodeId: currentNode.id,
            type,
            data,
          },
        })
      }

      // one more last preparation (:
      const nextNode = state.nodes.find((n) => n.id === nextNodeId) as Node

      // system context and building new content
      const systemContext = buildSystemContext(
        state.systemContext,
        nextNode.data.userContext,
        nextNode.data.companyContext,
        preparedDataForContext
      )
      const { content, imgUrlContent } = await getNodeContent(nextNode, systemContext)

      generateNewContext(systemContext, content).then((newContext) => {
        dispatch({ type: 'UPDATE_SYSTEM_CONTEXT', payload: newContext })
        console.log(
          'new context delivered... dont shame me for race condition, i know :/',
          newContext
        )
      })

      // dispatch new shit!
      dispatch({
        type: 'EDIT_NODE',
        payload: { id: nextNode.id, node: { data: { content, imgUrlContent } } },
      })
      dispatch({ type: 'END_LOADING' })
      if (isLvlUp) {
        dispatch({ type: 'LEVEL_UP' })
      }
    },
    removeEdge: (courseId: string, edgeId: string) => {
      dispatch({ type: 'REMOVE_EDGE', payload: { courseId, edgeId } })
      const courseName = state.courses.find((c) => c.id === courseId)?.name
      toast.success(`Connection #${edgeId} removed from course "${courseName || courseId}"`)
    },
    updateSystemContext: (context: string) => {
      dispatch({ type: 'UPDATE_SYSTEM_CONTEXT', payload: context })
      toast.success('System context updated')
    },
    finishCourse: (courseId: string) => {
      dispatch({ type: 'FINISH_COURSE', payload: courseId })
      const courseName = state.courses.find((c) => c.id === courseId)?.name
      toast.success(`Course "${courseName || courseId}" finished`)
    },
    seedStorage: () => {
      dispatch({ type: 'SEED_STORAGE' })
      toast.success('Storage seeded')
    },
  }
}

async function getNodeContent(node: Node, systemContext: string) {
  console.log('node_content_before', node)
  let content = '',
    imgUrlContent = ''

  switch (node.data.type) {
    case 'text':
      if (node.data.baked) {
        content = node.data.baked
      } else {
        content = await llmRequest(node.data.prompt || '', SYSTEM_TEXT_PROMPT, systemContext)
      }
      break
    case 'image':
      if (node.data.imgUrlBaked) {
        imgUrlContent = node.data.imgUrlBaked
      } else {
        imgUrlContent = await generateImage(node.data.imgPrompt!)
      }
      break
    case 'cards':
      if (node.data.baked) {
        content = node.data.baked
      } else {
        content = await llmRequest(node.data.prompt || '', SYSTEM_CARDS_PROMPT, systemContext)
      }
      if (node.data.imgUrlBaked) {
        imgUrlContent = node.data.imgUrlBaked
      } else {
        imgUrlContent = await generateImage(node.data.imgPrompt!)
      }
      break
    case 'quiz':
      if (node.data.baked) {
        content = node.data.baked
      } else {
        content = await llmRequest(node.data.prompt || '', SYSTEM_QUIZ_PROMPT, systemContext)
      }
      break
    case 'input':
      if (node.data.baked) {
        content = node.data.baked
      } else {
        content = await llmRequest(node.data.prompt || '', SYSTEM_INPUT_PROMPT, systemContext)
      }
      break
  }

  return { content, imgUrlContent }
}

function buildSystemContext(...contexts: (string | undefined)[]) {
  return contexts.filter(Boolean).join('\n\n')
}

async function generateNewContext(systemContext: string, content: string) {
  return await llmRequest(systemContext, `${BASE_HISTORY_PROMPT}\n${content}`)
}
