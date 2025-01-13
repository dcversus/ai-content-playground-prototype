import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenText, RotateCcw, TriangleAlert, Database, Presentation } from 'lucide-react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import { useStore, useStoreActions } from '@/app/store.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

export function Home() {
  const navigate = useNavigate()
  const { state } = useStore()
  const { resetProgress, resetCourse, addCourse, removeCourse, updateSystemContext, seedStorage } = useStoreActions()
  const [newCourseName, setNewCourseName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSystemContextOpen, setIsSystemContextOpen] = useState(false)
  const [systemContext, setSystemContext] = useState(state.systemContext || '')

  const handleUpdateSystemContext = () => {
    updateSystemContext(systemContext)
    setIsSystemContextOpen(false)
  }

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) {
      toast.error('Please enter a course name')
      return
    }

    const newCourse = {
      id: uuidv4(),
      name: newCourseName,
      description: '',
      nodes: [],
      edges: [],
      path: [],
      startNodeId: '',
    }

    addCourse(newCourse)
    setNewCourseName('')
    setIsDialogOpen(false)
    navigate(`/editor/${newCourse.id}`)
  }

  const handleDrawerOpenChange = (open: boolean) => {
    setIsSystemContextOpen(open)
    document.getElementById('root')?.setAttribute('data-dialog-open', open.toString())
  }

  return (
    <div className="flex min-h-screen flex-col items-center py-8">
      <div className="w-full max-w-4xl px-4">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Courses</h1>
            <a href="https://docs.google.com/presentation/d/1gr2txcVS-kN9JZVobuyHVlnx8ufgi_YEcX5qw4WZrDg/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <Presentation className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Drawer open={isSystemContextOpen} onOpenChange={handleDrawerOpenChange}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                  <Database className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-4xl">
                  <DrawerHeader>
                    <DrawerTitle>System Context</DrawerTitle>
                    <DrawerDescription>
                      Edit the system context that will be used for AI interactions.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-8">
                    <div className="space-y-4">
                      <Textarea
                        value={systemContext}
                        onChange={(e) => setSystemContext(e.target.value)}
                        className="h-[400px]"
                      />
                      <Button onClick={handleUpdateSystemContext} className="w-full">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Level and Context?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your current level to 0 and context. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetProgress}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Avatar>
              <AvatarFallback>{state.level}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <Alert className="mb-8">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            This is a very early prototype to show the concept of gradient content model and simple
            sandbox to show small piece of it. There will be bugs, lots of bugs, lots of them.
            Also prototype always generate content, real UX will be pre-gened and user will not wait.
            I used cheap LLM model and dont frame it. Brief presenation <a href="https://docs.google.com/presentation/d/1gr2txcVS-kN9JZVobuyHVlnx8ufgi_YEcX5qw4WZrDg/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-500">here</a>
          </AlertDescription>
        </Alert>

        {state.courses.length === 0 ? (
          <Card className="flex flex-col items-center p-8 text-center bg-muted">
            <CardHeader className="flex flex-col items-center">
              <BookOpenText className="h-12 w-12 text-muted-foreground" />
              <CardTitle className="mt-4 text-2xl">No Courses Yet</CardTitle>
              <CardDescription>
                Create your first course to start research prototype.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Button onClick={() => seedStorage()}>Seed Storage</Button>
              Or
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">Create New Course</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">Course</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="max-w-[500px] truncate">
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => navigate(`/playground/${course.id}`)}
                        >
                          {course.name}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/editor/${course.id}`)}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Reset
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Course?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will reset all progress in this course. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => resetCourse(course.id)}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Course?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the course and all its content. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-white"
                                  onClick={() => removeCourse(course.id)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {state.courses.length !== 0 && (
            <DialogTrigger asChild>
              <Button className="mt-4">Create New Course</Button>
            </DialogTrigger>
          )}

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Enter a name for your new course. You can add content and configure it later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCourse}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
