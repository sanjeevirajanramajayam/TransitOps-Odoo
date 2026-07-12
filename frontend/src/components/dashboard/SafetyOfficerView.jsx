import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, Clock, Award, Users, ShieldAlert, ChevronDown } from 'lucide-react'

export default function SafetyOfficerView({ activeSubTab }) {
  // Cleared mock arrays to empty arrays
  const [drivers, setDrivers] = useState([])
  const [alerts, setAlerts] = useState([])

  const fetchSafetyData = async () => {
    try {
      const dRes = await fetch('http://localhost:5000/api/v1/drivers')
      const dJson = await dRes.json()
      if (dJson.success) {
        setDrivers(dJson.data.map(d => ({
          id: d.id,
          name: d.name,
          license: d.licenseNumber,
          expiry: d.licenseExpiryDate?.split('T')[0] ?? '',
          contact: d.contactNumber,
          safetyScore: d.safetyScore ?? 100,
          status: d.status
        })))
      }

      const aRes = await fetch('http://localhost:5000/api/v1/alerts/active')
      const aJson = await aRes.json()
      if (aJson.success) {
        setAlerts(aJson.data.map(a => ({
          id: a.id,
          driver: a.driverName || 'System',
          type: a.type,
          date: a.createdAt?.split('T')[0] ?? '',
          description: a.description,
          severity: a.severity
        })))
      }
    } catch (err) {
      console.warn("Safety backend endpoints offline, running in clean empty state:", err)
    }
  }

  useEffect(() => {
    fetchSafetyData()
  }, [])

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
                  {drivers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">No driver profiles registered.</td>
                    </tr>
                  ) : (
                    drivers.map((d) => (
                      <tr key={d.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-zinc-955 dark:text-zinc-200 block">{d.name}</span>
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
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )

      case 'Compliance Audits':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Live Safety Warning Logs</CardTitle>
                <CardDescription className="text-xs text-zinc-500 font-medium">Automatic system flags triggered by speed limits or license compliance issues.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400">No active safety warnings recorded.</div>
                ) : (
                  alerts.map((alert, idx) => (
                    <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950/65 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5">
                          <ShieldAlert className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-200">{alert.type}</span>
                            <span className={'px-2 py-0.5 text-[9px] font-black rounded-full border uppercase ' + (alert.severity === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700')}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">{alert.description} • Driver: {alert.driver}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono font-bold">{alert.date}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">CDL Audit Overview</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Automatic compliance scanning runs every 24 hours checking state databases for driver record updates.
                </p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span className="text-[9px] text-zinc-400 uppercase font-black block">Active Safe Fleet Index</span>
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-50 block mt-1">94% Compliant</span>
              </div>
            </Card>
          </div>
        )

      case 'Safety Incidents':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
            <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Critical Incidents logbook</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Official log of highway collisions, property damages, or roadside citations.</CardDescription>
            <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-400">
              No safety incidents or DOT compliance flags logged this quarter.
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
