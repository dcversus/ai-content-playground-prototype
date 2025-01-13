import ReactMarkdown from 'react-markdown'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface TextWidgetProps {
  content?: string
  baked?: string
  onNext: () => void
  isLastNode: boolean
  isLoading: boolean
}

export function TextWidget({ content, baked, onNext, isLastNode, isLoading }: TextWidgetProps) {
  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="prose p-6 dark:prose-invert">
        <ReactMarkdown>{content || baked}</ReactMarkdown>
      </CardContent>

      {isLastNode && (
        <CardFooter>
          <Button onClick={onNext} isLoading={isLoading}>
            Next
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
