import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface InputWidgetProps {
  content?: string
  userResponse?: string
  promptInputContent?: string
  onSend: (content: string) => void
  isLoading?: boolean
}

export function InputWidget({
  content,
  userResponse,
  promptInputContent,
  onSend,
  isLoading,
}: InputWidgetProps) {
  const [value, setValue] = useState('')

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="prose dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardHeader>

      <CardContent>
        {userResponse ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium text-muted-foreground">Your response:</div>
              <div className="mt-2 whitespace-pre-wrap">{userResponse}</div>
            </div>

            {promptInputContent && (
              <div className="rounded-lg border p-4">
                <div className="prose dark:prose-invert">
                  <ReactMarkdown>{promptInputContent}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your answer here..."
            className={cn('min-h-[200px] resize-none', isLoading && 'opacity-50')}
            disabled={isLoading}
          />
        )}
      </CardContent>

      {!userResponse && (
        <CardFooter className="flex">
          <Button
            onClick={() => onSend(value)}
            isLoading={isLoading}
            disabled={!value.trim() || isLoading}
            size="lg"
          >
            {isLoading ? 'Processing...' : 'Send'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
