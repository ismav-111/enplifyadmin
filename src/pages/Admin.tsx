import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, MessageSquare, FolderOpen, FileText,
  Activity, Server, ArrowLeft, Zap, Clock, ShieldCheck,
  Database, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/StatCard";
import { AdminChart } from "@/components/admin/AdminChart";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import {
  summaryStats,
  userGrowthData,
  messageVolumeData,
  workspaceUsageData,
  systemMetricsData,
  topWorkspaces,
  recentActivity,
} from "@/data/mockAdminData";
import { cn } from "@/lib/utils";
import enplifyLogo from "@/assets/enplify-logo.png";
import type { DateRange } from "react-day-picker";

type Section = "overview" | "users" | "chat" | "workspaces" | "system";

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users & Activity", icon: Users },
  { id: "chat", label: "Chat & Messages", icon: MessageSquare },
  { id: "workspaces", label: "Workspaces & Docs", icon: FolderOpen },
  { id: "system", label: "System & API", icon: Server },
];

const activityTypeIcon: Record<string, React.ElementType> = {
  workspace: FolderOpen,
  document: FileText,
  chat: MessageSquare,
  user: Users,
  api: Zap,
};

const activityTypeBadge: Record<string, string> = {
  workspace: "bg-primary/10 text-primary",
  document: "bg-amber-500/10 text-amber-600",
  chat: "bg-green-500/10 text-green-600",
  user: "bg-purple-500/10 text-purple-600",
  api: "bg-cyan-500/10 text-cyan-600",
};

// Slice data based on preset days
function sliceByDays<T>(data: T[], days: number | null) {
  if (!days) return data;
  return data.slice(-days);
}

