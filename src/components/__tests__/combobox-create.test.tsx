import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/locale-provider'
import { vi as viPack } from '../../i18n/vi'
import { Combobox, type ComboboxOption } from '../combobox'

const tags: ComboboxOption[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'bugfix', label: 'Bugfix' },
  { value: 'design', label: 'Thiết kế' },
]

function Tags({
  onCreate,
  initial = [],
  ...props
}: {
  onCreate: (query: string) => ComboboxOption | void | Promise<ComboboxOption | void>
  initial?: string[]
  renderChip?: (option: ComboboxOption, remove: () => void) => React.ReactNode
}) {
  const [value, setValue] = React.useState<string[]>(initial)
  return (
    <>
      <Combobox
        multiple
        aria-label="Tags"
        options={tags}
        value={value}
        onValueChange={setValue}
        onCreate={onCreate}
        maxBadges={5}
        {...props}
      />
      <output data-testid="value">{value.join(',')}</output>
    </>
  )
}

const open = async (user: ReturnType<typeof userEvent.setup>, name = 'Tags') => {
  await user.click(screen.getByRole('combobox', { name }))
  return screen.getByPlaceholderText('Search…')
}

describe('Combobox creating options', () => {
  it('creates a new option with Enter and selects it', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn((query: string) => ({ value: query.toLowerCase(), label: query }))
    render(<Tags onCreate={onCreate} />)
    const input = await open(user)
    await user.type(input, 'Urgent')
    expect(screen.getByRole('option', { name: 'Create “Urgent”' })).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(onCreate).toHaveBeenCalledTimes(1)
    expect(onCreate).toHaveBeenCalledWith('Urgent')
    expect(screen.getByTestId('value')).toHaveTextContent('urgent')
    // The query is cleared; the new option is listed (and checked) even before `options` has it.
    expect(input).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Urgent' })).toHaveAttribute('aria-checked', 'true')
    expect(within(screen.getByRole('combobox', { name: 'Tags' })).getByText('Urgent')).toBeVisible()
  })

  it('selects an exact match instead of creating, even when another row comes first', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Kind"
        // "Bugfix" is listed (and so active) before the exact match "Fix".
        options={[
          { value: 'bugfix', label: 'Bugfix' },
          { value: 'fix', label: 'Fix' },
        ]}
        onValueChange={onValueChange}
        onCreate={onCreate}
      />,
    )
    await user.type(await open(user, 'Kind'), 'FIX')
    expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument()
    // The highlight (what a screen reader announces) is on the row Enter picks.
    expect(screen.getByRole('option', { name: 'Fix' })).toHaveAttribute('data-highlighted')
    await user.keyboard('{Enter}')
    expect(onCreate).not.toHaveBeenCalled()
    expect(onValueChange).toHaveBeenCalledWith('fix')
  })

  it('highlights the row Enter picks, matching labels rather than values', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Country"
        options={[
          { value: 'au', label: 'Australia' },
          { value: 'ru', label: 'Russia' },
          { value: 'us', label: 'United States' },
        ]}
        onValueChange={onValueChange}
      />,
    )
    await user.type(await open(user, 'Country'), 'us')
    const highlighted = document.querySelector('[data-highlighted]')
    expect(highlighted).toHaveTextContent('Australia')
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('au')
  })

  it('reaches the create row with the arrow keys', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<Tags onCreate={onCreate} />)
    await user.type(await open(user), 'bu')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Create “bu”' })).toHaveAttribute('data-highlighted')
    await user.keyboard('{Enter}')
    expect(onCreate).toHaveBeenCalledWith('bu')
  })

  it('keeps values picked while an async create is pending', async () => {
    const user = userEvent.setup()
    let resolve: (option: ComboboxOption) => void = () => {}
    const onCreate = vi.fn(
      () =>
        new Promise<ComboboxOption>((r) => {
          resolve = r
        }),
    )
    render(<Tags onCreate={onCreate} />)
    const input = await open(user)
    await user.type(input, 'Later')
    await user.keyboard('{Enter}')
    await user.clear(input)
    await user.click(screen.getByRole('option', { name: 'Bug' }))
    expect(screen.getByTestId('value')).toHaveTextContent(/^bug$/)
    resolve({ value: 'later', label: 'Later' })
    await waitFor(() => expect(screen.getByTestId('value')).toHaveTextContent('bug,later'))
  })

  it('still picks the row the user moved to', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Kind"
        options={[
          { value: 'fix', label: 'Fix' },
          { value: 'bugfix', label: 'Bugfix' },
        ]}
        onValueChange={onValueChange}
      />,
    )
    await user.type(await open(user, 'Kind'), 'fix')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('bugfix')
  })

  it('matches exactly without diacritics', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<Tags onCreate={onCreate} />)
    await user.type(await open(user), 'thiet ke')
    expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('value')).toHaveTextContent('design')
  })

  it('creates with Enter when nothing else matches, and ignores repeats while pending', async () => {
    const user = userEvent.setup()
    let resolve: (option: ComboboxOption) => void = () => {}
    const onCreate = vi.fn(
      () =>
        new Promise<ComboboxOption>((r) => {
          resolve = r
        }),
    )
    render(<Tags onCreate={onCreate} />)
    await user.type(await open(user), 'Later')
    await user.keyboard('{Enter}{Enter}')
    expect(onCreate).toHaveBeenCalledTimes(1)
    resolve({ value: 'later', label: 'Later' })
    await waitFor(() => expect(screen.getByTestId('value')).toHaveTextContent('later'))
  })

  it('lets onCreate handle the value itself by returning nothing', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(<Tags onCreate={onCreate} />)
    const input = await open(user)
    await user.type(input, 'Draft')
    await user.click(screen.getByRole('option', { name: 'Create “Draft”' }))
    expect(onCreate).toHaveBeenCalledWith('Draft')
    expect(screen.getByTestId('value')).toHaveTextContent('')
    expect(input).toHaveValue('')
  })

  it('creates in single mode and closes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Project"
        options={tags}
        onValueChange={onValueChange}
        onCreate={(query) => ({ value: 'p-1', label: query })}
      />,
    )
    await user.type(await open(user, 'Project'), 'Website')
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('p-1')
    expect(screen.queryByPlaceholderText('Search…')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Project' })).toHaveTextContent('Website')
  })

  it('translates the create item', async () => {
    const user = userEvent.setup()
    render(
      <LocaleProvider messages={viPack}>
        <Combobox aria-label="Nhãn" options={tags} onCreate={vi.fn()} />
      </LocaleProvider>,
    )
    await user.click(screen.getByRole('combobox', { name: 'Nhãn' }))
    await user.type(screen.getByPlaceholderText('Tìm kiếm…'), 'Gấp')
    expect(screen.getByRole('option', { name: 'Tạo “Gấp”' })).toBeInTheDocument()
  })
})

