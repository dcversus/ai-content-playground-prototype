import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, PartyPopper } from 'lucide-react'

import { useStore, useStoreActions } from '@/app/store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CardWidget } from '@/components/widgets/card/card'
import { ImageWidget } from '@/components/widgets/image/image'
import { InputWidget } from '@/components/widgets/input/input'
import { QuizWidget } from '@/components/widgets/quiz/quiz'
import { TextWidget } from '@/components/widgets/text/text'
import { VideoWidget } from '@/components/widgets/video/video'

const widgetMap = {
  text: TextWidget,
  quiz: QuizWidget,
  image: ImageWidget,
  cards: CardWidget,
  input: InputWidget,
  video: VideoWidget,
}

export function Playground() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useStore()
  const { startCourse, nextNode, resetCourse, finishCourse } = useStoreActions()
  const [isFinishing, setIsFinishing] = useState(false)

  const course = state.courses.find((c) => c.id === id)

  if (!course) {
    return null
  }

  const nodes = course.path
    .map((id) => state.nodes.find((n) => n.id === id))
    .filter((n) => n !== undefined)

  if (!course.path.length) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-4xl font-bold">{course.name}</h1>
        <p className="prose mb-8 p-6 text-lg text-muted-foreground dark:prose-invert">
          {course.description}
        </p>
        <Button isLoading={state.isLoading} onClick={() => startCourse(course.id)}>
          Start
        </Button>
      </div>
    )
  }

  const isLastCourseNode = !course.edges.some(
    (e) => e.source === course.path[course.path.length - 1]
  )

  const handleFinish = () => {
    finishCourse(course.id)
    setIsFinishing(true)
    setTimeout(() => {
      navigate('/')
    }, 3000)
  }

  return (
    <div className="min-h-screen lg:bg-muted">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="lg" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold">{course.name}</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
          {nodes.map((node) => {
            const Widget = widgetMap[
              node.data.type as keyof typeof widgetMap
            ] as React.ComponentType<any>
            const isLastOpenedNode = node.id === course.path[course.path.length - 1]

            if (state.isLoading && isLastOpenedNode) {
              return (
                <div key={node.id} className="w-full p-6 lg:p-0">
                  <Skeleton className="flex h-[200px] w-full items-center justify-center rounded-xl">
                    <Loader2 className="h-12 w-12 animate-pulse animate-spin" />
                  </Skeleton>
                </div>
              )
            }

            return (
              <div key={node.id} className="w-full">
                <Widget
                  {...node.data}
                  isLastNode={isLastOpenedNode && !isLastCourseNode}
                  isLoading={state.isLoading}
                  onNext={() => nextNode(course.id, node.id, 'next')}
                  onSelect={(optionId: string) => nextNode(course.id, node.id, 'quiz', optionId)}
                  onSend={(content: string) => nextNode(course.id, node.id, 'input', content)}
                />
              </div>
            )
          })}

          {isLastCourseNode && (
            <div className="flex justify-center">
              {isFinishing ? (
                <div className="animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-background/95 backdrop-blur" />
                  <div className="z-10 flex flex-col items-center">
                    <div className="animate-bounce">
                      <PartyPopper className="h-16 w-16 text-primary" />
                    </div>
                    <h1 className="animate-fade-up mt-6 text-4xl font-bold">Congratulations!</h1>
                    <p className="animate-fade-up mt-2 text-lg text-muted-foreground">
                      You've completed the course!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button size="lg" onClick={handleFinish}>
                    Finish
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => resetCourse(course.id)}>
                    Reset Course Progress
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
