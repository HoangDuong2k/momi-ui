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
import ComboboxDemo from './demos/combobox'
import CommandDemo from './demos/command'
import DatePickerDemo from './demos/date-picker'
import FileUploadDemo from './demos/file-upload'
import InputOTPDemo from './demos/input-otp'
import InstallationDemo from './demos/installation'
import SliderDemo from './demos/slider'
import CtaDemo from './demos/cta'
import EffectsDemo from './demos/effects'
import FaqDemo from './demos/faq'
import FeaturesDemo from './demos/features'
import FooterDemo from './demos/footer'
import HeroDemo from './demos/hero'
import LandingPageDemo from './demos/landing-page'
import LogoCloudDemo from './demos/logo-cloud'
import NavbarDemo from './demos/navbar'
import PricingDemo from './demos/pricing'
import StatsDemo from './demos/stats'
import TeamDemo from './demos/team'
import TestimonialsDemo from './demos/testimonials'

export interface DemoEntry {
  id: string
  title: string
  group: string
  description: string
  /** Named exports shown in the import snippet. */
  imports?: string[]
  /** Highlight in the sidebar as recently added. */
  isNew?: boolean
  /** Use a wider content column (landing blocks). */
  wide?: boolean
  /** Opens as a full page outside the docs shell. */
  standalone?: boolean
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
    id: 'installation',
    title: 'Installation',
    group: 'Getting started',
    description: 'Install the package, add the styles, wire up providers and start theming.',
    isNew: true,
    component: InstallationDemo,
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
  {
    id: 'slider',
    title: 'Slider',
    group: 'Forms',
    description:
      'Pick a value or a range by dragging — with value labels, marks and vertical mode.',
    imports: ['Slider'],
    isNew: true,
    component: SliderDemo,
  },
  {
    id: 'combobox',
    title: 'Combobox',
    group: 'Forms',
    description: 'Searchable select with groups, descriptions and multiple selection.',
    imports: ['Combobox'],
    isNew: true,
    component: ComboboxDemo,
  },
  {
    id: 'date-picker',
    title: 'Calendar & Date Picker',
    group: 'Forms',
    description: 'Accessible calendar with ranges, min/max, disabled days and any locale.',
    imports: ['Calendar', 'DatePicker', 'DateRangePicker'],
    isNew: true,
    component: DatePickerDemo,
  },
  {
    id: 'input-otp',
    title: 'OTP Input',
    group: 'Forms',
    description: 'One-time codes and PINs with paste and SMS autofill support.',
    imports: ['InputOTP'],
    isNew: true,
    component: InputOTPDemo,
  },
  {
    id: 'file-upload',
    title: 'File Upload',
    group: 'Forms',
    description: 'Drag-and-drop or browse, with type/size/count validation, previews and progress.',
    imports: ['FileUpload'],
    isNew: true,
    component: FileUploadDemo,
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
    component: TableDemo,
  },
  {
    id: 'data-table',
    title: 'Data Table',
    group: 'Data display',
    description:
      'Columns + data in, everything else built in: sorting, resizable and pinned columns, pinned rows, sticky header/footer, grouped headers, cell spans, expandable rows, drag-to-reorder and virtual scrolling.',
    imports: ['DataTable', 'type DataTableColumnDef'],
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
    component: TabsDemo,
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    group: 'Navigation',
    description: 'Show where the current page sits in the hierarchy.',
    imports: ['Breadcrumb', 'BreadcrumbList', 'BreadcrumbItem', 'BreadcrumbLink', 'BreadcrumbPage'],
    component: BreadcrumbDemo,
  },
  {
    id: 'pagination',
    title: 'Pagination',
    group: 'Navigation',
    description: 'Page through long lists. Controlled or uncontrolled, with a stable layout.',
    imports: ['Pagination'],
    component: PaginationDemo,
  },

  // Disclosure
  {
    id: 'accordion',
    title: 'Accordion',
    group: 'Disclosure',
    description: 'Stacked sections that expand and collapse — great for FAQs.',
    imports: ['Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent'],
    component: AccordionDemo,
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    group: 'Disclosure',
    description: 'Show and hide a region with an animated height.',
    imports: ['Collapsible', 'CollapsibleTrigger', 'CollapsibleContent'],
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
    component: DialogDemo,
  },
  {
    id: 'alert-dialog',
    title: 'Alert Dialog',
    group: 'Overlay',
    description: 'Interrupts the user to confirm an important or destructive action.',
    imports: ['AlertDialog', 'AlertDialogContent', 'AlertDialogAction', 'AlertDialogCancel'],
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
    component: DrawerDemo,
  },
  {
    id: 'popover',
    title: 'Popover',
    group: 'Overlay',
    description: 'Rich content in a floating panel anchored to a trigger.',
    imports: ['Popover', 'PopoverTrigger', 'PopoverContent'],
    component: PopoverDemo,
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    group: 'Overlay',
    description: 'A short label on hover or focus, with one-line usage.',
    imports: ['Tooltip', 'TooltipProvider'],
    component: TooltipDemo,
  },
  {
    id: 'hover-card',
    title: 'Hover Card',
    group: 'Overlay',
    description: 'Preview content behind a link on hover.',
    imports: ['HoverCard', 'HoverCardTrigger', 'HoverCardContent'],
    component: HoverCardDemo,
  },
  {
    id: 'dropdown-menu',
    title: 'Dropdown Menu',
    group: 'Overlay',
    description:
      'Actions and options in a menu: icons, shortcuts, checkboxes, radios and submenus.',
    imports: ['DropdownMenu', 'DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem'],
    component: DropdownMenuDemo,
  },
  {
    id: 'context-menu',
    title: 'Context Menu',
    group: 'Overlay',
    description: 'A menu opened with right-click or long-press. Same API as Dropdown Menu.',
    imports: ['ContextMenu', 'ContextMenuTrigger', 'ContextMenuContent', 'ContextMenuItem'],
    component: ContextMenuDemo,
  },
  {
    id: 'command',
    title: 'Command',
    group: 'Overlay',
    description: 'Searchable command palette — inline or in a ⌘K dialog.',
    imports: ['Command', 'CommandDialog', 'CommandInput', 'CommandItem', 'useCommandShortcut'],
    isNew: true,
    component: CommandDemo,
  },

