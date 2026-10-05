/**
 * Shared class strings for overlays and menus. Written as full class names so Tailwind detects them.
 */

/** Dimmed backdrop behind dialogs and drawers. */
export const overlayClass =
  'fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out dark:bg-black/60'

/** Floating panel surface (popover, menu, select, hover card). */
export const surfaceClass =
  'z-50 rounded-lg border border-border-strong bg-surface-raised text-popover-foreground shadow-lg outline-none'

/** Enter/exit animation that nudges in from the side the panel opens on. */
export const popAnimationClass =
  'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out data-[side=bottom]:[--momi-pop-y:-4px] data-[side=top]:[--momi-pop-y:4px] data-[side=left]:[--momi-pop-x:4px] data-[side=right]:[--momi-pop-x:-4px]'

/** Centered modal panel (Dialog, AlertDialog). */
export const modalContentClass =
  'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-xl border border-border-strong bg-surface-modal p-6 shadow-xl outline-none data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out'

export const modalHeaderClass = 'flex flex-col gap-1.5 text-start'
export const modalTitleClass = 'text-lg leading-tight font-semibold tracking-tight'
export const modalDescriptionClass = 'text-sm text-muted-foreground'
export const modalFooterClass = 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'

/* -------------------------------------------------------------------------------------------------
 * Menus (DropdownMenu, ContextMenu, Select)
 * -----------------------------------------------------------------------------------------------*/

export const menuContentClass = 'min-w-40 overflow-x-hidden overflow-y-auto p-1'

export const menuItemClass = [
  'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none',
  'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:ps-8',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
  'data-[variant=danger]:text-destructive data-[variant=danger]:data-[highlighted]:bg-destructive/10 data-[variant=danger]:data-[highlighted]:text-destructive data-[variant=danger]:[&_svg]:text-destructive!',
].join(' ')

/** Item with a check/radio indicator at the start. */
export const menuIndicatorItemClass = 'ps-8'
export const menuIndicatorClass =
  'pointer-events-none absolute start-2 flex size-4 items-center justify-center'

export const menuLabelClass =
  'px-2 py-1.5 text-xs font-medium text-muted-foreground data-[inset]:ps-8'
export const menuSeparatorClass = '-mx-1 my-1 h-px bg-border'
export const menuShortcutClass = 'ms-auto ps-4 text-xs tracking-widest text-muted-foreground'
export const menuSubTriggerClass =
  'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
