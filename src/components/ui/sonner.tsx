import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      offset={16}
      expand={false}
      richColors
      toastOptions={{
        duration: 3000,
        classNames: {
          toast: [
            "group",
            "toast",
            "group-[.toaster]:bg-background",
            "group-[.toaster]:text-foreground",
            "group-[.toaster]:border-border",
            "group-[.toaster]:shadow-lg",
            "group-[.toaster]:rounded-lg",
            "group-[.toaster]:p-4",
          ].join(" "),
          description: [
            "group-[.toast]:text-muted-foreground",
            "group-[.toast]:text-sm",
          ].join(" "),
          actionButton: [
            "group-[.toast]:bg-primary",
            "group-[.toast]:text-primary-foreground",
            "group-[.toast]:rounded-md",
            "group-[.toast]:px-2",
            "group-[.toast]:py-1",
            "group-[.toast]:text-xs",
          ].join(" "),
          cancelButton: [
            "group-[.toast]:bg-muted",
            "group-[.toast]:text-muted-foreground",
            "group-[.toast]:rounded-md",
            "group-[.toast]:px-2",
            "group-[.toast]:py-1",
            "group-[.toast]:text-xs",
          ].join(" "),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
