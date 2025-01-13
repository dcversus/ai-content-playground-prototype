import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface ImageWidgetProps {
  imgUrlContent: string
  imgUrlBaked: string
  onNext: () => void
  isLastNode: boolean
}

export function ImageWidget({ imgUrlContent, imgUrlBaked, onNext, isLastNode }: ImageWidgetProps) {
  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="p-0">
        <img
          src={imgUrlBaked || imgUrlContent}
          alt="Content"
          className="w-full rounded-lg object-cover"
          loading="lazy"
        />
      </CardContent>
      {isLastNode && (
        <CardFooter className="mt-4">
          <Button onClick={onNext}>Next</Button>
        </CardFooter>
      )}
    </Card>
  )
}
