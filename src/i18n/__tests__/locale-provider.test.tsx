import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Calendar } from '../../components/calendar'
import { DataTable } from '../../components/data-table'
import { FileUpload } from '../../components/file-upload'
import { Pagination } from '../../components/pagination'
import { en } from '../en'
import { LocaleProvider, useMessages } from '../locale-provider'
import { mergeMessages } from '../messages'
import { vi } from '../vi'

describe('i18n', () => {
  it('uses English without a provider', () => {
    render(<Pagination pageCount={3} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
  })

  it('translates built-in labels with a message pack', () => {
    render(
      <LocaleProvider messages={vi}>
        <Pagination pageCount={3} />
        <DataTable data={[]} columns={[{ id: 'name', header: 'Name', accessor: () => '' }]} />
      </LocaleProvider>,
    )
    expect(screen.getByRole('navigation', { name: 'Phân trang' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trang sau' })).toHaveTextContent('Sau')
    expect(screen.getByRole('button', { name: 'Trang 2' })).toBeInTheDocument()
    expect(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
  })

  it('merges nested providers and lets the labels prop win', () => {
    render(
      <LocaleProvider messages={vi}>
        <LocaleProvider messages={{ pagination: { nextPage: 'Tiếp theo' } }}>
          <Pagination pageCount={3} />
          <Pagination pageCount={3} labels={{ nav: 'Kết quả', previousPage: 'Lùi' }} />
        </LocaleProvider>
      </LocaleProvider>,
    )
    expect(screen.getAllByRole('button', { name: 'Tiếp theo' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Kết quả' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lùi' })).toBeInTheDocument()
  })

  it('formats dates with the provider locale', () => {
    const month = new Date(2026, 0, 1)
    render(
      <LocaleProvider locale="vi-VN" messages={vi}>
        <Calendar defaultMonth={month} />
      </LocaleProvider>,
    )
    const expected = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
      month,
    )
    expect(screen.getByRole('grid', { name: expected })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tháng sau' })).toBeInTheDocument()
  })

  it('translates messages that take values', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(
      <LocaleProvider messages={vi}>
        <FileUpload accept="image/*" aria-label="Ảnh" />
      </LocaleProvider>,
    )
    expect(screen.getByText('Kéo thả tệp vào đây hoặc bấm để chọn')).toBeInTheDocument()
    const notes = new File(['x'], 'notes.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('Ảnh'), notes)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'notes.txt: định dạng tệp không được hỗ trợ.',
    )
  })

  it('exposes messages to custom components', () => {
    function CloseText() {
      return <span>{useMessages('common').close}</span>
    }
    render(
      <LocaleProvider messages={vi}>
        <CloseText />
      </LocaleProvider>,
    )
    expect(screen.getByText('Đóng')).toBeInTheDocument()
  })

  it('ignores undefined overrides when merging', () => {
    const merged = mergeMessages(en, { pagination: { next: undefined, previous: 'Back' } })
    expect(merged.pagination.next).toBe('Next')
    expect(merged.pagination.previous).toBe('Back')
    expect(en.pagination.previous).toBe('Previous')
  })

  it('ships a complete Vietnamese pack', () => {
    for (const group of Object.keys(en) as Array<keyof typeof en>) {
      expect(Object.keys(vi[group]).sort()).toEqual(Object.keys(en[group]).sort())
    }
  })
})
