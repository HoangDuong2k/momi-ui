import type { ComponentType } from 'react'
import AspectRatioDemo from './demos/aspect-ratio'
import AvatarDemo from './demos/avatar'
import BadgeDemo from './demos/badge'
import ButtonDemo from './demos/button'
import ButtonGroupDemo from './demos/button-group'
import CardDemo from './demos/card'
import CheckboxDemo from './demos/checkbox'
import FormFieldDemo from './demos/form-field'
import IconButtonDemo from './demos/icon-button'
import InputDemo from './demos/input'
import LayoutDemo from './demos/layout'
import NativeSelectDemo from './demos/native-select'
import OverviewDemo from './demos/overview'
import RadioGroupDemo from './demos/radio-group'
import SeparatorDemo from './demos/separator'
import SpinnerDemo from './demos/spinner'
import SwitchDemo from './demos/switch'
import TextareaDemo from './demos/textarea'
import TokensDemo from './demos/tokens'
import TypographyDemo from './demos/typography'

export interface DemoEntry {
  id: string
  title: string
  group: string
  description: string
  /** Named exports shown in the import snippet. */
  imports?: string[]
  component: ComponentType
}

export const demos: DemoEntry[] = [
  {
    id: 'overview',
    title: 'Overview',
    group: 'Getting started',
    description: 'A quick tour of momi-ui: real compositions built only from Phase 1 components.',
    component: OverviewDemo,
  },
  {
    id: 'tokens',
    title: 'Design tokens',
    group: 'Getting started',
    description: 'Colors, radius, type scale and elevation. Customize the accent and radius live.',
    component: TokensDemo,
  },
  {
    id: 'layout',
    title: 'Layout',
    group: 'Layout',
    description:
      'Container, Stack, Grid and Section — responsive primitives for pages and landing sections.',
    imports: ['Container', 'Stack', 'HStack', 'VStack', 'Grid', 'Section'],
    component: LayoutDemo,
  },
  {
    id: 'separator',
    title: 'Separator',
    group: 'Layout',
    description: 'A hairline divider, horizontal or vertical, optionally with a label.',
    imports: ['Separator'],
    component: SeparatorDemo,
  },
  {
    id: 'aspect-ratio',
    title: 'Aspect Ratio',
    group: 'Layout',
    description: 'Display content within a fixed ratio.',
    imports: ['AspectRatio'],
    component: AspectRatioDemo,
  },
  {
    id: 'typography',
    title: 'Typography',
    group: 'Typography',
    description: 'Heading, Text, Link, Code, Kbd and Blockquote.',
    imports: ['Heading', 'Text', 'Link', 'Code', 'Kbd', 'Blockquote'],
    component: TypographyDemo,
  },
  {
    id: 'button',
    title: 'Button',
    group: 'Buttons',
    description: 'Five variants, three tones and three sizes, with icons, loading and asChild.',
    imports: ['Button'],
    component: ButtonDemo,
  },
  {
    id: 'icon-button',
    title: 'Icon Button',
    group: 'Buttons',
    description: 'A square button for a single icon, with a required accessible label.',
    imports: ['IconButton'],
    component: IconButtonDemo,
  },
  {
    id: 'button-group',
    title: 'Button Group',
    group: 'Buttons',
    description: 'Join buttons into a segmented control, or space them apart.',
    imports: ['ButtonGroup'],
    component: ButtonGroupDemo,
  },
  {
    id: 'form-field',
    title: 'Form Field',
    group: 'Forms',
    description: 'Label, description and error for any control — with ids and ARIA wired for you.',
    imports: ['FormField'],
    component: FormFieldDemo,
  },
  {
    id: 'input',
    title: 'Input',
    group: 'Forms',
    description: 'Text input with sizes, inner sections, states and attached addons.',
    imports: ['Input', 'InputGroup', 'InputAddon'],
    component: InputDemo,
  },
  {
    id: 'textarea',
    title: 'Textarea',
    group: 'Forms',
    description: 'Multi-line input that can grow with its content.',
    imports: ['Textarea'],
    component: TextareaDemo,
  },
  {
    id: 'native-select',
    title: 'Native Select',
    group: 'Forms',
    description: 'A styled native select — fast, accessible and great on mobile.',
    imports: ['NativeSelect'],
    component: NativeSelectDemo,
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    group: 'Forms',
    description: 'Checked, unchecked and indeterminate, with label and description.',
    imports: ['Checkbox'],
    component: CheckboxDemo,
  },
  {
    id: 'radio-group',
    title: 'Radio Group',
    group: 'Forms',
    description: 'Pick one option — as a list or as selectable cards.',
    imports: ['RadioGroup', 'RadioGroupItem'],
    component: RadioGroupDemo,
  },
  {
    id: 'switch',
    title: 'Switch',
    group: 'Forms',
    description: 'An on/off toggle for settings.',
    imports: ['Switch'],
    component: SwitchDemo,
  },
  {
    id: 'card',
    title: 'Card',
    group: 'Data display',
    description: 'A surface for grouped content: header, action, content and footer.',
    imports: [
      'Card',
      'CardHeader',
      'CardTitle',
      'CardDescription',
      'CardAction',
      'CardContent',
      'CardFooter',
    ],
    component: CardDemo,
  },
  {
    id: 'badge',
    title: 'Badge',
    group: 'Data display',
    description: 'Small status labels in six semantic tones.',
    imports: ['Badge'],
    component: BadgeDemo,
  },
  {
    id: 'avatar',
    title: 'Avatar',
    group: 'Data display',
    description: 'Image with initials fallback, status indicator and stacked groups.',
    imports: ['Avatar', 'AvatarGroup'],
    component: AvatarDemo,
  },
  {
    id: 'spinner',
    title: 'Spinner',
    group: 'Feedback',
    description: 'An accessible loading indicator.',
    imports: ['Spinner'],
    component: SpinnerDemo,
  },
]

export const groups = [...new Set(demos.map((d) => d.group))]

/** Planned components, shown greyed out in the sidebar. */
export const upcoming: { group: string; items: string[] }[] = [
  {
    group: 'Phase 2',
    items: [
      'Dialog',
      'Drawer',
      'Popover',
      'Tooltip',
      'Dropdown Menu',
      'Tabs',
      'Accordion',
      'Toast',
      'Table',
    ],
  },
  {
    group: 'Phase 3 · Landing',
    items: ['Navbar', 'Hero', 'Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA', 'Footer'],
  },
]

export const sources = import.meta.glob<string>('./demos/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})
