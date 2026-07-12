import prisma from './db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

const DEMO_USERS = [
  { email: 'fleet@transitops.com',    password: 'demo1234', name: 'Alex Rivera',   role: UserRole.FleetManager },
  { email: 'safety@transitops.com',   password: 'demo1234', name: 'Sarah Connor',  role: UserRole.SafetyOfficer },
  { email: 'finance@transitops.com',  password: 'demo1234', name: 'Priya Patel',   role: UserRole.FinancialAnalyst },
  { email: 'dispatch@transitops.com', password: 'demo1234', name: 'Marcus Vance',  role: UserRole.Dispatcher },
]

async function seed() {
  for (const u of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      console.log(`[SKIP] ${u.email} already exists`)
      continue
    }
    const hashed = await bcrypt.hash(u.password, 10)
    await prisma.user.create({ data: { email: u.email, password: hashed, name: u.name, role: u.role } })
    console.log(`[OK]   Created ${u.role} — ${u.email}`)
  }
  console.log('Seed complete.')
  await prisma.$disconnect()
}

seed().catch(e => { console.error(e); process.exit(1) })
