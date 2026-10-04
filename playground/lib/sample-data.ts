/** Deterministic fake data for playground demos. */

export interface Employee {
  id: string
  name: string
  email: string
  team: 'Design' | 'Engineering' | 'Marketing' | 'Sales' | 'Support'
  role: string
  location: string
  status: 'active' | 'away' | 'offline'
  salary: number
  joined: Date
  rating: number
  projects: number
}

const firstNames = [
  'Linh',
  'Minh',
  'An',
  'Bao',
  'Chi',
  'Duy',
  'Ha',
  'Khanh',
  'Lan',
  'Nam',
  'Phuong',
  'Quan',
  'Thao',
  'Trang',
  'Tuan',
  'Vy',
  'Hieu',
  'Mai',
  'Son',
  'Yen',
]
const lastNames = ['Tran', 'Nguyen', 'Pham', 'Le', 'Vo', 'Ho', 'Do', 'Dang', 'Bui', 'Hoang']
const teams: Employee['team'][] = ['Design', 'Engineering', 'Marketing', 'Sales', 'Support']
const roles: Record<Employee['team'], string[]> = {
  Design: ['Product Designer', 'Design Lead', 'UX Researcher'],
  Engineering: ['Frontend Engineer', 'Backend Engineer', 'Staff Engineer', 'QA Engineer'],
  Marketing: ['Growth Manager', 'Content Writer', 'Brand Designer'],
  Sales: ['Account Executive', 'Sales Manager', 'SDR'],
  Support: ['Support Specialist', 'Support Lead'],
}
const locations = [
  'Ho Chi Minh City',
  'Ha Noi',
  'Da Nang',
  'Singapore',
  'Tokyo',
  'Berlin',
  'Remote',
]
const statuses: Employee['status'][] = ['active', 'active', 'active', 'away', 'offline']

function random(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function makeEmployees(count: number, seed = 42): Employee[] {
  const rand = random(seed)
  const pick = <T>(items: T[]) => items[Math.floor(rand() * items.length)]
  return Array.from({ length: count }, (_, i) => {
    const first = pick(firstNames)
    const last = pick(lastNames)
    const team = pick(teams)
    return {
      id: `emp-${i + 1}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i + 1}@momi.dev`.toLowerCase(),
      team,
      role: pick(roles[team]),
      location: pick(locations),
      status: pick(statuses),
      salary: Math.round((1800 + rand() * 4200) / 50) * 50,
      joined: new Date(
        2018 + Math.floor(rand() * 8),
        Math.floor(rand() * 12),
        1 + Math.floor(rand() * 27),
      ),
      rating: Math.round((3 + rand() * 2) * 10) / 10,
      projects: 1 + Math.floor(rand() * 9),
    }
  })
}

export const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

export const shortDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
