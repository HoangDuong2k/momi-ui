import type { ComponentType } from 'react'
import AccordionDemo from './demos/accordion'
import AlertDemo from './demos/alert'
import AlertDialogDemo from './demos/alert-dialog'
import AspectRatioDemo from './demos/aspect-ratio'
import AvatarDemo from './demos/avatar'
import BadgeDemo from './demos/badge'
import BreadcrumbDemo from './demos/breadcrumb'
import ButtonDemo from './demos/button'
import ButtonGroupDemo from './demos/button-group'
import CardDemo from './demos/card'
import CheckboxDemo from './demos/checkbox'
import CollapsibleDemo from './demos/collapsible'
import ContextMenuDemo from './demos/context-menu'
import DataTableDemo from './demos/data-table'
import DialogDemo from './demos/dialog'
import DrawerDemo from './demos/drawer'
import DropdownMenuDemo from './demos/dropdown-menu'
import FormFieldDemo from './demos/form-field'
import HoverCardDemo from './demos/hover-card'
import IconButtonDemo from './demos/icon-button'
import InputDemo from './demos/input'
import LayoutDemo from './demos/layout'
import NativeSelectDemo from './demos/native-select'
import OverviewDemo from './demos/overview'
import PaginationDemo from './demos/pagination'
import PopoverDemo from './demos/popover'
import ProgressDemo from './demos/progress'
import RadioGroupDemo from './demos/radio-group'
import SelectDemo from './demos/select'
import SeparatorDemo from './demos/separator'
import SkeletonDemo from './demos/skeleton'
import SpinnerDemo from './demos/spinner'
import SwitchDemo from './demos/switch'
import TableDemo from './demos/table'
import TabsDemo from './demos/tabs'
import TextareaDemo from './demos/textarea'
import ToastDemo from './demos/toast'
import TokensDemo from './demos/tokens'
import TooltipDemo from './demos/tooltip'
import TypographyDemo from './demos/typography'

export interface DemoEntry {
  id: string
  title: string
  group: string
  description: string
  /** Named exports shown in the import snippet. */
  imports?: string[]
  /** Highlight in the sidebar as recently added. */
  isNew?: boolean
  component: ComponentType
}

