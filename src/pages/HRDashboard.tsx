import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Shield, CheckCircle, AlertTriangle, FileText, Users, Clock, BarChart3, Calendar, Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockCases, mockDeadlines } from "@/lib/mockData";

/**
 * HRDashboard (redesign)
 *
 * Goals
 * - Mirror FileComplaint’s calm, trustworthy visual language (white cards, gray borders, clear hierarchy)
 * - Trauma‑informed + accessible patterns: clear headings, status legends, keyboardable controls, WCAG‑friendly color use
 * - Trust & transparency: compliance banner, SLA hints, system status, n8n activity surfaced
 * - Progressive disclosure: quick filters first, details on demand
 */

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  investigating: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

function StatusPill({ label, tone }: { label: string; tone: keyof typeof STATUS_COLORS }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[tone]}`}>
      {tone === "new" && <FileText className="h-3 w-3" aria-hidden />}
      {tone === "investigating" && <Users className="h-3 w-3" aria-hidden />}
      {tone === "resolved" && <CheckCircle className="h-3 w-3" aria-hidden />}
      {label}
    </span>
  );
}

function PriorityPill({ level }: { level: keyof typeof PRIORITY_COLORS }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${PRIORITY_COLORS[level]}`}>
      {level.toUpperCase()}
    </span>
  );
}

