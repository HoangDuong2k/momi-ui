/**
 * Every piece of built-in text in momi-ui, grouped by component.
 * Values that need data (counts, names…) are functions so each language can word them naturally.
 */
export interface MomiMessages {
  common: {
    /** Close button of Dialog, Drawer and Toast. */
    close: string
    /** Dismiss button of Alert. */
    dismiss: string
    /** Spinner label. */
    loading: string
    /** Name of a menu opened at a point (DropdownMenu `position`). */
    menu: string
  }
  avatar: {
    /** Label of the `+N` avatar in AvatarGroup. */
    more: (count: number) => string
    online: string
    away: string
    busy: string
    offline: string
  }
  breadcrumb: {
    nav: string
    more: string
  }
  pagination: {
    nav: string
    /** Visible text on the arrow buttons. */
    previous: string
    next: string
    previousPage: string
    nextPage: string
    page: (page: number) => string
  }
  calendar: {
    previousMonth: string
    nextMonth: string
  }
  /** Key names read by screen readers for shortcuts (Kbd `keys`, menu shortcuts, tooltips). */
  shortcut: {
    command: string
    control: string
    option: string
    shift: string
    ctrl: string
    alt: string
    win: string
    super: string
    up: string
    down: string
    left: string
    right: string
    enter: string
    escape: string
    tab: string
    space: string
    backspace: string
    delete: string
    home: string
    end: string
    pageUp: string
    pageDown: string
  }
  datePicker: {
    placeholder: string
    rangePlaceholder: string
    clear: string
    /** Name of the group of preset buttons. */
    presets: string
  }
  dateTimePicker: {
    placeholder: string
    clear: string
    /** Name of the time input. */
    time: string
    timePlaceholder: string
    allDay: string
    presets: string
    /** Name of the group of suggested times. */
    suggestions: string
  }
  eventCalendar: {
    /** Default accessible name of the calendar. */
    calendar: string
    today: string
    previous: string
    next: string
    /** Name of the view switcher. */
    views: string
    month: string
    week: string
    day: string
    agenda: string
    allDay: string
    /** Button for the events that don't fit in a day. */
    more: (count: number) => string
    noEvents: string
    /** Announced instead of "button" for each event that can be moved. */
    eventRole: string
    instructions: string
    pickedUp: (event: string, when: string) => string
    moved: (event: string, when: string) => string
    dropped: (event: string, when: string) => string
    cancelled: (event: string) => string
    /** Appended to the announcement when the event can't go there. */
    notAllowed: string
  }
  combobox: {
    placeholder: string
    searchPlaceholder: string
    empty: string
    clear: string
    /** Item that creates a new option from the search text (`onCreate`). */
    create: (query: string) => string
  }
  command: {
    empty: string
    dialogTitle: string
    dialogDescription: string
  }
  fileUpload: {
    label: string
    remove: (fileName: string) => string
    uploading: (fileName: string) => string
    invalidType: (fileName: string) => string
    tooLarge: (fileName: string, maxSize: string) => string
    tooMany: (fileName: string, maxFiles: number) => string
  }
  colorPicker: {
    /** Name of the trigger button. */
    trigger: string
    /** The saturation/brightness area. */
    area: string
    areaValue: (saturation: number, brightness: number) => string
    hue: string
    alpha: string
    /** The hex / rgba text field. */
    input: string
    eyeDropper: string
    swatches: string
    swatch: (color: string) => string
  }
  numberField: {
    /** Tooltip of the drag handle. */
    dragHint: string
    resetHint: string
  }
  toast: {
    /** Name of the notifications region (announced with its F8 shortcut). */
    region: string
    clearAll: string
    clearAllLabel: (count: number) => string
  }
  dataTable: {
    empty: string
    reorderColumn: string
    expandColumn: string
    reorderRow: string
    reorderDisabled: string
    reorderHelp: string
    rowMoved: (position: number, total: number) => string
    expandRow: string
    collapseRow: string
    resizeColumn: (column: string) => string
  }
  resizable: {
    /** Accessible name of a ResizableHandle. */
    handle: string
  }
  kanban: {
    board: string
    /** Announced instead of "button" or "list item" for each card. */
    cardRole: string
    /** Fallback card name in announcements when `getItemLabel` is not set. */
    card: string
    instructions: string
    empty: string
    dropHere: string
    addCard: string
    count: (count: number, limit?: number) => string
    overLimit: string
    collapse: (column: string) => string
    expand: (column: string) => string
    pickedUp: (card: string, column: string, position: number, total: number) => string
    moved: (card: string, column: string, position: number, total: number) => string
    dropped: (card: string, column: string, position: number, total: number) => string
    cancelled: (card: string) => string
  }
  sortableList: {
    /** Announced instead of "list item" for each draggable row. */
    itemRole: string
    /** Fallback item name in announcements when `getLabel` is not set. */
    item: string
    instructions: string
    /** Label of a drag handle. */
    handle: (item: string) => string
    pickedUp: (item: string, position: number, total: number) => string
    moved: (item: string, position: number, total: number) => string
    dropped: (item: string, position: number, total: number) => string
    cancelled: (item: string) => string
  }
  lightbox: {
    /** Accessible name of the viewer dialog. */
    title: string
    previous: string
    next: string
    /** Visible counter, e.g. "3 / 12". */
    counter: (current: number, total: number) => string
    /** Announced position, e.g. "Item 3 of 12". */
    position: (current: number, total: number) => string
  }
  navbar: {
    nav: string
    menu: string
  }
  videoPlayer: {
    play: string
    pause: string
  }
  changelog: {
    new: string
    improved: string
    fixed: string
    permalink: (version: string) => string
  }
  announcementBar: {
    dismiss: string
  }
  pricing: {
    billingPeriod: string
    monthly: string
    yearly: string
    perMonth: string
    billedYearly: string
    feature: string
    included: string
    notIncluded: string
  }
  newsletter: {
    email: string
    placeholder: string
    subscribe: string
    success: string
    invalidEmail: string
    error: string
  }
  testimonials: {
    rating: (value: number, max: number) => string
  }
  team: {
    socialLink: (name: string, network: string) => string
  }
}

/** Partial messages: override any key of any group, the rest falls back. */
export type MomiMessagesInput = { [K in keyof MomiMessages]?: Partial<MomiMessages[K]> }

/** Merge partial messages over a complete set, group by group. */
export function mergeMessages(
  base: MomiMessages,
  ...overrides: Array<MomiMessagesInput | undefined>
): MomiMessages {
  const result = { ...base } as Record<keyof MomiMessages, object>
  for (const override of overrides) {
    if (!override) continue
    for (const key of Object.keys(override) as Array<keyof MomiMessages>) {
      const group = override[key]
      if (group) result[key] = { ...result[key], ...stripUndefined(group) }
    }
  }
  return result as MomiMessages
}

/** `{ next: undefined }` must not erase a default. */
function stripUndefined<T extends object>(group: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [key, value] of Object.entries(group)) {
    if (value !== undefined) out[key as keyof T] = value as T[keyof T]
  }
  return out
}
