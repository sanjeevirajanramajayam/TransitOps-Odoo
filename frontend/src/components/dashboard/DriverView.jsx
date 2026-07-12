import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Route, AlertTriangle, ShieldCheck, CheckCircle, ArrowRight, Clock, Settings, ChevronDown } from 'lucide-react'

export default function DriverView({ activeSubTab }) {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const mockDrivers = [
    { id: '1', name: 'Alex Rivera', status: 'Available', expiry: '2027-12-31' },
    { id: '2', name: 'John Doe', status: 'Available', expiry: '2026-07-10' },
    { id: '3', name: 'Priya Patel', status: 'On Trip', expiry: '2028-04-15' },
    { id: '4', name: 'Marcus Vance', status: 'Suspended', expiry: '2027-09-20' }
  ]

  const mockVehicles = [
    { id: '1', reg: 'TX-8902', type: 'Ford Transit Van', maxWeight: 3500, status: 'Available' },
    { id: '2', reg: 'CA-4412', type: 'Freightliner Truck', maxWeight: 15000, status: 'Available' },
    { id: '3', reg: 'NY-1029', type: 'Ram ProMaster Van', maxWeight: 4000, status: 'In Shop' },
    { id: '4', reg: 'FL-7711', type: 'Volvo VNL Semi', maxWeight: 45000, status: 'Available' }
  ]

  const [activeTrips, setActiveTrips] = useState([
    { id: 1, source: 'Dallas, TX', dest: 'Houston, TX', vehicle: 'TX-8902', driver: 'Alex Rivera', weight: '2,800 lbs', status: 'On Trip' },
    { id: 2, source: 'Los Angeles, CA', dest: 'San Jose, CA', vehicle: 'CA-4412', driver: 'Priya Patel', weight: '11,200 lbs', status: 'Dispatched' }
  ])

  const handleDispatch = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!source || !destination || !cargoWeight || !selectedVehicleId || !selectedDriverId) {
      setError('Please fill in all fields to dispatch the trip')
      return
    }

    const driver = mockDrivers.find(d => d.id === selectedDriverId)
    const vehicle = mockVehicles.find(v => v.id === selectedVehicleId)

    if (!driver || !vehicle) return

    const expiryDate = new Date(driver.expiry)
    const today = new Date()
    if (expiryDate <= today) {
      setError(`Compliance Guard: Driver ${driver.name} has an expired license (Expired: ${driver.expiry})`)
      return
    }

    if (driver.status === 'Suspended') {
      setError(`Compliance Guard: Driver ${driver.name} is currently suspended and cannot be dispatched`)
      return
    }

    if (driver.status === 'On Trip') {
      setError(`Availability Guard: Driver ${driver.name} is currently on another trip`)
      return
    }

    if (vehicle.status !== 'Available') {
      setError(`Availability Guard: Vehicle ${vehicle.reg} is currently ${vehicle.status} and unavailable`)
      return
    }

    const inputWeight = parseFloat(cargoWeight)
    if (inputWeight > vehicle.maxWeight) {
      setError(`Capacity Guard: Cargo weight (${inputWeight} lbs) exceeds the vehicle's maximum capacity (${vehicle.maxWeight} lbs for ${vehicle.reg})`)
      return
    }

    const newTrip = {
      id: Date.now(),
      source,
      dest: destination,
      vehicle: vehicle.reg,
      driver: driver.name,
      weight: `${inputWeight.toLocaleString()} lbs`,
      status: 'Dispatched'
    }

    setActiveTrips([newTrip, ...activeTrips])
    setSuccess(`Trip successfully dispatched! ${vehicle.reg} and ${driver.name} are now marked On Trip.`)
    setSource('')
    setDestination('')
    setCargoWeight('')
    setSelectedVehicleId('')
    setSelectedDriverId('')
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Active Dispatches':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Dispatch Command Form</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Initiate new dispatches. Auto-checks driver licenses, vehicle statuses, and weight limits.</CardDescription>
              </CardHeader>
              <form onSubmit={handleDispatch}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-zinc-800 dark:text-zinc-150" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-zinc-800 dark:text-zinc-150" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Origin</label>
                      <input
                        type="text"
                        placeholder="e.g. Dallas, TX"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Destination</label>
                      <input
                        type="text"
                        placeholder="e.g. Houston, TX"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-zinc-400">Cargo Weight (lbs)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-zinc-400">Assign Vehicle</label>
                    <div className="relative">
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      >
                        <option value="">Select vehicle...</option>
                        {mockVehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.reg} ({v.type}) - Max {v.maxWeight.toLocaleString()} lbs [{v.status}]
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-zinc-400">Assign Driver</label>
                    <div className="relative">
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      >
                        <option value="">Select driver...</option>
                        {mockDrivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} - Exp: {d.expiry} [{d.status}]
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-250 dark:border-zinc-800 text-sm font-semibold gap-1.5 select-none">
                    Dispatch Vehicle <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Active Fleet Trips</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Live operational routes, assigned assets, and active trip weights.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                      <th className="py-2.5 px-3">Route Details</th>
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Driver</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrips.map((trip) => (
                      <tr key={trip.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                        <td className="py-3.5 px-3 text-xs">
                          <div className="font-bold flex items-center gap-1">
                            <span>{trip.source}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{trip.dest}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-semibold text-xs">{trip.vehicle}</td>
                        <td className="py-3.5 px-3 text-xs">{trip.driver}</td>
                        <td className="py-3.5 px-3 text-xs text-xs">{trip.weight}</td>
                        <td className="py-3.5 px-3 text-xs">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )

      case 'Safety Performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-xl space-y-4">
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-zinc-800 dark:text-zinc-150" /> Compliance & Safety Index
                </CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">98 / 100</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Excellent Standing</span>
                </div>
                <p className="text-[10px] text-zinc-500">Based on geofence compliance, brake analytics, and speed limit adherence.</p>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-xl space-y-3">
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Licensing Audit Status</CardTitle>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                    <span className="text-zinc-400">CDL Class</span>
                    <span className="font-bold">CDL-A Commercial</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                    <span className="text-zinc-400">Expiration Date</span>
                    <span className="font-bold">2027-12-31 (Compliant)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Medical Certificate</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                      Active
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'My Logs':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Drive Limit (11-Hour)
                </h4>
                <div className="text-2xl font-black">08h 15m remaining</div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '75%' }}></div>
                </div>
              </Card>

              <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Duty Limit (14-Hour)
                </h4>
                <div className="text-2xl font-black">10h 30m remaining</div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '70%' }}></div>
                </div>
              </Card>

              <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> 70-Hour / 8-Day Limit
                </h4>
                <div className="text-2xl font-black">54h 20m remaining</div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '77%' }}></div>
                </div>
              </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">ELog Records</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Record of recent duty status logs reported to FMCSA gateway.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Total Distance</th>
                      <th className="py-2.5 px-3">Vehicle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                      <td className="py-3 px-3 text-xs font-semibold text-xs">2026-07-12</td>
                      <td className="py-3 px-3 text-xs">On Duty</td>
                      <td className="py-3 px-3 text-xs">3h 30m</td>
                      <td className="py-3 px-3 text-xs">180 miles</td>
                      <td className="py-3 px-3 text-xs font-mono">TX-8902</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                      <td className="py-3 px-3 text-xs font-semibold text-xs">2026-07-11</td>
                      <td className="py-3 px-3 text-xs">Off Duty</td>
                      <td className="py-3 px-3 text-xs">14h 00m</td>
                      <td className="py-3 px-3 text-xs">0 miles</td>
                      <td className="py-3 px-3 text-xs font-mono">-</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )

      case 'Settings':
        return (
          <div className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
              <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Driver Notifications Configuration</CardTitle>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 text-sm">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">ELog Alert SMS Alerts</span>
                    <span className="text-[10px] text-zinc-500 block">Triggers text notices 30 minutes before HOS break limit.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-zinc-900 dark:accent-zinc-100 h-4 w-4" />
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <div className="space-y-0.5 text-sm">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Dispatch Status Push Notifications</span>
                    <span className="text-[10px] text-zinc-500 block">Receive instant updates on newly dispatched routes.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-zinc-900 dark:accent-zinc-100 h-4 w-4" />
                </div>
              </div>
            </Card>
          </div>
        )

      default:
        return (
          <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-bold">Placeholder View: {activeSubTab}</h3>
          </div>
        )
    }
  }

  return <div className="space-y-6">{renderContent()}</div>
}
