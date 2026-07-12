import { useState, useEffect } from 'react'
import LoginPage from './components/auth/LoginPage'
import FleetManagerView from './components/dashboard/FleetManagerView'
import DriverView from './components/dashboard/DriverView'
import SafetyOfficerView from './components/dashboard/SafetyOfficerView'
import FinancialAnalystView from './components/dashboard/FinancialAnalystView'
import { Button } from '@/components/ui/button'
import {
  Truck, Users, Route, Landmark, Settings,
  Sun, Moon, Search, LogOut, ChevronRight,
  BarChart3, Wrench, MapPin, Fuel, ShieldAlert,
  FileCheck, ShieldCheck, Clock, TrendingUp, ChevronDown
} from 'lucide-react'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [darkMode, setDarkMode] = useState(true)

  // Sync dark class on mount and whenever darkMode state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const getSidebarItems = (role) => {
    switch (role) {
      case 'Fleet Manager':
        return [
          { name: 'Overview', icon: BarChart3 },
          { name: 'Vehicles', icon: Truck },
          { name: 'Tracking & GPS', icon: MapPin },
          { name: 'Maintenance', icon: Wrench },
          { name: 'Fuel & Costs', icon: Fuel },
          { name: 'Safety & Alerts', icon: ShieldAlert },
          { name: 'Compliance & Docs', icon: FileCheck },
          { name: 'Settings', icon: Settings }
        ]
      case 'Driver':
        return [
          { name: 'Active Dispatches', icon: Route },
          { name: 'Safety Performance', icon: ShieldCheck },
          { name: 'My Logs', icon: Clock },
          { name: 'Settings', icon: Settings }
        ]
      case 'Safety Officer':
        return [
          { name: 'Driver Profiles', icon: Users },
          { name: 'Compliance Audits', icon: FileCheck },
          { name: 'Safety Incidents', icon: ShieldAlert },
          { name: 'Settings', icon: Settings }
        ]
      case 'Financial Analyst':
        return [
          { name: 'Expense Ledger', icon: Landmark },
          { name: 'ROI Reports', icon: TrendingUp },
          { name: 'Fuel Optimization', icon: Fuel },
          { name: 'Settings', icon: Settings }
        ]
      default:
        return []
    }
  }

  const handleLogin = (role) => {
    setUserRole(role)
    setIsLoggedIn(true)
    const items = getSidebarItems(role)
    if (items.length > 0) {
      setActiveTab(items[0].name)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole('')
    setActiveTab('Overview')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (userRole) {
      case 'Fleet Manager':
        return <FleetManagerView activeSubTab={activeTab} />
      case 'Driver':
        return <DriverView activeSubTab={activeTab} />
      case 'Safety Officer':
        return <SafetyOfficerView activeSubTab={activeTab} />
      case 'Financial Analyst':
        return <FinancialAnalystView activeSubTab={activeTab} />
      default:
        return (
          <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900 shadow-sm">
            <h3 className="text-xl font-bold">Role Selector</h3>
            <p className="text-zinc-550 dark:text-zinc-450 text-base max-w-xs mx-auto">Please login to access the system.</p>
          </div>
        )
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Top Bar (Full Width) */}
      <header className="h-16 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between z-40 shrink-0 select-none">
        {/* Brand Logo - Big and Bold without icon */}
        <div className="w-64 h-full flex items-center px-6 shrink-0">
          <span className="font-black text-2xl tracking-tight text-zinc-950 dark:text-white uppercase select-none">
            TransitOps
          </span>
        </div>

        {/* Top-Right header segment */}
        <div className="flex-1 h-full flex items-center justify-between px-6">
          {/* Search box starts exactly where the sidebar ends in x-axis with a convenient rounded boxy border */}
          <div className="flex items-center gap-2.5 w-72 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 focus-within:border-zinc-400 dark:focus-within:border-zinc-700 transition-colors">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search assets, trips, or compliance docs..."
              className="bg-transparent border-none text-xs w-full focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>

          {/* User profile & light/dark mode control */}
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 tracking-wider">
              {userRole}
            </span>
            
            {/* Theme Changer - Rounded Full */}
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent text-zinc-900 dark:text-zinc-100 shrink-0">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Dummy profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-sm select-none shrink-0">
                {userRole ? userRole.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
              <div className="hidden lg:block text-left leading-none space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-55 block">Raven K.</span>
                <span className="text-[9px] text-zinc-400 block uppercase">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace: Dynamic Sidebar + Page Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation taking full height */}
        <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 h-full select-none">
          <div className="space-y-6 py-6">
            <nav className="space-y-1 px-3">
              {getSidebarItems(userRole).map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors group ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 group-hover:text-zinc-500'
                      }`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 h-9 rounded-lg gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </aside>

        {/* Content Panel with soft zinc background */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 h-full">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
