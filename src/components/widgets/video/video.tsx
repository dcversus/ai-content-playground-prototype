import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface VideoWidgetProps {
  videoUrlBaked: string
  onNext: () => void
  isLastNode: boolean
}

export function VideoWidget({ videoUrlBaked, onNext, isLastNode }: VideoWidgetProps) {
  const videoUrl = videoUrlBaked;
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')

  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="p-0">
        {isYouTube ? (
          <iframe
            src={videoUrl.replace('watch?v=', 'embed/')}
            className="aspect-video w-full rounded-lg"
            allowFullScreen
          />
        ) : (
          <video src={videoUrl} controls className="aspect-video w-full rounded-lg" />
        )}
      </CardContent>

      {isLastNode && (
        <CardFooter className="mt-4">
          <Button onClick={onNext}>Next</Button>
        </CardFooter>
      )}
    </Card>
  )
}
