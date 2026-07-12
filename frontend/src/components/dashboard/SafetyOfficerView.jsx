import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, ShieldAlert, Phone, Clock, Award } from 'lucide-react'

export default function SafetyOfficerView() {
  const [drivers, setDrivers] = useState([
    { id: 1, name: 'Alex Rivera', license: 'CDL-A-9012', expiry: '2027-12-31', contact: '+1 (555) 123-4567', safetyScore: 98, status: 'Active' },
    { id: 2, name: 'Priya Patel', license: 'CDL-A-7019', expiry: '2028-04-15', contact: '+1 (555) 987-6543', safetyScore: 95, status: 'Active' },
    { id: 3, name: 'Marcus Vance', license: 'CDL-B-2211', expiry: '2027-09-20', contact: '+1 (555) 234-5678', safetyScore: 82, status: 'Suspended' },
    { id: 4, name: 'John Doe', license: 'CDL-A-1029', expiry: '2026-07-10', contact: '+1 (555) 876-5432', safetyScore: 78, status: 'Expired' },
    { id: 5, name: 'Sarah Connor', license: 'CDL-A-3388', expiry: '2026-08-01', contact: '+1 (555) 345-6789', safetyScore: 91, status: 'Active' }
  ])

  const alerts = [
    {
      driver: 'John Doe',
      type: 'License Expired',
      date: '2026-07-10',
      description: 'Commercial CDL expired. System has blocked dispatch assignment.',
      severity: 'high'
    },
    {
      driver: 'Sarah Connor',
      type: 'License Expiring Soon',
      date: '2026-08-01',
      description: 'Commercial license expires in 20 days. Renewal notice dispatched.',
      severity: 'medium'
    },
    {
      driver: 'Marcus Vance',
      type: 'Safety Score Warning',
      date: 'N/A',
      description: 'Safety score dropped below 85. Mandatory training flag active.',
      severity: 'low'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Safety & Compliance Registry</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-sm">Monitor commercial license validities, track driver safety records, and audit operational compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg">Compliance Score</CardTitle>
              <Award className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight">92.4%</div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Average driver safety score index</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" /> Active Compliance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`p-3.5 border rounded-xl space-y-1.5 ${
                    alert.severity === 'high' ? 'bg-red-500/5 border-red-500/20 text-red-950 dark:text-red-400' :
                    alert.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/20 text-amber-950 dark:text-amber-400' :
                    'bg-slate-500/5 border-slate-500/20 text-slate-950 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">{alert.type}</span>
                    <span className="text-[10px] opacity-75">{alert.date}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-200">{alert.driver}</h4>
                  <p className="text-[11px] leading-relaxed opacity-90">{alert.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Driver Directory & Safety Records</CardTitle>
            <CardDescription>Full compliance status indices, commercial license registration logs, and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-medium">
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">CDL Number</th>
                  <th className="py-3 px-4">License Expiration</th>
                  <th className="py-3 px-4">Safety Index</th>
                  <th className="py-3 px-4">Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 block">{d.name}</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {d.contact}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{d.license}</td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {d.expiry}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          d.safetyScore >= 90 ? 'text-emerald-500' :
                          d.safetyScore >= 80 ? 'text-amber-500' :
                          'text-rose-500'
                        }`}>{d.safetyScore}</span>
                        <div className="w-16 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.safetyScore >= 90 ? 'bg-emerald-500' :
                              d.safetyScore >= 80 ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${d.safetyScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        d.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                        d.status === 'Suspended' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
