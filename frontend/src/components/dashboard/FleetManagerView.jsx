import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from 'recharts'
import { Truck, Wrench, ShieldAlert, Plus, Calendar, Settings } from 'lucide-react'

export default function FleetManagerView() {
  const [vehicles, setVehicles] = useState([
    { id: 1, reg: 'TX-8902', model: 'Ford Transit', type: 'Van', cap: '3,500 lbs', odo: '45,200 mi', status: 'Available' },
    { id: 2, reg: 'CA-4412', model: 'Freightliner M2', type: 'Truck', cap: '15,000 lbs', odo: '120,400 mi', status: 'On Trip' },
    { id: 3, reg: 'NY-1029', model: 'Ram ProMaster', type: 'Van', cap: '4,000 lbs', odo: '28,100 mi', status: 'In Shop' },
    { id: 4, reg: 'FL-7711', model: 'Volvo VNL 860', type: 'Semi', cap: '45,000 lbs', odo: '310,000 mi', status: 'Available' },
    { id: 5, reg: 'IL-5050', model: 'Isuzu NPR', type: 'Box Truck', cap: '10,000 lbs', odo: '95,300 mi', status: 'Retired' }
  ])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Asset Control</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm">Oversee fleet assets, active lifecycle stages, and operational efficiency analytics.</p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-lg gap-2">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
          <Button variant="outline" className="rounded-lg gap-2">
            <Calendar className="h-4 w-4" /> Schedule Maintenance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Fleet Fuel Efficiency Trend</CardTitle>
            <CardDescription>Average Miles Per Gallon (MPG) across all active assets</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Return on Investment (ROI)</CardTitle>
            <CardDescription>Estimated revenue vs acquisition cost percentage</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="roi" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Fleet Registry</CardTitle>
          <CardDescription>Full inventory status, odometer counts, and load limit parameters.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-medium">
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
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{v.reg}</td>
                  <td className="py-3.5 px-4">{v.model}</td>
                  <td className="py-3.5 px-4">{v.type}</td>
                  <td className="py-3.5 px-4">{v.cap}</td>
                  <td className="py-3.5 px-4">{v.odo}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      v.status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      v.status === 'On Trip' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                      v.status === 'In Shop' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                      'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Button variant="ghost" size="sm" className="h-8 px-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100">
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
}
