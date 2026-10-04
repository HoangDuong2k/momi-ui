import { useState } from 'react'
import { Pagination, Text } from '../../src'
import { Example } from '../components/demo'

export default function PaginationDemo() {
  const [page, setPage] = useState(5)

  return (
    <div className="space-y-12">
      <Example title="Controlled" layout="stack" className="items-center">
        <Pagination pageCount={20} page={page} onPageChange={setPage} />
        <Text size="sm" tone="muted">
          Page {page} of 20
        </Text>
      </Example>

      <Example title="Uncontrolled, few pages">
        <Pagination pageCount={5} defaultPage={2} />
      </Example>

      <Example title="Compact & small" layout="stack" className="items-center">
        <Pagination pageCount={50} defaultPage={25} size="sm" compact />
        <Pagination pageCount={50} defaultPage={25} size="sm" compact siblings={0} />
      </Example>
    </div>
  )
}
