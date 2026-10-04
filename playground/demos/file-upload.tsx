import { useEffect, useRef, useState } from 'react'
import { FileUpload, FormField, toast } from '../../src'
import { Example } from '../components/demo'

const key = (f: File) => `${f.name}-${f.size}-${f.lastModified}`

export default function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const timers = useRef(new Map<string, number>())
  const done = useRef(new Map<string, number>())

  // Simulate an upload for each new file.
  useEffect(() => {
    for (const file of files) {
      const id = key(file)
      if (timers.current.has(id)) continue
      const timer = window.setInterval(() => {
        const next = Math.min(100, (done.current.get(id) ?? 0) + 8 + Math.random() * 12)
        done.current.set(id, next)
        setProgress(Object.fromEntries(done.current))
        if (next >= 100) {
          window.clearInterval(timer)
          toast.success('Uploaded', { description: file.name })
        }
      }, 250)
      timers.current.set(id, timer)
    }
  }, [files])

  useEffect(() => {
    const all = timers.current
    return () => all.forEach((t) => window.clearInterval(t))
  }, [])

  return (
    <div className="space-y-12">
      <Example
        title="Images with progress"
        description="Drop or browse up to 4 images, 2 MB each. Upload progress is simulated."
        layout="stack"
        className="max-w-lg"
      >
        <FileUpload
          accept="image/*"
          maxSize={2 * 1024 * 1024}
          maxFiles={4}
          value={files}
          onValueChange={setFiles}
          description="PNG, JPG or GIF · up to 2 MB · max 4 files"
          getProgress={(file) => progress[key(file)]}
        />
      </Example>

      <Example title="Single document in a form field" layout="stack" className="max-w-lg">
        <FormField label="Contract" description="One PDF file.">
          <FileUpload
            accept=".pdf,application/pdf"
            multiple={false}
            label="Upload PDF"
            dropzoneClassName="py-6"
          />
        </FormField>
      </Example>
    </div>
  )
}
