import * as React from 'react'
import { cn } from '../lib/cn'
import { CircleCheckIcon } from '../lib/icons'
import { Button } from '../components/button'
import { Input } from '../components/input'

export interface NewsletterFormProps extends Omit<
  React.ComponentProps<'form'>,
  'onSubmit' | 'children'
> {
  /** Called with a valid email. Throw / reject to show an error. */
  onSubscribe: (email: string) => void | Promise<void>
  /** @default 'you@company.com' */
  placeholder?: string
  /** @default 'Subscribe' */
  buttonLabel?: React.ReactNode
  /** @default 'Thanks! Check your inbox to confirm.' */
  successMessage?: React.ReactNode
  /** Small print under the form. */
  note?: React.ReactNode
  /** @default 'md' */
  size?: 'md' | 'lg'
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Email capture with validation, loading, success and error states. */
export function NewsletterForm({
  onSubscribe,
  placeholder = 'you@company.com',
  buttonLabel = 'Subscribe',
  successMessage = 'Thanks! Check your inbox to confirm.',
  note,
  size = 'md',
  className,
  ...props
}: NewsletterFormProps) {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<Status>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const errorId = React.useId()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!EMAIL.test(email.trim())) {
      setError('Enter a valid email address.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError(null)
    try {
      await onSubscribe(email.trim())
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        data-slot="newsletter"
        className={cn('flex items-center gap-2 text-sm font-medium text-success', className)}
      >
        <CircleCheckIcon className="size-4" />
        {successMessage}
      </div>
    )
  }

  return (
    <form
      data-slot="newsletter"
      noValidate
      onSubmit={handleSubmit}
      className={cn('grid w-full max-w-md gap-2', className)}
      {...props}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          aria-label="Email address"
          placeholder={placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={error ? errorId : undefined}
          size={size}
          className="flex-1"
        />
        <Button type="submit" size={size} loading={status === 'loading'} className="shrink-0">
          {buttonLabel}
        </Button>
      </div>
      {error ? (
        <p id={errorId} className="text-[0.8125rem] font-medium text-destructive">
          {error}
        </p>
      ) : (
        note && <p className="text-[0.8125rem] text-muted-foreground">{note}</p>
      )}
    </form>
  )
}
