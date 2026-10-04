import * as React from 'react'
import { cn } from '../lib/cn'
import { CircleAlertIcon, XIcon } from '../lib/icons'
import { useControllableState } from '../lib/use-controllable-state'
import { useFormControlProps } from './form-field'
import { Progress } from './progress'

export type FileRejectionReason = 'type' | 'size' | 'count'

export interface FileRejection {
  file: File
  reason: FileRejectionReason
  message: string
}

export interface FileUploadProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'size'
> {
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  /** Called with files that didn't pass `accept`, `maxSize` or `maxFiles`. */
  onReject?: (rejections: FileRejection[]) => void
  /** Max size per file in bytes. */
  maxSize?: number
  /** Max number of files in total. */
  maxFiles?: number
  /** Main text in the dropzone. */
  label?: React.ReactNode
  /** Secondary text (accepted types, size limit…). */
  description?: React.ReactNode
  /** Upload progress (0–100) per file, e.g. from your uploader. */
  getProgress?: (file: File) => number | undefined
  /** Show image thumbnails. @default true */
  showPreviews?: boolean
  dropzoneClassName?: string
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`
}

const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith('.')
        ? name.endsWith(rule)
        : rule.endsWith('/*')
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    )
}

function UploadIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 15V3" />
      <path d="m7 8 5-5 5 5" />
      <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
    </svg>
  )
}

function FileIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

function Thumbnail({ file }: { file: File }) {
  const url = React.useMemo(() => URL.createObjectURL(file), [file])
  React.useEffect(() => () => URL.revokeObjectURL(url), [url])
  return <img src={url} alt="" className="size-full object-cover" />
}

/** Drag-and-drop or browse to pick files, with validation, previews and progress. */
export function FileUpload(props: FileUploadProps) {
  const {
    value,
    defaultValue = [],
    onValueChange,
    onReject,
    accept,
    multiple = true,
    maxSize,
    maxFiles,
    label = 'Drop files here or click to browse',
    description,
    getProgress,
    showPreviews = true,
    disabled,
    className,
    dropzoneClassName,
    id: idProp,
    ...inputProps
  } = useFormControlProps(props)
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const [files, setFiles] = useControllableState<File[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [dragging, setDragging] = React.useState(false)
  const [rejections, setRejections] = React.useState<FileRejection[]>([])

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list)
    const accepted: File[] = []
    const rejected: FileRejection[] = []
    const existing = new Set(files.map(fileKey))
    const limit = multiple ? (maxFiles ?? Infinity) : 1

    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        rejected.push({ file, reason: 'type', message: `${file.name}: file type not allowed.` })
      } else if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({
          file,
          reason: 'size',
          message: `${file.name}: larger than ${formatBytes(maxSize)}.`,
        })
      } else if (!existing.has(fileKey(file))) {
        accepted.push(file)
      }
    }

    const base = multiple ? files : []
    const room = Math.max(0, limit - base.length)
    for (const file of accepted.slice(room)) {
      rejected.push({
        file,
        reason: 'count',
        message: `${file.name}: too many files (max ${limit}).`,
      })
    }
    const next = [...base, ...accepted.slice(0, room)]
    if (next.length !== files.length || next.some((f, i) => f !== files[i])) setFiles(next)
    setRejections(rejected)
    if (rejected.length) onReject?.(rejected)
  }

  const removeFile = (file: File) => setFiles(files.filter((f) => f !== file))

  return (
    <div data-slot="file-upload" className={cn('grid gap-3', className)}>
      <label
        htmlFor={id}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        onDragEnter={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!disabled && e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-muted/30 px-6 py-10 text-center transition-[background-color,border-color,box-shadow]',
          'hover:bg-muted/50 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/30',
          'data-[dragging]:border-primary data-[dragging]:bg-primary/5',
          'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
          'has-[input[aria-invalid=true]]:border-destructive',
          dropzoneClassName,
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full border bg-background shadow-xs">
          <UploadIcon className="size-4.5 text-muted-foreground" />
        </span>
        <span className="grid gap-1">
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <span className="text-[0.8125rem] text-muted-foreground">{description}</span>
          )}
        </span>
        <input
          {...inputProps}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </label>

      {rejections.length > 0 && (
        <ul role="alert" className="grid gap-1 text-[0.8125rem] text-destructive">
          {rejections.map((r) => (
            <li key={`${fileKey(r.file)}-${r.reason}`} className="flex items-center gap-1.5">
              <CircleAlertIcon className="size-3.5 shrink-0" />
              {r.message}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul data-slot="file-list" className="grid gap-2">
          {files.map((file) => {
            const progress = getProgress?.(file)
            const isImage = showPreviews && file.type.startsWith('image/')
            return (
              <li
                key={fileKey(file)}
                className="flex items-center gap-3 rounded-lg border bg-card p-2.5 pe-3 shadow-xs"
              >
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
                  {isImage ? (
                    <Thumbnail file={file} />
                  ) : (
                    <FileIcon className="size-4 text-muted-foreground" />
                  )}
                </span>
                <div className="grid min-w-0 flex-1 gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {progress !== undefined && progress < 100
                        ? `${Math.round(progress)}%`
                        : formatBytes(file.size)}
                    </span>
                  </div>
                  {progress !== undefined && progress < 100 && (
                    <Progress value={progress} size="xs" aria-label={`Uploading ${file.name}`} />
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(file)}
                  disabled={disabled}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  <XIcon className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
