import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Route, AlertTriangle, ShieldCheck, CheckCircle, ArrowRight, Clock, Settings, X, Check, MessageSquare } from 'lucide-react'

export default function DriverView({ activeSubTab }) {
  // Incoming dispatches assigned by Fleet Manager (pending driver action)
  const [pendingDispatches, setPendingDispatches] = useState([
    {
      id: 101,
      source: 'Dallas, TX',
      dest: 'Houston, TX',
      vehicle: 'TX-8902',
      vehicleModel: 'Ford Transit',
      weight: '2,800 lbs',
      assignedBy: 'Fleet Ops HQ',
      assignedAt: '2026-07-12 09:15 AM',
      status: 'Pending'
    },
    {
      id: 102,
      source: 'Austin, TX',
      dest: 'San Antonio, TX',
      vehicle: 'FL-7711',
      vehicleModel: 'Volvo VNL 860',
      weight: '18,500 lbs',
      assignedBy: 'Fleet Ops HQ',
      assignedAt: '2026-07-12 10:30 AM',
      status: 'Pending'
    },
    {
      id: 103,
      source: 'Phoenix, AZ',
      dest: 'Tucson, AZ',
      vehicle: 'CA-4412',
      vehicleModel: 'Freightliner M2',
      weight: '9,200 lbs',
      assignedBy: 'Fleet Ops HQ',
      assignedAt: '2026-07-11 03:45 PM',
      status: 'Pending'
    }
  ])

  // Accepted active trips
  const [activeTrips, setActiveTrips] = useState([
    { id: 1, source: 'Los Angeles, CA', dest: 'San Jose, CA', vehicle: 'CA-4412', weight: '11,200 lbs', status: 'On Trip', acceptedAt: '2026-07-11 08:00 AM' }
  ])

  // Rejection state
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  // History of actions
  const [dispatchHistory, setDispatchHistory] = useState([
    { id: 50, source: 'El Paso, TX', dest: 'Lubbock, TX', vehicle: 'TX-8902', action: 'Accepted', timestamp: '2026-07-10 07:30 AM', reason: null },
    { id: 51, source: 'Midland, TX', dest: 'Odessa, TX', vehicle: 'NY-1029', action: 'Rejected', timestamp: '2026-07-09 02:15 PM', reason: 'Vehicle had a tire issue reported — not safe for long haul', approvalStatus: 'Approved' }
  ])

  const handleAccept = (dispatch) => {
    // Move from pending to active
    setPendingDispatches(prev => prev.filter(d => d.id !== dispatch.id))
    setActiveTrips(prev => [{
      id: dispatch.id,
      source: dispatch.source,
      dest: dispatch.dest,
      vehicle: dispatch.vehicle,
      weight: dispatch.weight,
      status: 'On Trip',
      acceptedAt: new Date().toLocaleString()
    }, ...prev])
    setDispatchHistory(prev => [{
      id: dispatch.id,
      source: dispatch.source,
      dest: dispatch.dest,
      vehicle: dispatch.vehicle,
      action: 'Accepted',
      timestamp: new Date().toLocaleString(),
      reason: null
    }, ...prev])
  }

  const handleRejectStart = (id) => {
    setRejectingId(id)
    setRejectReason('')
    setRejectError('')
  }

  const handleRejectCancel = () => {
    setRejectingId(null)
    setRejectReason('')
    setRejectError('')
  }

  const handleRejectConfirm = (dispatch) => {
    if (!rejectReason.trim()) {
      setRejectError('A reason is required to reject a dispatch')
      return
    }
    if (rejectReason.trim().length < 10) {
      setRejectError('Please provide a more detailed reason (at least 10 characters)')
      return
    }

    setPendingDispatches(prev => prev.filter(d => d.id !== dispatch.id))
    setDispatchHistory(prev => [{
      id: dispatch.id,
      source: dispatch.source,
      dest: dispatch.dest,
      vehicle: dispatch.vehicle,
      action: 'Rejected',
      timestamp: new Date().toLocaleString(),
      reason: rejectReason.trim(),
      approvalStatus: 'Pending Manager Approval'
    }, ...prev])
    setRejectingId(null)
    setRejectReason('')
    setRejectError('')
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Active Dispatches':
        return (
          <div className="space-y-6">
            {/* Pending Incoming Dispatches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  New Dispatch Assignments
                </h3>
                {pendingDispatches.length > 0 && (
                  <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200">
                    {pendingDispatches.length} Pending
                  </span>
                )}
              </div>

              {pendingDispatches.length === 0 ? (
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No pending dispatches</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">All dispatch assignments have been handled. New ones will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pendingDispatches.map((dispatch) => (
                    <Card key={dispatch.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                            Awaiting Response
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">#{dispatch.id}</span>
                        </div>
                        <CardTitle className="text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mt-2">
                          <Route className="h-4 w-4 text-zinc-500 shrink-0" />
                          <span>{dispatch.source}</span>
                          <ArrowRight className="h-3 w-3 text-zinc-400 shrink-0" />
                          <span>{dispatch.dest}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-zinc-400 block text-[9px] uppercase font-bold tracking-wider">Vehicle</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dispatch.vehicle}</span>
                            <span className="text-[9px] text-zinc-400 block">{dispatch.vehicleModel}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[9px] uppercase font-bold tracking-wider">Cargo Weight</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dispatch.weight}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[9px] uppercase font-bold tracking-wider">Assigned By</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dispatch.assignedBy}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[9px] uppercase font-bold tracking-wider">Assigned At</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dispatch.assignedAt}</span>
                          </div>
                        </div>

                        {/* Rejection Reason Input */}
                        {rejectingId === dispatch.id && (
                          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                            <label className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Reason for Rejection (Required)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Explain why you are rejecting this dispatch (e.g., vehicle concern, schedule conflict, safety issue)..."
                              value={rejectReason}
                              onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
                            />
                            {rejectError && (
                              <div className="flex items-center gap-1.5 text-[10px] text-rose-500">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>{rejectError}</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleRejectConfirm(dispatch)}
                                size="sm"
                                className="flex-1 h-8 text-[10px] font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white border-0 gap-1"
                              >
                                <X className="h-3 w-3" /> Confirm Rejection
                              </Button>
                              <Button
                                onClick={handleRejectCancel}
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-bold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-transparent"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>

                      {/* Action Buttons (hidden when rejection form is visible) */}
                      {rejectingId !== dispatch.id && (
                        <CardFooter className="pt-0 pb-4 px-6 flex gap-2">
                          <Button
                            onClick={() => handleAccept(dispatch)}
                            size="sm"
                            className="flex-1 h-9 text-xs font-bold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 gap-1.5 select-none"
                          >
                            <Check className="h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectStart(dispatch.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 text-xs font-bold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-rose-600 dark:hover:text-rose-400 gap-1.5 select-none bg-transparent"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Active Trips */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Active Trips
              </h3>
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-3 px-4">Route</th>
                        <th className="py-3 px-4">Vehicle</th>
                        <th className="py-3 px-4">Cargo</th>
                        <th className="py-3 px-4">Accepted</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTrips.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">No active trips</td>
                        </tr>
                      ) : (
                        activeTrips.map((trip) => (
                          <tr key={trip.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                            <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                              <span className="flex items-center gap-1.5">
                                {trip.source} <ArrowRight className="h-3 w-3 text-zinc-400" /> {trip.dest}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono">{trip.vehicle}</td>
                            <td className="py-3.5 px-4">{trip.weight}</td>
                            <td className="py-3.5 px-4 text-zinc-500">{trip.acceptedAt}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full border bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200">
                                {trip.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Dispatch History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Dispatch History
              </h3>
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-3 px-4">Route</th>
                        <th className="py-3 px-4">Vehicle</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Manager Approval</th>
                        <th className="py-3 px-4">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dispatchHistory.map((entry) => (
                        <tr key={entry.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                          <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                            <span className="flex items-center gap-1.5">
                              {entry.source} <ArrowRight className="h-3 w-3 text-zinc-400" /> {entry.dest}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">{entry.vehicle}</td>
                          <td className="py-3.5 px-4">
                            <span className={entry.action === 'Accepted'
                              ? 'px-2 py-0.5 text-[9px] font-bold rounded border bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                              : 'px-2 py-0.5 text-[9px] font-bold rounded border bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                            }>
                              {entry.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px]">
                            {entry.reason ? (
                              <span className="text-zinc-500 dark:text-zinc-400 italic text-[10px] line-clamp-2">{entry.reason}</span>
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-700">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {entry.action === 'Rejected' ? (
                              <span className={
                                entry.approvalStatus === 'Approved'
                                  ? 'px-2 py-0.5 text-[9px] font-bold rounded border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                                  : entry.approvalStatus === 'Denied'
                                  ? 'px-2 py-0.5 text-[9px] font-bold rounded border bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                                  : 'px-2 py-0.5 text-[9px] font-bold rounded border bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                              }>
                                {entry.approvalStatus}
                              </span>
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-700">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 text-[10px]">{entry.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
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
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">CDL-A Commercial</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                    <span className="text-zinc-400">Expiration Date</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">2027-12-31 (Compliant)</span>
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
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">08h 15m remaining</div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '75%' }}></div>
                </div>
              </Card>

              <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Duty Limit (14-Hour)
                </h4>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">10h 30m remaining</div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '70%' }}></div>
                </div>
              </Card>

              <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> 70-Hour / 8-Day Limit
                </h4>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">54h 20m remaining</div>
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
                      <td className="py-3 px-3 font-semibold">2026-07-12</td>
                      <td className="py-3 px-3">On Duty</td>
                      <td className="py-3 px-3">3h 30m</td>
                      <td className="py-3 px-3">180 miles</td>
                      <td className="py-3 px-3 font-mono">TX-8902</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                      <td className="py-3 px-3 font-semibold">2026-07-11</td>
                      <td className="py-3 px-3">Off Duty</td>
                      <td className="py-3 px-3">14h 00m</td>
                      <td className="py-3 px-3">0 miles</td>
                      <td className="py-3 px-3 font-mono">-</td>
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

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <div className="space-y-0.5 text-sm">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Rejection Approval Notifications</span>
                    <span className="text-[10px] text-zinc-500 block">Get notified when Fleet Manager approves or denies your dispatch rejection.</span>
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
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Placeholder View: {activeSubTab}</h3>
          </div>
        )
    }
  }

  return <div className="space-y-6">{renderContent()}</div>
}