describe('Combobox chips and rows', () => {
  it('removes the last selected value with Backspace in the empty search', async () => {
    const user = userEvent.setup()
    render(<Tags onCreate={vi.fn()} initial={['bug', 'design']} />)
    const input = await open(user)
    await user.type(input, 'x')
    await user.keyboard('{Backspace}')
    expect(screen.getByTestId('value')).toHaveTextContent('bug,design')
    await user.keyboard('{Backspace}')
    expect(screen.getByTestId('value')).toHaveTextContent(/^bug$/)
    await user.keyboard('{Backspace}')
    expect(screen.getByTestId('value')).toHaveTextContent('')
  })

  it('ignores Backspace auto-repeat, so holding it to clear the text keeps the values', async () => {
    const user = userEvent.setup()
    render(<Tags onCreate={vi.fn()} initial={['bug', 'design']} />)
    const input = await open(user)
    fireEvent.keyDown(input, { key: 'Backspace', repeat: true })
    expect(screen.getByTestId('value')).toHaveTextContent('bug,design')
  })

  it('renders custom chips that can remove themselves', async () => {
    const user = userEvent.setup()
    render(
      <Tags
        onCreate={vi.fn()}
        initial={['bug', 'design']}
        renderChip={(option, remove) => (
          <span data-testid="chip" style={{ color: option.value === 'bug' ? 'red' : 'blue' }}>
            {option.label}
            <span
              role="button"
              aria-label={`Remove ${option.label}`}
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                remove()
              }}
            >
              ×
            </span>
          </span>
        )}
      />,
    )
    expect(screen.getAllByTestId('chip').map((c) => c.textContent)).toEqual(['Bug×', 'Thiết kế×'])
    await user.pointer({ keys: '[MouseLeft>]', target: screen.getByLabelText('Remove Bug') })
    expect(screen.getByTestId('value')).toHaveTextContent('design')
    // Removing a chip doesn't open the list.
    expect(screen.queryByPlaceholderText('Search…')).not.toBeInTheDocument()
  })

  it('renders custom option rows and keeps the check mark', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        aria-label="Label"
        options={tags}
        defaultValue="bug"
        renderOption={(option, { selected }) => (
          <span data-testid="row">
            ● {option.label}
            {selected ? ' (on)' : ''}
          </span>
        )}
      />,
    )
    await open(user, 'Label')
    expect(screen.getAllByTestId('row').map((r) => r.textContent)).toEqual([
      '● Bug (on)',
      '● Bugfix',
      '● Thiết kế',
    ])
    expect(screen.getByRole('option', { name: /Bug \(on\)/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})
