import type * as React from 'react'
import { cn } from '../lib/cn'
import { Avatar } from '../components/avatar'
import { Reveal } from './reveal'

export interface TeamMember {
  name: string
  role?: React.ReactNode
  avatar?: string
  bio?: React.ReactNode
  links?: { label: string; href: string; icon: React.ReactNode }[]
}

const columnClasses = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

export interface TeamGridProps extends React.ComponentProps<'ul'> {
  members: TeamMember[]
  /** @default 4 */
  columns?: keyof typeof columnClasses
  /** @default 'plain' */
  variant?: 'plain' | 'cards'
}

/** People with avatar, role, short bio and social links. */
export function TeamGrid({
  members,
  columns = 4,
  variant = 'plain',
  className,
  ...props
}: TeamGridProps) {
  return (
    <ul
      data-slot="team-grid"
      className={cn('grid grid-cols-1 gap-6', columnClasses[columns], className)}
      {...props}
    >
      {members.map((member, i) => (
        <Reveal asChild key={member.name} delay={(i % columns) * 70}>
          <li
            className={cn(
              'flex flex-col items-center gap-4 text-center',
              variant === 'cards' && 'rounded-2xl border bg-card p-6 shadow-xs',
            )}
          >
            <Avatar src={member.avatar} name={member.name} size="xl" className="size-20 text-xl" />
            <div className="grid gap-1">
              <h3 className="font-semibold tracking-tight">{member.name}</h3>
              {member.role && <p className="text-sm text-primary">{member.role}</p>}
            </div>
            {member.bio && <p className="text-sm text-muted-foreground">{member.bio}</p>}
            {member.links && member.links.length > 0 && (
              <div className="flex gap-1">
                {member.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={`${member.name} on ${link.label}`}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-4"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </li>
        </Reveal>
      ))}
    </ul>
  )
}
