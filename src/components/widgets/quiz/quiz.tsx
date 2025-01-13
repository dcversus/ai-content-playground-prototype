import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import ReactMarkdown from 'react-markdown'

interface QuizWidgetProps {
  quizOptions: {
    id: string
    label: string
  }[]
  answerId?: string
  content?: string
  baked?: string
  onSelect: (optionId: string) => void
  isLastNode: boolean
}

export function QuizWidget({
  quizOptions,
  answerId,
  onSelect,
  isLastNode,
  content,
  baked,
}: QuizWidgetProps) {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(answerId)

  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content || baked}</ReactMarkdown>
          </div>

          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
          >
            {quizOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent"
              >
                <RadioGroupItem value={option.id} id={option.id} disabled={!!answerId}/>
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>

      {(isLastNode && selectedOption) && (
        <CardFooter className="px-6 pb-6">
          <Button
            onClick={() => onSelect(selectedOption)}
            className="w-full"
            size="lg"
          >
            Confirm Answer
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
