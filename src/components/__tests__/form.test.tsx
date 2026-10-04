import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from '../checkbox'
import { FormField } from '../form-field'
import { Input } from '../input'
import { NativeSelect } from '../native-select'
import { RadioGroup, RadioGroupItem } from '../radio-group'
import { Switch } from '../switch'
import { Textarea } from '../textarea'

describe('FormField', () => {
  it('wires label, description and error to the control', () => {
    render(
      <FormField label="Email" description="We never share it." error="Email is required" required>
        <Input />
      </FormField>,
    )
    const input = screen.getByLabelText(/Email/)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription('We never share it. Email is required')
  })

  it('passes disabled down and keeps explicit props', () => {
    render(
      <FormField label="Bio" disabled>
        <Textarea id="custom-bio" />
      </FormField>,
    )
    const textarea = screen.getByLabelText('Bio')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveAttribute('id', 'custom-bio')
  })

  it('labels a radio group through aria-labelledby', () => {
    render(
      <FormField label="Plan">
        <RadioGroup defaultValue="pro">
          <RadioGroupItem value="free" label="Free" />
          <RadioGroupItem value="pro" label="Pro" />
        </RadioGroup>
      </FormField>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked()
  })
})

describe('Input', () => {
  it('renders sections and pads the input', () => {
    render(<Input aria-label="Search" leftSection={<span>🔍</span>} />)
    expect(screen.getByLabelText('Search')).toHaveClass('ps-9')
  })
})

describe('NativeSelect', () => {
  it('starts on the placeholder when uncontrolled', () => {
    render(
      <NativeSelect aria-label="Country" placeholder="Select a country">
        <option value="vn">Vietnam</option>
      </NativeSelect>,
    )
    expect(screen.getByLabelText('Country')).toHaveValue('')
  })
})

describe('Checkbox', () => {
  it('toggles and is labelled by its label prop', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox label="Accept terms" onCheckedChange={onCheckedChange} />)
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' })
    await userEvent.click(screen.getByText('Accept terms'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(checkbox).toBeChecked()
  })

  it('links the description', () => {
    render(<Checkbox label="Updates" description="Product news, once a month." />)
    expect(screen.getByRole('checkbox', { name: 'Updates' })).toHaveAccessibleDescription(
      'Product news, once a month.',
    )
  })
})

describe('Switch', () => {
  it('toggles on click', async () => {
    render(<Switch label="Wi-Fi" />)
    const toggle = screen.getByRole('switch', { name: 'Wi-Fi' })
    expect(toggle).not.toBeChecked()
    await userEvent.click(toggle)
    expect(toggle).toBeChecked()
  })
})
