import { useState } from 'react'
import LoginPage from './components/auth/LoginPage'
import FleetManagerView from './components/dashboard/FleetManagerView'
import DriverView from './components/dashboard/DriverView'
import SafetyOfficerView from './components/dashboard/SafetyOfficerView'
import FinancialAnalystView from './components/dashboard/FinancialAnalystView'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Truck, Users, Route, Landmark, Settings, AlertTriangle,
  Sun, Moon, Search, LogOut, ChevronRight, BarChart3, Wrench
} from 'lucide-react'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [darkMode, setDarkMode] = useState(true)

  const handleLogin = (role) => {
    setUserRole(role)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole('')
    setActiveTab('Dashboard')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Fleet', icon: Truck },
    { name: 'Drivers', icon: Users },
    { name: 'Trips', icon: Route },
    { name: 'Maintenance', icon: Wrench },
    { name: 'Fuel & Expenses', icon: Landmark },
    { name: 'Settings', icon: Settings }
  ]

  const generalStats = [
    { title: 'Active Vehicles', value: '53', border: 'border-l-4 border-indigo-500' },
    { title: 'Available Vehicles', value: '42', border: 'border-l-4 border-emerald-500' },
    { title: 'Vehicles In Maintenance', value: '05', border: 'border-l-4 border-amber-500' },
    { title: 'Active Trips', value: '18', border: 'border-l-4 border-sky-500' },
    { title: 'Pending Trips', value: '09', border: 'border-l-4 border-blue-500' },
    { title: 'Drivers On Duty', value: '26', border: 'border-l-4 border-emerald-500' },
    { title: 'Fleet Utilization', value: '81%', border: 'border-l-4 border-emerald-500' }
  ]

  const recentTrips = [
    { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', eta: '45 min', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { id: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', eta: '-', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', eta: '1h 10m', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { id: 'TR004', vehicle: '-', driver: '-', status: 'Draft', eta: 'Awaiting vehicle', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' }
  ]

  const vehicleStatusChart = [
    { name: 'Available', percent: 65, color: 'bg-emerald-500' },
    { name: 'On Trip', percent: 25, color: 'bg-indigo-500' },
    { name: 'In Shop', percent: 8, color: 'bg-amber-500' },
    { name: 'Retired', percent: 2, color: 'bg-rose-500' }
  ]

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3">
                <select className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none">
                  <option>Vehicle Type: All</option>
                  <option>Van</option>
                  <option>Truck</option>
                  <option>Semi</option>
                </select>
                <select className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none">
                  <option>Status: All</option>
                  <option>Available</option>
                  <option>On Trip</option>
                  <option>In Shop</option>
                </select>
                <select className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none">
                  <option>Region: All</option>
                  <option>North</option>
                  <option>South</option>
                  <option>East</option>
                  <option>West</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {generalStats.map((stat, i) => (
                <Card key={i} className={`bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-3 flex flex-col justify-between shadow-sm rounded-xl ${stat.border}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                    {stat.title}
                  </span>
                  <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100 block mt-2">
                    {stat.value}
                  </span>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Operational Trips</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-medium">
                        <th className="py-2.5 px-3">Trip</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Driver</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">ETA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrips.map((trip) => (
                        <tr key={trip.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-zinc-200">{trip.id}</td>
                          <td className="py-3 px-3">{trip.vehicle}</td>
                          <td className="py-3 px-3">{trip.driver}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${trip.color}`}>
                              {trip.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-zinc-400 text-xs">{trip.eta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle Status Allocation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vehicleStatusChart.map((status, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600 dark:text-zinc-400">{status.name}</span>
                        <span className="text-slate-800 dark:text-zinc-200">{status.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${status.color}`}
                          style={{ width: `${status.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'Fleet':
        return <FleetManagerView />
      case 'Drivers':
        return <SafetyOfficerView />
      case 'Trips':
        return <DriverView />
      case 'Fuel & Expenses':
        return <FinancialAnalystView />
      default:
        return (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-bold">Placeholder View: {activeTab}</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-xs mx-auto">This panel is currently configured as a placeholder. Select another section from the navigation sidebar.</p>
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-colors duration-200 flex ${darkMode ? 'dark' : ''}`}>
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6 py-6">
          <div className="px-6 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/30">
              <Route className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">TransitOps</span>
          </div>

          <nav className="space-y-1 px-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.name
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors group ${
                    isActive ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3 w-3" />}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs uppercase">
              {userRole.substring(0, 2)}
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block leading-none">{userRole}</span>
              <span className="text-[10px] text-slate-500 block leading-none">Raven K.</span>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-9 rounded-lg gap-2"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 w-64">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search assets, trips, or routes..."
              className="bg-transparent border-none text-xs w-full focus:outline-none text-slate-800 dark:text-zinc-100 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Role: {userRole}
            </span>
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="h-9 w-9 rounded-lg border-slate-200 dark:border-zinc-800">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
