import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, Clock, Award, Users, ShieldAlert, ChevronDown } from 'lucide-react'

export default function SafetyOfficerView({ activeSubTab }) {
  const [drivers] = useState([
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

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Driver Profiles':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Driver Directory & Safety Records</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Full compliance status indices, commercial license registration logs, and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">CDL Number</th>
                    <th className="py-3 px-4">License Expiration</th>
                    <th className="py-3 px-4">Safety Index</th>
                    <th className="py-3 px-4">Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-zinc-950 dark:text-zinc-200 block">{d.name}</span>
                          <span className="text-zinc-400 text-xs flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" /> {d.contact}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">{d.license}</td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          {d.expiry}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{d.safetyScore}%</span>
                          <div className="w-16 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${d.safetyScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )

      case 'Compliance Audits':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-xl space-y-4">
              <CardTitle className="text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="h-5 w-5 text-zinc-800 dark:text-zinc-200" /> Compliance Index
              </CardTitle>
              <div className="text-3xl font-extrabold tracking-tight">92.4%</div>
              <p className="text-[10px] text-zinc-400">Average driver safety score index across 5 records.</p>
            </Card>

            <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-xl space-y-3">
              <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">State Audit Reports</CardTitle>
              <div className="space-y-3 text-xs">
                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold block">DOT FMCSA Annual Review</span>
                    <span className="text-[10px] text-zinc-400">Completed on 2026-05-14</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full border border-zinc-200 dark:border-zinc-800">Pass</span>
                </div>
                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold block">ELog Compliance Check</span>
                    <span className="text-[10px] text-zinc-400">Monthly automated audit</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full border border-zinc-200 dark:border-zinc-800">98% Match</span>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'Safety Incidents':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-zinc-800 dark:text-zinc-200" /> Active Compliance Alerts
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">Violations, license expirations, and safety threshold alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, i) => (
                <div key={i} className="p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start justify-between gap-4 bg-zinc-50 dark:bg-zinc-950">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-50">{alert.type}</span>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded-full border border-zinc-250 dark:border-zinc-750">
                        {alert.severity}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">{alert.driver}</h4>
                    <p className="text-[11px] leading-relaxed text-zinc-500">{alert.description}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 font-medium font-mono">{alert.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )

      case 'Settings':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
            <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Safety Officer Settings</CardTitle>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">Safety Score Warning Threshold</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
                    <option>80%</option>
                    <option>85% (Default)</option>
                    <option>90%</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 text-sm">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Auto-Block Expired CDL Dispatches</span>
                  <span className="text-[10px] text-zinc-500 block">Prevents dispatch command submissions automatically.</span>
                </div>
                <input type="checkbox" defaultChecked className="accent-zinc-900 dark:accent-zinc-100 h-4 w-4" />
              </div>
            </div>
          </Card>
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
