import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Faq } from '../faq'
import { Footer } from '../footer'
import { Hero } from '../hero'
import { LogoCloud } from '../logo-cloud'
import { Marquee } from '../marquee'
import { Navbar } from '../navbar'
import { NewsletterForm } from '../newsletter'
import { PricingTable, type PricingPlan } from '../pricing'
import { Reveal } from '../reveal'
import { Stats } from '../stats'

describe('Navbar', () => {
  it('toggles the mobile menu and closes it with Escape', async () => {
    const user = userEvent.setup()
    render(
      <Navbar
        brand={<a href="/">momi</a>}
        links={[
          { label: 'Features', href: '#features', active: true },
          { label: 'Pricing', href: '#pricing' },
        ]}
      />,
    )
    const toggle = screen.getByRole('button', { name: 'Menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const menu = document.getElementById(toggle.getAttribute('aria-controls')!)
    expect(menu).not.toBeNull()
    expect(menu).toHaveTextContent('Pricing')
    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('link', { name: 'Features' })[0]).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

describe('Hero', () => {
  it('renders a level-1 title, actions and media', () => {
    render(
      <Hero
        animate={false}
        title="Build calm interfaces"
        description="Description"
        actions={<button type="button">Start</button>}
        media={<img alt="Screenshot" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Build calm interfaces' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByAltText('Screenshot')).toBeInTheDocument()
  })
})

describe('Reveal', () => {
  it('becomes visible even without IntersectionObserver', async () => {
    render(<Reveal data-testid="reveal">Hello</Reveal>)
    await waitFor(() => expect(screen.getByTestId('reveal')).toHaveAttribute('data-visible'))
  })
})

describe('PricingTable', () => {
  const plans: PricingPlan[] = [
    { id: 'free', name: 'Free', price: 0, features: ['One project'] },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 20, yearly: 16 },
      highlighted: true,
      badge: 'Popular',
      features: ['Everything', { label: 'SSO', included: false }],
    },
  ]

  it('switches between monthly and yearly prices', async () => {
    const user = userEvent.setup()
    render(<PricingTable plans={plans} yearlyBadge="Save 20%" />)
    expect(screen.getByText('$20')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Yearly/ }))
    expect(screen.getByRole('radio', { name: /Yearly/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('$16')).toBeInTheDocument()
    expect(screen.getByText('billed yearly')).toBeInTheDocument()
    expect(screen.getByText('Popular')).toBeInTheDocument()
  })
})

describe('NewsletterForm', () => {
  it('validates, submits and shows success', async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn().mockResolvedValue(undefined)
    render(<NewsletterForm onSubscribe={onSubscribe} />)
    const input = screen.getByRole('textbox', { name: 'Email address' })

    await user.type(input, 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(onSubscribe).not.toHaveBeenCalled()

    await user.clear(input)
    await user.type(input, 'linh@momi.dev')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(onSubscribe).toHaveBeenCalledWith('linh@momi.dev')
    expect(await screen.findByRole('status')).toHaveTextContent('Thanks!')
  })

  it('shows the error thrown by onSubscribe', async () => {
    const user = userEvent.setup()
    render(<NewsletterForm onSubscribe={() => Promise.reject(new Error('Already subscribed'))} />)
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'a@b.co')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(await screen.findByText('Already subscribed')).toBeInTheDocument()
  })
})

describe('Faq', () => {
  it('opens the default item', () => {
    render(
      <Faq
        title="FAQ"
        defaultOpen={0}
        items={[
          { question: 'First?', answer: 'Yes.' },
          { question: 'Second?', answer: 'No.' },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'First?' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Second?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})

describe('Stats', () => {
  it('exposes final values to assistive tech', () => {
    render(
      <Stats
        items={[
          { value: 12000, suffix: '+', label: 'Teams' },
          { value: '24/7', label: 'Support' },
        ]}
      />,
    )
    expect(screen.getByText('Teams')).toBeInTheDocument()
    expect(screen.getAllByText('12,000+').length).toBeGreaterThan(0)
    expect(screen.getByText('24/7')).toBeInTheDocument()
  })
})

describe('Marquee & LogoCloud', () => {
  it('hides duplicated marquee content from assistive tech', () => {
    render(
      <Marquee data-testid="marquee">
        <span>Item</span>
      </Marquee>,
    )
    const [first, copy] = Array.from(screen.getByTestId('marquee').children)
    expect(first).not.toHaveAttribute('aria-hidden')
    expect(copy).toHaveAttribute('aria-hidden', 'true')
  })

  it('names each logo', () => {
    render(<LogoCloud logos={[{ name: 'Northwind' }, { name: 'Lumen', href: '/lumen' }]} />)
    expect(screen.getByRole('img', { name: 'Northwind' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lumen' })).toHaveAttribute('href', '/lumen')
  })
})

describe('Footer', () => {
  it('renders columns, legal and social links', () => {
    render(
      <Footer
        columns={[{ title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }] }]}
        copyright="© 2026 momi"
        legal={[{ label: 'Privacy', href: '/privacy' }]}
        social={[{ label: 'Blog', href: '/blog', icon: <svg /> }]}
      />,
    )
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 momi')
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing')
    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
  })
})