  // Feedback
  {
    id: 'alert',
    title: 'Alert',
    group: 'Feedback',
    description: 'A static callout for important messages, in six tones.',
    imports: ['Alert'],
    component: AlertDemo,
  },
  {
    id: 'toast',
    title: 'Toast',
    group: 'Feedback',
    description:
      'Brief notifications from anywhere with toast() — promise, action and swipe to dismiss.',
    imports: ['Toaster', 'toast'],
    component: ToastDemo,
  },
  {
    id: 'progress',
    title: 'Progress',
    group: 'Feedback',
    description: 'Show completion of a task, or an indeterminate wait.',
    imports: ['Progress'],
    component: ProgressDemo,
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    group: 'Feedback',
    description: 'Placeholder shapes while content loads.',
    imports: ['Skeleton', 'SkeletonText'],
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

  // Landing blocks
  {
    id: 'landing-page',
    title: 'Full landing page',
    group: 'Landing blocks',
    description: 'A complete landing page built only from momi-ui blocks.',
    isNew: true,
    standalone: true,
    component: LandingPageDemo,
  },
  {
    id: 'navbar',
    title: 'Navbar',
    group: 'Landing blocks',
    description:
      'Responsive site header with a mobile menu, plus an announcement bar for launches and news.',
    imports: ['Navbar', 'AnnouncementBar'],
    isNew: true,
    wide: true,
    component: NavbarDemo,
  },
  {
    id: 'hero',
    title: 'Hero',
    group: 'Landing blocks',
    description:
      'The opening section: badge, display title, actions and media — centered or split, with background patterns.',
    imports: ['Hero', 'HeroBadge', 'BrowserFrame'],
    isNew: true,
    wide: true,
    component: HeroDemo,
  },
  {
    id: 'logo-cloud',
    title: 'Logo Cloud & Marquee',
    group: 'Landing blocks',
    description: 'Customer logos as a grid or an endless marquee — and a marquee for any content.',
    imports: ['LogoCloud', 'Marquee'],
    isNew: true,
    wide: true,
    component: LogoCloudDemo,
  },
  {
    id: 'features',
    title: 'Features',
    group: 'Landing blocks',
    description: 'Feature grids, split rows with media, and an asymmetric bento grid.',
    imports: ['SectionHeader', 'FeatureGrid', 'FeatureSplit', 'BentoGrid', 'BentoCard'],
    isNew: true,
    wide: true,
    component: FeaturesDemo,
  },
  {
    id: 'stats',
    title: 'Stats & Steps',
    group: 'Landing blocks',
    description: 'Count-up numbers and "how it works" sequences.',
    imports: ['Stats', 'Steps', 'NumberTicker'],
    isNew: true,
    wide: true,
    component: StatsDemo,
  },
  {
    id: 'testimonials',
    title: 'Testimonials',
    group: 'Landing blocks',
    description: 'Masonry wall, featured quote and individual testimonial cards.',
    imports: ['TestimonialGrid', 'TestimonialCard', 'FeaturedTestimonial'],
    isNew: true,
    wide: true,
    component: TestimonialsDemo,
  },
  {
    id: 'pricing',
    title: 'Pricing',
    group: 'Landing blocks',
    description: 'Plan cards with a monthly/yearly toggle, and a feature comparison matrix.',
    imports: ['PricingTable', 'PricingCard', 'BillingToggle', 'PricingComparison'],
    isNew: true,
    wide: true,
    component: PricingDemo,
  },
  {
    id: 'faq',
    title: 'FAQ',
    group: 'Landing blocks',
    description: 'Questions and answers, stacked or side-by-side with the header.',
    imports: ['Faq'],
    isNew: true,
    wide: true,
    component: FaqDemo,
  },
  {
    id: 'cta',
    title: 'CTA & Newsletter',
    group: 'Landing blocks',
    description: 'Closing calls-to-action and an email capture form with all its states.',
    imports: ['Cta', 'NewsletterForm'],
    isNew: true,
    wide: true,
    component: CtaDemo,
  },
  {
    id: 'team',
    title: 'Team',
    group: 'Landing blocks',
    description: 'People with avatar, role, bio and links.',
    imports: ['TeamGrid'],
    isNew: true,
    wide: true,
    component: TeamDemo,
  },
  {
    id: 'footer',
    title: 'Footer',
    group: 'Landing blocks',
    description: 'Brand, link columns, newsletter, legal and social links.',
    imports: ['Footer'],
    isNew: true,
    wide: true,
    component: FooterDemo,
  },
  {
    id: 'effects',
    title: 'Backgrounds & Motion',
    group: 'Landing blocks',
    description: 'Background patterns, browser frame, reveal-on-scroll and number ticker.',
    imports: ['BackgroundPattern', 'BrowserFrame', 'Reveal', 'NumberTicker', 'useInView'],
    isNew: true,
    wide: true,
    component: EffectsDemo,
  },
]

export const groups = [...new Set(demos.map((d) => d.group))]

export const sources = import.meta.glob<string>('./demos/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})
