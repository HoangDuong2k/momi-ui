import { TriangleAlert } from 'lucide-react'
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
  Button,
  toast,
} from '../../src'
import { Example } from '../components/demo'

export default function AlertDialogDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Confirm"
        description="Only closes through its buttons or Esc — clicking outside does nothing."
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Sign out</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of momi?</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;ll need to sign in again to access your projects.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast('Signed out')}>Sign out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Example>

      <Example title="Destructive">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button tone="danger">Delete project</Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader className="items-center text-center sm:items-start sm:text-start">
              <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-5" />
              </span>
              <AlertDialogTitle>Delete “Aurora”?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the project, its deployments and all analytics data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction tone="danger" onClick={() => toast.error('Project deleted')}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Example>
    </div>
  )
}