export default function HRDashboard() {
  const [notifications] = useState(3);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const filteredCases = useMemo(() => {
    return mockCases
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => (priorityFilter === "all" ? true : c.priority === priorityFilter))
      .filter((c) =>
        query.trim().length
          ? [c.id, c.department, c.complainant].join(" ").toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => {
        if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "deadline") return (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999);
        if (sortBy === "priority") {
          const order = { high: 0, medium: 1, low: 2 } as const;
          return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
        }
        return 0;
      });
  }, [statusFilter, priorityFilter, query, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Nav (mirrors FileComplaint tone) */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3" aria-label="Primary">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-lg font-semibold text-gray-900">Company Portal</div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/hr-services" className="text-gray-600 hover:text-gray-900">HR Services</Link>
              <Link to="/file-complaint" className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium">Report a Concern</Link>
              <Link to="/resources" className="text-gray-600 hover:text-gray-900">Resources</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" aria-live="polite" aria-label="Notifications">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {notifications}
              </div>
            </div>
            <div className="text-gray-700 font-medium">Sarah Chen</div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Confidentiality / Compliance banner */}
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600" aria-hidden />
            <div>
              <h2 className="font-medium text-gray-900">Confidential HR Workspace</h2>
              <p className="text-sm text-gray-600">Access is audited. Please handle all case data according to company policy and local regulations. If you need support, contact the POSH Committee immediately.</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-8 grid gap-4 md:grid-cols-4" role="region" aria-label="Key performance indicators">
          {[
            { value: "+60%", label: "Reporting Rate Increase" },
            { value: "75%", label: "Faster Processing" },
            { value: "100%", label: "Compliance Rate" },
            { value: "4.7/5", label: "User Satisfaction" },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-sm text-gray-600">{kpi.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900"><Filter className="h-5 w-5" /> Case Filters</CardTitle>
            <CardDescription>Refine visible cases. All controls are keyboard accessible.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="case-search" className="sr-only">Search cases</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="case-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by case ID, department, or complainant..."
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label className="mb-1 block text-sm text-gray-700">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block text-sm text-gray-700">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block text-sm text-gray-700">Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Recent" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="deadline">Soonest deadline</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active cases */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900"><FileText className="h-5 w-5" /> Active Cases</CardTitle>
              <CardDescription>Open and in‑progress cases. Use filters above to refine the list.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredCases.length === 0 && (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-gray-600">
                  No cases match your filters. Adjust filters or <Link to="/file-complaint" className="underline">file a new complaint</Link>.
                </div>
              )}

              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
                  role="group"
                  aria-label={`Case ${c.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-gray-900">{c.id}</h3>
                        <PriorityPill level={c.priority} />
                        <StatusPill label={c.status} tone={c.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600">{c.department} • Complainant: {c.complainant}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Opened {new Date(c.createdAt).toLocaleDateString()}</span>
                        {typeof c.daysRemaining === "number" && (
                          <Badge variant={c.daysRemaining < 7 ? "destructive" : c.daysRemaining < 30 ? "secondary" : "outline"}>
                            {c.daysRemaining} days to SLA
                          </Badge>
                        )}
                        {c.hasUnseenUpdates && (
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200" variant="outline">Update available</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button size="sm" className="bg-gray-900 text-white hover:bg-black" asChild>
                        <Link to={`/human-review/${c.id}`}>Open</Link>
                      </Button>
                      <Button size="sm" variant="outline">Assign</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance & deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900"><Clock className="h-5 w-5" /> Compliance Status</CardTitle>
              <CardDescription>Deadline tracking and compliance monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDeadlines.map((d) => (
                <div key={d.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="font-medium text-gray-900">{d.caseId}</div>
                    <Badge variant={d.daysRemaining < 7 ? "destructive" : d.daysRemaining < 30 ? "secondary" : "outline"}>
                      {d.daysRemaining} days remaining
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {d.deadlineType.charAt(0).toUpperCase() + d.deadlineType.slice(1)} deadline: {d.dueDate}
                  </div>
                  {d.daysRemaining < 7 && (
                    <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                      <AlertTriangle className="mr-1 inline h-3 w-3" /> Urgent: Investigation completion required
                    </div>
                  )}
                </div>
              ))}

              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Annual Compliance Report</div>
                    <div className="text-xs text-gray-600">Due in 45 days</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity + Quick actions */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900"><BarChart3 className="h-5 w-5" /> Recent Activity</CardTitle>
              <CardDescription>Real‑time updates from n8n & system events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActivityRow icon={<FileText className="h-4 w-4 text-blue-600" />} tone="blue" title="New complaint filed - POSH-2024-001" meta="5 minutes ago • Marketing Department" status="n8n workflow: case_created ✓ triggered" />
              <ActivityRow icon={<Users className="h-4 w-4 text-gray-800" />} tone="gray" title="ICC member assigned to POSH-2024-002" meta="2 hours ago • Sales Department" status="n8n workflow: investigator_assigned ✓ completed" />
              <ActivityRow icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} tone="amber" title="Evidence uploaded for POSH-2024-003" meta="4 hours ago • Engineering Department" status="n8n workflow: evidence_analysis ⏳ processing" />
              <ActivityRow icon={<CheckCircle className="h-4 w-4 text-emerald-600" />} tone="emerald" title="Human review completed - POSH-2024-001" meta="6 hours ago • Marketing Department" status="n8n workflow: pathway_determination ✓ completed" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              <CardDescription>Common tasks and system management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" /> Generate Compliance Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" /> Schedule ICC Meeting
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/human-review/POSH-2024-001">
                  <FileText className="mr-2 h-4 w-4" /> Review Pending Cases
                </Link>
              </Button>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">System Integration Status</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-600" /> HRIS Connected</div>
                  <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-600" /> n8n Workflows</div>
                  <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-600" /> Email Gateway</div>
                  <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-600" /> Calendar Sync</div>
                </div>
              </div>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/webhook-test">
                  <BarChart3 className="mr-2 h-4 w-4" /> Test n8n Integrations
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-gray-900">System Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators for POSH compliance system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <Metric value="+60%" label="Reporting Rate Increase" sub="vs. previous year" accent="emerald" />
              <Metric value="75%" label="Faster Processing" sub="avg. 2 hrs vs. 8 hrs" accent="amber" />
              <Metric value="100%" label="Compliance Rate" sub="on‑time completion" accent="emerald" />
              <Metric value="4.7/5" label="User Satisfaction" sub="employee feedback" accent="blue" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ActivityRow({ icon, title, meta, status }: { icon: React.ReactNode; title: string; meta: string; status: string }) {
  return (
    <div className="flex items-start gap-3 border-l-2 border-gray-200 bg-gray-50 p-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="text-xs text-gray-600">{meta}</div>
        <div className="text-xs text-gray-500">{status}</div>
      </div>
    </div>
  );
}

function Metric({ value, label, sub, accent }: { value: string; label: string; sub: string; accent: "emerald" | "amber" | "blue" }) {
  const accentMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  } as const;
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${accentMap[accent]}`}>{value}</div>
      <div className="text-sm text-gray-700">{label}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  );
}
