import { CaseSensitiveIcon, ListTodo, Image, IdCard, Code, Video } from 'lucide-react'

export const typeToIcon = {
  text: CaseSensitiveIcon,
  quiz: ListTodo,
  image: Image,
  cards: IdCard,
  input: Code,
  video: Video,
} as const

export type NodeType = keyof typeof typeToIcon

export interface QuizOption {
  id: string
  label: string
  isRight: boolean
  upLevel: boolean
  nextNode?: string
}

export interface FormData {
  type: string
  label: string
  difficulty: number
  quizOptions?: QuizOption[]
}

export interface EditorProps {
  data?: FormData
  id?: string
  isNew?: boolean
  nodes?: Array<{
    id: string
    data: {
      label: string
    }
  }>
  edges?: Array<{
    source: string
    target: string
  }>
}
