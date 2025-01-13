import ReactMarkdown from 'react-markdown'
import { MousePointerClick } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardWidgetProps {
  imgUrlContent?: string
  imgUrlBaked?: string
  content?: string
  baked?: string
  quizOptions: {
    id: string
    label: string
  }[]
  answerId?: string
  onSelect: (optionId: string) => void
}

export function CardWidget({
  imgUrlBaked,
  imgUrlContent,
  content,
  baked,
  quizOptions,
  answerId,
  onSelect,
}: CardWidgetProps) {
  return (
    <Card className="w-full">
      <CardHeader className="p-0">
        <img
          src={imgUrlBaked || imgUrlContent}
          alt="Card"
          className="aspect-video w-full rounded-t-lg object-cover"
          loading="lazy"
        />
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="prose max-w-none dark:prose-invert">
            <ReactMarkdown>{content || baked}</ReactMarkdown>
          </div>

          <div className="grid gap-3">
            {quizOptions.map((option) => {
              const isSelected = option.id === answerId

              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={cn(
                    'flex h-auto items-center justify-between p-4 text-left',
                    isSelected && 'border-primary'
                  )}
                  disabled={!!answerId}
                  onClick={() => onSelect(option.id)}
                >
                  <span className="font-medium">{option.label}</span>
                  {isSelected && <MousePointerClick className="h-4 w-4 shrink-0 text-primary" />}
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