export const demos: DemoEntry[] = [
  // Getting started
  {
    id: 'overview',
    title: 'Overview',
    group: 'Getting started',
    description: 'A quick tour of momi-ui: real compositions built from the library.',
    component: OverviewDemo,
  },
  {
    id: 'tokens',
    title: 'Design tokens',
    group: 'Getting started',
    description: 'Colors, radius, type scale and elevation. Customize the accent and radius live.',
    component: TokensDemo,
  },

  // Layout
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

  // Typography
  {
    id: 'typography',
    title: 'Typography',
    group: 'Typography',
    description: 'Heading, Text, Link, Code, Kbd and Blockquote.',
    imports: ['Heading', 'Text', 'Link', 'Code', 'Kbd', 'Blockquote'],
    component: TypographyDemo,
  },

  // Buttons
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

  // Forms
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
    id: 'select',
    title: 'Select',
    group: 'Forms',
    description: 'A custom-styled select with groups, keyboard navigation and typeahead.',
    imports: ['Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem'],
    isNew: true,
    component: SelectDemo,
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

  // Data display
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
    id: 'table',
    title: 'Table',
    group: 'Data display',
    description:
      'Semantic tables with card, striped, compact and sticky-header styles, plus sortable headers.',
    imports: ['Table', 'TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell'],
    isNew: true,
    component: TableDemo,
  },
  {
    id: 'data-table',
    title: 'Data Table',
    group: 'Data display',
    description:
      'Columns + data in, everything else built in: sorting, resizable and pinned columns, pinned rows, sticky header/footer, grouped headers, cell spans, expandable rows, drag-to-reorder and virtual scrolling.',
    imports: ['DataTable', 'type DataTableColumnDef'],
    isNew: true,
    component: DataTableDemo,
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

  // Navigation
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Navigation',
    description: 'Switch between views — segmented, underline or pills, horizontal or vertical.',
    imports: ['Tabs', 'TabsList', 'TabsTrigger', 'TabsContent'],
    isNew: true,
    component: TabsDemo,
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    group: 'Navigation',
    description: 'Show where the current page sits in the hierarchy.',
    imports: ['Breadcrumb', 'BreadcrumbList', 'BreadcrumbItem', 'BreadcrumbLink', 'BreadcrumbPage'],
    isNew: true,
    component: BreadcrumbDemo,
  },
  {
    id: 'pagination',
    title: 'Pagination',
    group: 'Navigation',
    description: 'Page through long lists. Controlled or uncontrolled, with a stable layout.',
    imports: ['Pagination'],
    isNew: true,
    component: PaginationDemo,
  },

  // Disclosure
  {
    id: 'accordion',
    title: 'Accordion',
    group: 'Disclosure',
    description: 'Stacked sections that expand and collapse — great for FAQs.',
    imports: ['Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent'],
    isNew: true,
    component: AccordionDemo,
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    group: 'Disclosure',
    description: 'Show and hide a region with an animated height.',
    imports: ['Collapsible', 'CollapsibleTrigger', 'CollapsibleContent'],
    isNew: true,
    component: CollapsibleDemo,
  },

  // Overlay
  {
    id: 'dialog',
    title: 'Dialog',
    group: 'Overlay',
    description: 'A modal window for focused tasks. Traps focus and closes with Esc.',
    imports: [
      'Dialog',
      'DialogTrigger',
      'DialogContent',
      'DialogHeader',
      'DialogTitle',
      'DialogFooter',
    ],
    isNew: true,
    component: DialogDemo,
  },
  {
    id: 'alert-dialog',
    title: 'Alert Dialog',
    group: 'Overlay',
    description: 'Interrupts the user to confirm an important or destructive action.',
    imports: ['AlertDialog', 'AlertDialogContent', 'AlertDialogAction', 'AlertDialogCancel'],
    isNew: true,
    component: AlertDialogDemo,
  },
  {
    id: 'drawer',
    title: 'Drawer',
    group: 'Overlay',
    description: 'A panel that slides in from any edge — filters, carts, details.',
    imports: [
      'Drawer',
      'DrawerTrigger',
      'DrawerContent',
      'DrawerHeader',
      'DrawerBody',
      'DrawerFooter',
    ],
    isNew: true,
    component: DrawerDemo,
  },
  {
    id: 'popover',
    title: 'Popover',
    group: 'Overlay',
    description: 'Rich content in a floating panel anchored to a trigger.',
    imports: ['Popover', 'PopoverTrigger', 'PopoverContent'],
    isNew: true,
    component: PopoverDemo,
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    group: 'Overlay',
    description: 'A short label on hover or focus, with one-line usage.',
    imports: ['Tooltip', 'TooltipProvider'],
    isNew: true,
    component: TooltipDemo,
  },
  {
    id: 'hover-card',
    title: 'Hover Card',
    group: 'Overlay',
    description: 'Preview content behind a link on hover.',
    imports: ['HoverCard', 'HoverCardTrigger', 'HoverCardContent'],
    isNew: true,
    component: HoverCardDemo,
  },
  {
    id: 'dropdown-menu',
    title: 'Dropdown Menu',
    group: 'Overlay',
    description:
      'Actions and options in a menu: icons, shortcuts, checkboxes, radios and submenus.',
    imports: ['DropdownMenu', 'DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem'],
    isNew: true,
    component: DropdownMenuDemo,
  },
  {
    id: 'context-menu',
    title: 'Context Menu',
    group: 'Overlay',
    description: 'A menu opened with right-click or long-press. Same API as Dropdown Menu.',
    imports: ['ContextMenu', 'ContextMenuTrigger', 'ContextMenuContent', 'ContextMenuItem'],
    isNew: true,
    component: ContextMenuDemo,
  },

  // Feedback
  {
    id: 'alert',
    title: 'Alert',
    group: 'Feedback',
    description: 'A static callout for important messages, in six tones.',
    imports: ['Alert'],
    isNew: true,
    component: AlertDemo,
  },
  {
    id: 'toast',
    title: 'Toast',
    group: 'Feedback',
    description:
      'Brief notifications from anywhere with toast() — promise, action and swipe to dismiss.',
    imports: ['Toaster', 'toast'],
    isNew: true,
    component: ToastDemo,
  },
  {
    id: 'progress',
    title: 'Progress',
    group: 'Feedback',
    description: 'Show completion of a task, or an indeterminate wait.',
    imports: ['Progress'],
    isNew: true,
    component: ProgressDemo,
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    group: 'Feedback',
    description: 'Placeholder shapes while content loads.',
    imports: ['Skeleton', 'SkeletonText'],
    isNew: true,
    component: SkeletonDemo,
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
    group: 'Phase 3 · Landing',
    items: [
      'Navbar',
      'Hero',
      'Logo Cloud',
      'Features',
      'Stats',
      'Testimonials',
      'Pricing',
      'FAQ',
      'CTA',
      'Footer',
    ],
  },
  {
    group: 'Phase 4',
    items: ['Combobox', 'Command', 'Date Picker', 'Slider', 'OTP Input', 'File Upload'],
  },
]

export const sources = import.meta.glob<string>('./demos/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})
