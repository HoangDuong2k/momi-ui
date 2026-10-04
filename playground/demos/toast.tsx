import { Button, toast } from '../../src'
import { CodeBlock, Example } from '../components/demo'

const wait = (ms: number, fail = false) =>
  new Promise<{ name: string }>((resolve, reject) =>
    window.setTimeout(
      () => (fail ? reject(new Error('Network error')) : resolve({ name: 'Aurora' })),
      ms,
    ),
  )

export default function ToastDemo() {
  return (
    <div className="space-y-12">
      <Example
        title="Setup"
        description="Mount <Toaster /> once, then call toast() from anywhere — no hooks needed."
        layout="stack"
      >
        <CodeBlock
          code={`import { Toaster, toast } from 'momi-ui'

// root
<Toaster position="bottom-right" />

// anywhere
toast.success('Saved', { description: 'All changes stored.' })`}
        />
      </Example>

      <Example title="Tones">
        <Button
          variant="outline"
          onClick={() => toast('Event created', { description: 'Friday, 10:00 AM' })}
        >
          Default
        </Button>
        <Button variant="outline" onClick={() => toast.success('Profile updated')}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.info('New version available')}>
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning('Storage almost full', { description: '9.2 GB of 10 GB used.' })
          }
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error('Could not save', { description: 'Check your connection and try again.' })
          }
        >
          Error
        </Button>
      </Example>

      <Example title="Action, promise & persistent">
        <Button
          variant="outline"
          onClick={() =>
            toast('Message archived', {
              action: { label: 'Undo', onClick: () => toast.success('Restored') },
            })
          }
        >
          With action
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void toast
              .promise(wait(1800), {
                loading: 'Deploying…',
                success: (r) => `${r.name} is live`,
                error: 'Deploy failed',
              })
              .catch(() => {})
          }
        >
          Promise (success)
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void toast
              .promise(wait(1500, true), {
                loading: 'Uploading…',
                success: 'Uploaded',
                error: (e) => (e instanceof Error ? e.message : 'Upload failed'),
              })
              .catch(() => {})
          }
        >
          Promise (error)
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Stays until closed', { duration: Infinity })}
        >
          Persistent
        </Button>
        <Button variant="ghost" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </Example>

      <Example
        title="Clear all"
        description='With 2+ toasts open, a "Clear all" button appears next to the stack. Tune it with <Toaster clearAll={3} clearAllLabel="…" /> or turn it off with clearAll={false}.'
      >
        <Button
          onClick={() => {
            toast.success('Build completed', { duration: Infinity })
            toast.info('3 new comments', { duration: Infinity })
            toast.warning('Certificate expires in 7 days', { duration: Infinity })
            toast('Backup finished', { duration: Infinity })
          }}
        >
          Show 4 persistent toasts
        </Button>
      </Example>
    </div>
  )
}
