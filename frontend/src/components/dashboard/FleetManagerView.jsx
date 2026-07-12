import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import {
  Truck, Wrench, ShieldAlert, Plus, Calendar, Settings,
  MapPin, Fuel, FileCheck, Activity,
  TrendingUp, Users, IndianRupee, AlertOctagon, Search, Map, ChevronDown
} from 'lucide-react'

export default function FleetManagerView({ activeSubTab }) {
  const [vehicles] = useState([
    { id: 1, reg: 'TX-8902', model: 'Ford Transit', type: 'Van', cap: '3,500 lbs', odo: '45,200 mi', status: 'Available' },
    { id: 2, reg: 'CA-4412', model: 'Freightliner M2', type: 'Truck', cap: '15,000 lbs', odo: '120,400 mi', status: 'On Trip' },
    { id: 3, reg: 'NY-1029', model: 'Ram ProMaster', type: 'Van', cap: '4,000 lbs', odo: '28,100 mi', status: 'In Shop' },
    { id: 4, reg: 'FL-7711', model: 'Volvo VNL 860', type: 'Semi', cap: '45,000 lbs', odo: '310,000 mi', status: 'Available' },
    { id: 5, reg: 'IL-5050', model: 'Isuzu NPR', type: 'Box Truck', cap: '10,000 lbs', odo: '95,300 mi', status: 'Retired' }
  ])

  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All')

  // Mock data using rupee values
  const trackingVehicles = [
    { id: 'TX-8902', driver: 'Alex Rivera', dest: 'Houston, TX', speed: '62 mph', status: 'On Time', battery: '98%', progress: 65 },
    { id: 'CA-4412', driver: 'Priya Patel', dest: 'San Jose, CA', speed: '55 mph', status: 'Delayed', battery: '94%', progress: 30 },
    { id: 'FL-7711', driver: 'John Doe', dest: 'Dallas, TX', speed: '0 mph', status: 'Stationary', battery: '100%', progress: 0 }
  ]

  const maintenanceLogs = [
    { id: 'M-101', reg: 'TX-8902', service: 'Oil & Filter Change', cost: '₹120', date: '2026-06-15', status: 'Completed' },
    { id: 'M-102', reg: 'NY-1029', service: 'Brake Pad Replacement', cost: '₹450', date: '2026-07-10', status: 'In Progress' },
    { id: 'M-103', reg: 'FL-7711', service: 'Tire Rotation', cost: '₹80', date: '2026-05-20', status: 'Completed' },
    { id: 'M-104', reg: 'CA-4412', service: 'Transmission Flush', cost: '₹320', date: '2026-08-01', status: 'Scheduled' }
  ]

  const fuelLogs = [
    { id: 'FL-902', reg: 'TX-8902', date: '2026-07-10', gallons: 18.4, cost: '₹68.50', mpg: 14.2 },
    { id: 'FL-903', reg: 'CA-4412', date: '2026-07-11', gallons: 45.2, cost: '₹185.00', mpg: 7.8 },
    { id: 'FL-904', reg: 'NY-1029', date: '2026-07-11', gallons: 15.0, cost: '₹55.80', mpg: 13.5 },
    { id: 'FL-905', reg: 'FL-7711', date: '2026-07-12', gallons: 120.0, cost: '₹498.00', mpg: 6.2 }
  ]

  const safetyAlerts = [
    { id: 'SA-401', reg: 'CA-4412', severity: 'Critical', event: 'Harsh Braking Detected', time: '10 mins ago', driver: 'Priya Patel' },
    { id: 'SA-402', reg: 'TX-8902', severity: 'Moderate', event: 'Speed Limit Exceeded (72/60)', time: '2 hours ago', driver: 'Alex Rivera' },
    { id: 'SA-403', reg: 'NY-1029', severity: 'Low', event: 'Idle Warning (>15 mins)', time: '1 day ago', driver: 'M. Vance' }
  ]

  const complianceDocs = [
    { id: 'C-201', name: 'Annual DOT Inspection', vehicle: 'FL-7711', expiry: '2026-10-30', status: 'Compliant' },
    { id: 'C-202', name: 'TX State Registration', vehicle: 'TX-8902', expiry: '2026-07-28', status: 'Expiring Soon' },
    { id: 'C-203', name: 'Liability Insurance Policy', vehicle: 'All Fleet', expiry: '2027-01-15', status: 'Compliant' },
    { id: 'C-204', name: 'CA Emission Exemption Permit', vehicle: 'CA-4412', expiry: '2026-06-30', status: 'Expired' }
  ]

  const fuelData = [
    { name: 'Jan', efficiency: 8.2 },
    { name: 'Feb', efficiency: 8.5 },
    { name: 'Mar', efficiency: 8.9 },
    { name: 'Apr', efficiency: 8.6 },
    { name: 'May', efficiency: 9.1 },
    { name: 'Jun', efficiency: 9.4 }
  ]

  const roiData = [
    { name: 'VAN-05', roi: 120 },
    { name: 'TRK-12', roi: 145 },
    { name: 'MINI-08', roi: 95 },
    { name: 'SEMI-02', roi: 160 },
    { name: 'BOX-04', roi: 110 }
  ]

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.reg.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.model.toLowerCase().includes(vehicleSearch.toLowerCase())
    const matchesType = vehicleTypeFilter === 'All' || v.type === vehicleTypeFilter
    const matchesStatus = vehicleStatusFilter === 'All' || v.status === vehicleStatusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // Render Sub-tab Content
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-2000">
                  <span className="text-xs uppercase font-bold tracking-wider">Fleet Health Index</span>
                  <Activity className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">94.8%</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +1.2%
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Active uptime and completed dispatches</p>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-2000">
                  <span className="text-xs uppercase font-bold tracking-wider">Avg Odometer</span>
                  <Truck className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">119.8k</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">miles</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Average mileage across all active assets</p>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-2000">
                  <span className="text-xs uppercase font-bold tracking-wider">Active Alerts</span>
                  <ShieldAlert className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">03</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">issues found</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Requires immediate dispatch review</p>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-2000">
                  <span className="text-xs uppercase font-bold tracking-wider">Acquisition ROI</span>
                  <IndianRupee className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-200">126%</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +4%
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Overall fleet returns vs target</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Fleet Fuel Efficiency Trend</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Average Miles Per Gallon (MPG) across all active assets</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fuelData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="efficiency" stroke="#27272a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Vehicle Return on Investment (ROI)</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Estimated revenue vs acquisition cost percentage</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="roi" fill="#27272a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'Vehicles':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search registration or model..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto justify-end items-center">
                {/* Custom Type Selector dropdown with arrows slightly left of the border */}
                <div className="relative w-36">
                  <select
                    value={vehicleTypeFilter}
                    onChange={(e) => setVehicleTypeFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
                  >
                    <option value="All">Type: All</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Semi">Semi</option>
                    <option value="Box Truck">Box Truck</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* Custom Status Selector dropdown */}
                <div className="relative w-36">
                  <select
                    value={vehicleStatusFilter}
                    onChange={(e) => setVehicleStatusFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
                  >
                    <option value="All">Status: All</option>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                <Button size="sm" className="h-8 text-sm font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-1.5 border border-zinc-200 dark:border-zinc-800 select-none">
                  <Plus className="h-4 w-4" /> Add Vehicle
                </Button>
              </div>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Fleet Registry</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Full inventory status, odometer counts, and load limit parameters.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                      <th className="py-3 px-4">Registration</th>
                      <th className="py-3 px-4">Model</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Max Capacity</th>
                      <th className="py-3 px-4">Odometer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((v) => (
                      <tr key={v.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                        <td className="py-3.5 px-4 font-semibold text-zinc-950 dark:text-zinc-50 text-xs">{v.reg}</td>
                        <td className="py-3.5 px-4">{v.model}</td>
                        <td className="py-3.5 px-4">{v.type}</td>
                        <td className="py-3.5 px-4">{v.cap}</td>
                        <td className="py-3.5 px-4">{v.odo}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                            v.status === 'Available' ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800' :
                            v.status === 'On Trip' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200' :
                            'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Button variant="ghost" size="sm" className="h-8 px-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )

      case 'Tracking & GPS':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Telemetry Stream */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Live Telematics</h3>
                {trackingVehicles.map((tv) => (
                  <Card key={tv.id} className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{tv.id}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Driver: {tv.driver}</p>
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                        {tv.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Route Progress</span>
                        <span>{tv.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${tv.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-center border-t border-zinc-100 dark:border-zinc-800 text-xs">
                      <div>
                        <span className="text-zinc-400 block uppercase">Speed</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{tv.speed}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase">Battery</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{tv.battery}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase">Destination</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200 truncate block px-1">{tv.dest.split(',')[0]}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map Mock */}
              <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white min-h-[400px] flex flex-col justify-between overflow-hidden relative rounded-xl shadow-inner">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-slate-950 opacity-40 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* SVG Route lines */}
                <svg className="absolute inset-0 w-full h-full text-zinc-800" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 100 Q 200 150 400 80 T 700 250" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 100 350 C 300 200 400 380 650 200" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M 50 250 H 750" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                </svg>

                {/* Map markers */}
                <div className="absolute top-[120px] left-[320px] group cursor-pointer z-10">
                  <div className="h-3 w-3 bg-zinc-400 rounded-full animate-ping absolute"></div>
                  <div className="h-3 w-3 bg-zinc-100 border border-black rounded-full relative"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[10px] font-bold py-1 px-1.5 rounded-lg shadow whitespace-nowrap opacity-90 text-white">
                    TX-8902
                  </div>
                </div>

                <div className="absolute top-[210px] left-[450px] group cursor-pointer z-10">
                  <div className="h-3 w-3 bg-zinc-400 rounded-full animate-ping absolute"></div>
                  <div className="h-3 w-3 bg-zinc-100 border border-black rounded-full relative"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[10px] font-bold py-1 px-1.5 rounded-lg shadow whitespace-nowrap opacity-90 text-white">
                    CA-4412
                  </div>
                </div>

                <div className="absolute top-[320px] left-[150px] group cursor-pointer z-10">
                  <div className="h-3 w-3 bg-zinc-300 border border-black rounded-full relative"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[10px] font-bold py-1 px-1.5 rounded-lg shadow whitespace-nowrap opacity-90 text-white">
                    FL-7711
                  </div>
                </div>

                <div className="p-4 z-10 flex justify-between bg-gradient-to-b from-black/80 to-transparent">
                  <div>
                    <h4 className="font-bold text-sm">Telemetry Vector Map</h4>
                    <p className="text-[10px] text-zinc-400">Simulation active: 3 dispatch nodes reporting</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-300 hover:text-white bg-zinc-800/80 rounded border border-zinc-700/50">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-300 hover:text-white bg-zinc-800/80 rounded border border-zinc-700/50">
                      <Map className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 z-10 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-100 inline-block animate-pulse"></span>
                    GPS Stream connected
                  </span>
                  <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-lg text-zinc-300 font-mono">
                    30.2672° N, 97.7431° W
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'Maintenance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Service Logs & Reminders</h3>
              <Button size="sm" className="h-8 text-sm font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 gap-1.5 select-none">
                <Calendar className="h-3.5 w-3.5" /> Schedule Maintenance
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Maintenance Ledger</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Uptime audits, scheduled tasks, and repair invoices.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-2.5 px-3">Service ID</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Operation Type</th>
                        <th className="py-2.5 px-3">Invoice</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceLogs.map((log) => (
                        <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                          <td className="py-3 px-3 text-xs font-semibold text-xs text-zinc-900 dark:text-zinc-50 text-xs">{log.id}</td>
                          <td className="py-3 px-3 text-xs">{log.reg}</td>
                          <td className="py-3 px-3 text-xs">{log.service}</td>
                          <td className="py-3 px-3 text-xs">{log.cost}</td>
                          <td className="py-3 px-3 text-xs text-[10px] text-zinc-500 dark:text-zinc-400">{log.date}</td>
                          <td className="py-3 px-3 text-xs">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Maintenance Health checklist */}
              <div className="space-y-4">
                <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-4">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4 text-zinc-400" /> Pending DTC Diagnostics
                  </h4>
                  <p className="text-xs text-zinc-500">Diagnostic Trouble Codes flagged via OBD-II adapters.</p>
                  
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-start gap-3">
                      <div className="p-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-mono font-bold">P0302</div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 block">Cylinder 2 Misfire</span>
                        <span className="text-[10px] text-zinc-500 block">NY-1029 • Urgent Shop Schedule</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-start gap-3">
                      <div className="p-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-mono font-bold">C0034</div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 block">Wheel Speed Sensor</span>
                        <span className="text-[10px] text-zinc-500 block">CA-4412 • Action at next rotation</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Workshop Capacity</h4>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Shop Bays In Use</span>
                    <span>1 / 4 Bays</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '25%' }}></div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'Fuel & Costs':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Recent Fuel Logs</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Verified telemetry pump purchases and gas logs.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-2.5 px-3">Log ID</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Log Date</th>
                        <th className="py-2.5 px-3">Gallons</th>
                        <th className="py-2.5 px-3">Total Cost</th>
                        <th className="py-2.5 px-3">Asset MPG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelLogs.map((log) => (
                        <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                          <td className="py-3 px-3 text-xs font-semibold text-xs text-zinc-950 dark:text-zinc-50">{log.id}</td>
                          <td className="py-3 px-3 text-xs font-bold">{log.reg}</td>
                          <td className="py-3 px-3 text-xs text-[10px] text-zinc-500 dark:text-zinc-400">{log.date}</td>
                          <td className="py-3 px-3 text-xs">{log.gallons} gal</td>
                          <td className="py-3 px-3 text-xs font-semibold text-xs text-zinc-900 dark:text-zinc-50">{log.cost}</td>
                          <td className="py-3 px-3 text-xs font-mono text-sm">{log.mpg} MPG</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-4">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Fuel className="h-4 w-4 text-zinc-400" /> Fuel Economy Metrics
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase block leading-none">Total Expense</span>
                      <span className="text-base font-black text-zinc-900 dark:text-zinc-50 block mt-1.5">₹807.30</span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase block leading-none">Carbon Offset</span>
                      <span className="text-base font-black text-zinc-800 dark:text-zinc-100 block mt-1.5">-0.82 tons</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Monthly Budget Fuel Cap</span>
                      <span>38% Used</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '38%' }}></div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'Safety & Alerts':
        return (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Safety & Event Feeds</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Real-Time Safety Event Stream</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Telemetry notifications on speed thresholds and braking forces.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {safetyAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5">
                          <ShieldAlert className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-200">{alert.event}</span>
                            <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-750 dark:text-zinc-300">
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">Vehicle: {alert.reg} • Driver: {alert.driver}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400 shrink-0 font-medium font-mono">{alert.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Safety Scoreboard */}
              <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-zinc-400" /> Driver Safety Scoreboard
                </h4>
                <p className="text-[10px] text-zinc-500">Ranked by compliance score.</p>
                
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="font-medium">1. Priya Patel</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">98 / 100</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="font-medium">2. Alex Rivera</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">92 / 100</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                    <span className="font-medium">3. Marcus Vance</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">84 / 100</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'Compliance & Docs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-2000">Compliance & Registrations</h3>
              <Button size="sm" className="h-8 text-sm font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 gap-1.5 select-none">
                <FileCheck className="h-3.5 w-3.5" /> Renew Registrations
              </Button>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">State Inspections & Certificates</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Regulatory verification dates and DOT compliance status tracker.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                      <th className="py-2.5 px-3">Doc ID</th>
                      <th className="py-2.5 px-3">Requirement / Certificate</th>
                      <th className="py-2.5 px-3">Vehicle Scope</th>
                      <th className="py-2.5 px-3">Expiration Date</th>
                      <th className="py-2.5 px-3">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceDocs.map((doc) => (
                      <tr key={doc.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                        <td className="py-3 px-3 text-xs font-semibold text-xs text-zinc-900 dark:text-zinc-50 text-xs">{doc.id}</td>
                        <td className="py-3 px-3 text-xs font-medium text-zinc-900 dark:text-zinc-200 text-xs">{doc.name}</td>
                        <td className="py-3 px-3 text-xs">{doc.vehicle}</td>
                        <td className="py-3 px-3 text-xs text-[10px] text-zinc-500 dark:text-zinc-400">{doc.expiry}</td>
                        <td className="py-3 px-3 text-xs">
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                            {doc.status}
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

      case 'Settings':
        return (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Fleet Operations Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">System Threshold Configs</CardTitle>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 block">Speed Alert Boundary (mph)</label>
                    <div className="relative">
                      <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
                        <option>70 mph</option>
                        <option>75 mph (Recommended)</option>
                        <option>80 mph</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 block">Idle Time Trigger Warning</label>
                    <div className="relative">
                      <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
                        <option>10 minutes</option>
                        <option>15 minutes</option>
                        <option>20 minutes</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 block">OBD Telemetry Ping Rate</label>
                    <div className="relative">
                      <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
                        <option>Every 5 seconds</option>
                        <option>Every 10 seconds</option>
                        <option>Every 30 seconds</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Notification Delivery Settings</CardTitle>
                
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 text-sm">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">SMS Alerts (Urgent Only)</span>
                      <span className="text-[10px] text-zinc-500 block">Sends text triggers for safety violations.</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-zinc-900 dark:accent-zinc-100 h-4 w-4" />
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                    <div className="space-y-0.5 text-sm">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Daily Dispatch PDF Summaries</span>
                      <span className="text-[10px] text-zinc-500 block">Emailed automatically at 18:00 UTC.</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-zinc-900 dark:accent-zinc-100 h-4 w-4" />
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                    <div className="space-y-0.5 text-sm">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">OBD Diagnostic DTC Pings</span>
                      <span className="text-[10px] text-zinc-500 block">Webhooks trigger to integrations API.</span>
                    </div>
                    <input type="checkbox" className="accent-zinc-900 dark:accent-zinc-100 h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900">
            <h3 className="text-xl font-bold">Placeholder View: {activeSubTab}</h3>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderSubContent()}
    </div>
  )
}