const Admin = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [dateRange, setDateRange] = useState<{
    preset: number | null;
    range: DateRange | undefined;
  }>({ preset: 30, range: undefined });

  const days = dateRange.preset ?? 30;

  const userData = sliceByDays(userGrowthData, days);
  const msgData = sliceByDays(messageVolumeData, days);
  const sysData = sliceByDays(systemMetricsData, days);

  // Chart color tokens resolved at runtime
  const P = "hsl(230, 80%, 55%)";
  const G = "hsl(142, 71%, 45%)";
  const A = "hsl(38, 92%, 50%)";
  const C = "hsl(188, 80%, 44%)";

  const renderSection = () => {
    switch (section) {
      // ── OVERVIEW ──────────────────────────────────────────────────────────
      case "overview":
        return (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Users" value={summaryStats.totalUsers.toLocaleString()} subtitle={`${summaryStats.activeUsersToday} active today`} icon={Users} trend={summaryStats.userGrowthPct} accent="primary" />
              <StatCard title="Messages Sent" value={summaryStats.totalMessages.toLocaleString()} subtitle={`${summaryStats.messagesToday.toLocaleString()} today`} icon={MessageSquare} trend={summaryStats.messageGrowthPct} accent="success" />
              <StatCard title="Workspaces" value={summaryStats.totalWorkspaces} subtitle={`${summaryStats.totalDocuments.toLocaleString()} documents`} icon={FolderOpen} trend={summaryStats.workspacesGrowthPct} accent="warning" />
              <StatCard title="API Calls" value={summaryStats.totalApiCalls.toLocaleString()} subtitle={`${summaryStats.avgResponseMs} ms avg`} icon={Zap} trend={4.1} accent="primary" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">User Growth</h3>
                <p className="text-xs text-muted-foreground mb-4">New vs active users per day</p>
                <AdminChart data={userData} type="area" xKey="date" dataKeys={[{ key: "newUsers", label: "New Users", color: P }, { key: "activeUsers", label: "Active Users", color: G }]} />
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Message Volume</h3>
                <p className="text-xs text-muted-foreground mb-4">Daily messages and AI responses</p>
                <AdminChart data={msgData} type="area" xKey="date" dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "aiResponses", label: "AI Responses", color: C }]} />
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Workspace breakdown */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Workspace Types</h3>
                <p className="text-xs text-muted-foreground mb-4">Messages by workspace category</p>
                <AdminChart data={workspaceUsageData} type="bar" xKey="name" height={180} dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "documents", label: "Documents", color: A }]} />
              </div>

              {/* Recent activity */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Recent Activity</h3>
                <p className="text-xs text-muted-foreground mb-4">Latest actions across the platform</p>
                <div className="space-y-2">
                  {recentActivity.slice(0, 6).map((item) => {
                    const Icon = activityTypeIcon[item.type] ?? Activity;
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                        <span className={cn("p-1.5 rounded-md shrink-0", activityTypeBadge[item.type])}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            <span className="font-medium">{item.user}</span>
                            <span className="text-muted-foreground"> {item.action} </span>
                            <span className="font-medium">{item.target}</span>
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      // ── USERS ─────────────────────────────────────────────────────────────
      case "users":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Users" value={summaryStats.totalUsers} icon={Users} trend={summaryStats.userGrowthPct} accent="primary" />
              <StatCard title="Active Today" value={summaryStats.activeUsersToday} subtitle="of total users" icon={Activity} accent="success" />
              <StatCard title="Avg Session" value="18 min" subtitle="per user per day" icon={Clock} accent="warning" />
              <StatCard title="Retention" value="74%" subtitle="30-day retention" icon={ShieldCheck} accent="primary" />
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">User Growth Over Time</h3>
              <p className="text-xs text-muted-foreground mb-4">New signups and daily active users</p>
              <AdminChart data={userData} type="area" height={260} xKey="date" dataKeys={[{ key: "total", label: "Cumulative Users", color: P }, { key: "newUsers", label: "New Signups", color: G }, { key: "activeUsers", label: "Daily Active", color: A }]} />
            </div>
            {/* Full activity table */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">All Recent Activity</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-xs font-medium text-muted-foreground">User</th>
                    <th className="pb-2 text-xs font-medium text-muted-foreground">Action</th>
                    <th className="pb-2 text-xs font-medium text-muted-foreground">Target</th>
                    <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 text-foreground font-medium">{item.user}</td>
                      <td className="py-2.5 text-muted-foreground">{item.action}</td>
                      <td className="py-2.5 text-foreground">{item.target}</td>
                      <td className="py-2.5 text-muted-foreground text-right">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ── CHAT ──────────────────────────────────────────────────────────────
      case "chat":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Messages" value={summaryStats.totalMessages.toLocaleString()} subtitle={`+${summaryStats.messagesToday} today`} icon={MessageSquare} trend={summaryStats.messageGrowthPct} accent="primary" />
              <StatCard title="AI Responses" value={(Math.round(summaryStats.totalMessages * 0.94)).toLocaleString()} subtitle="94% answer rate" icon={Zap} accent="success" />
              <StatCard title="Avg Msg/Session" value="12.4" subtitle="messages per session" icon={Activity} accent="warning" />
              <StatCard title="Avg Response" value={`${summaryStats.avgResponseMs} ms`} subtitle="AI response time" icon={Clock} accent="primary" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Daily Message Volume</h3>
                <p className="text-xs text-muted-foreground mb-4">Messages vs AI responses</p>
                <AdminChart data={msgData} type="area" height={240} xKey="date" dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "aiResponses", label: "AI Responses", color: C }]} />
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Messages by Workspace</h3>
                <p className="text-xs text-muted-foreground mb-4">Volume breakdown per type</p>
                <AdminChart data={workspaceUsageData} type="bar" height={240} xKey="name" dataKeys={[{ key: "messages", label: "Messages", color: P }]} />
              </div>
            </div>
          </div>
        );

      // ── WORKSPACES ────────────────────────────────────────────────────────
      case "workspaces":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Workspaces" value={summaryStats.totalWorkspaces} trend={summaryStats.workspacesGrowthPct} icon={FolderOpen} accent="primary" />
              <StatCard title="Documents" value={summaryStats.totalDocuments.toLocaleString()} subtitle="across all workspaces" icon={FileText} accent="warning" />
              <StatCard title="Storage Used" value={summaryStats.storageUsed} subtitle="total storage" icon={Database} accent="success" />
              <StatCard title="Shared Spaces" value="42" subtitle="team workspaces" icon={Users} accent="primary" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Workspace Distribution</h3>
                <p className="text-xs text-muted-foreground mb-4">Workspaces, documents, and messages by type</p>
                <AdminChart data={workspaceUsageData} type="bar" height={240} xKey="name" dataKeys={[{ key: "workspaces", label: "Workspaces", color: P }, { key: "documents", label: "Documents", color: A }]} />
              </div>
              {/* Top workspaces table */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Top Workspaces by Usage</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Workspace</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Users</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Msgs</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Docs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWorkspaces.map((ws) => (
                      <tr key={ws.name} className="border-b border-border last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium truncate max-w-[120px]">{ws.name}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize shrink-0">{ws.type}</Badge>
                          </div>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{ws.users}</td>
                        <td className="py-2 text-right text-muted-foreground">{ws.messages.toLocaleString()}</td>
                        <td className="py-2 text-right text-muted-foreground">{ws.documents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // ── SYSTEM ────────────────────────────────────────────────────────────
      case "system":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total API Calls" value={summaryStats.totalApiCalls.toLocaleString()} trend={4.1} icon={Zap} accent="primary" />
              <StatCard title="Avg Response" value={`${summaryStats.avgResponseMs} ms`} subtitle="last 30 days" icon={Clock} accent="success" />
              <StatCard title="Error Rate" value={`${summaryStats.errorRate}%`} subtitle="below threshold" icon={Activity} accent="warning" />
              <StatCard title="Uptime" value={`${summaryStats.uptime}%`} subtitle="last 30 days" icon={ShieldCheck} accent="success" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">API Call Volume</h3>
                <p className="text-xs text-muted-foreground mb-4">Daily API calls over time</p>
                <AdminChart data={sysData} type="area" height={240} xKey="date" dataKeys={[{ key: "apiCalls", label: "API Calls", color: P }]} />
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Response Time & Errors</h3>
                <p className="text-xs text-muted-foreground mb-4">Avg response time (ms) and error rate (%)</p>
                <AdminChart data={sysData} type="area" height={240} xKey="date" dataKeys={[{ key: "avgResponseMs", label: "Avg Response (ms)", color: A }, { key: "errorRate", label: "Error Rate (%)", color: "hsl(0, 70%, 50%)" }]} />
              </div>
            </div>
            {/* System health table */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">System Health Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Database", status: "Healthy", latency: "12 ms" },
                  { label: "AI Engine", status: "Healthy", latency: `${summaryStats.avgResponseMs} ms` },
                  { label: "File Storage", status: "Healthy", latency: "28 ms" },
                  { label: "Auth Service", status: "Healthy", latency: "8 ms" },
                ].map((service) => (
                  <div key={service.label} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{service.label}</span>
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        {service.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Latency: {service.latency}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const activeNav = NAV.find((n) => n.id === section)!;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border h-screen bg-card flex flex-col sticky top-0 shrink-0">
        <div className="flex items-center px-4 h-14 border-b border-border shrink-0">
          <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          <button onClick={() => navigate("/")} className="nav-item w-full justify-start gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to App</span>
          </button>
          <div className="py-2"><div className="h-px bg-border/60" /></div>
          <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Analytics</p>
          {NAV.map((nav) => (
            <button
              key={nav.id}
              onClick={() => setSection(nav.id)}
              className={cn(
                "nav-item w-full justify-start gap-2",
                section === nav.id && "bg-accent text-foreground font-medium"
              )}
            >
              <nav.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm">{nav.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <activeNav.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{activeNav.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
              <span>Exit Admin</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-8">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Admin</p>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">{activeNav.label}</h1>
            </div>
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
