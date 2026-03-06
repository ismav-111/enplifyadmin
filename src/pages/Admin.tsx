import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, MessageSquare, FolderOpen, FileText,
  Activity, Server, Zap, Clock, ShieldCheck,
  Database, LogOut, LayoutDashboard, ChevronLeft,
  ChevronRight, TrendingUp, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const NAV: { id: Section; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users & Activity", icon: Users },
  { id: "chat", label: "Chat & Messages", icon: MessageSquare, badge: 4 },
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

const activityColors: Record<string, string> = {
  workspace: "#6366f1",
  document: "#f59e0b",
  chat: "#10b981",
  user: "#8b5cf6",
  api: "#06b6d4",
};

function sliceByDays<T>(data: T[], days: number | null) {
  if (!days) return data;
  return data.slice(-days);
}

// ── Premium Stat Card (dark-accented) ────────────────────────────────────────
const PremiumStat = ({
  title, value, subtitle, icon: Icon, trend, color,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; trend?: number; color: string;
}) => {
  const isUp = (trend ?? 0) >= 0;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 group hover:border-border/80 transition-all hover:shadow-md">
      {/* Subtle glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] blur-2xl"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: `${color}18` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          {trend !== undefined && (
            <span
              className={cn(
                "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full",
                isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}
            >
              <ArrowUpRight className={cn("w-3 h-3", !isUp && "rotate-90")} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// ── Chart card wrapper ────────────────────────────────────────────────────────
const ChartCard = ({
  title, subtitle, children, className,
}: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={cn("rounded-2xl bg-card border border-border p-5", className)}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Admin = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState<{
    preset: number | null;
    range: DateRange | undefined;
  }>({ preset: 30, range: undefined });

  const days = dateRange.preset ?? 30;
  const userData = sliceByDays(userGrowthData, days);
  const msgData = sliceByDays(messageVolumeData, days);
  const sysData = sliceByDays(systemMetricsData, days);

  // Brand-consistent chart colors
  const P  = "hsl(230, 80%, 60%)";
  const G  = "hsl(152, 69%, 47%)";
  const A  = "hsl(38, 92%, 52%)";
  const C  = "hsl(188, 80%, 46%)";
  const R  = "hsl(0, 72%, 56%)";

  const activeNav = NAV.find((n) => n.id === section)!;

  // ── Section content ──────────────────────────────────────────────────────
  const renderSection = () => {
    switch (section) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <PremiumStat title="Total Users" value={summaryStats.totalUsers.toLocaleString()} subtitle={`${summaryStats.activeUsersToday} active today`} icon={Users} trend={summaryStats.userGrowthPct} color="#6366f1" />
              <PremiumStat title="Messages Sent" value={summaryStats.totalMessages.toLocaleString()} subtitle={`${summaryStats.messagesToday.toLocaleString()} today`} icon={MessageSquare} trend={summaryStats.messageGrowthPct} color="#10b981" />
              <PremiumStat title="Workspaces" value={summaryStats.totalWorkspaces} subtitle={`${summaryStats.totalDocuments.toLocaleString()} documents`} icon={FolderOpen} trend={summaryStats.workspacesGrowthPct} color="#f59e0b" />
              <PremiumStat title="API Calls" value={summaryStats.totalApiCalls.toLocaleString()} subtitle={`${summaryStats.avgResponseMs} ms avg`} icon={Zap} trend={4.1} color="#06b6d4" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ChartCard title="User Growth" subtitle="New vs active users per day">
                <AdminChart data={userData} type="area" xKey="date" dataKeys={[{ key: "newUsers", label: "New Users", color: P }, { key: "activeUsers", label: "Active Users", color: G }]} />
              </ChartCard>
              <ChartCard title="Message Volume" subtitle="Daily messages and AI responses">
                <AdminChart data={msgData} type="area" xKey="date" dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "aiResponses", label: "AI Responses", color: C }]} />
              </ChartCard>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <ChartCard title="Workspace Types" subtitle="Messages by category">
                <AdminChart data={workspaceUsageData} type="bar" xKey="name" height={180} dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "documents", label: "Docs", color: A }]} />
              </ChartCard>
              <div className="xl:col-span-2 rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Latest actions across the platform</p>
                  </div>
                  <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    View all <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {recentActivity.slice(0, 6).map((item) => {
                    const Icon = activityTypeIcon[item.type] ?? Activity;
                    const c = activityColors[item.type] ?? "#6366f1";
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
                        <span className="p-1.5 rounded-lg shrink-0" style={{ background: `${c}18` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: c }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-foreground truncate">
                            <span className="font-semibold">{item.user}</span>
                            <span className="text-muted-foreground"> {item.action} </span>
                            <span className="font-medium">{item.target}</span>
                          </p>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <PremiumStat title="Total Users" value={summaryStats.totalUsers} icon={Users} trend={summaryStats.userGrowthPct} color="#6366f1" />
              <PremiumStat title="Active Today" value={summaryStats.activeUsersToday} subtitle="of total users" icon={Activity} color="#10b981" />
              <PremiumStat title="Avg Session" value="18 min" subtitle="per user per day" icon={Clock} color="#f59e0b" />
              <PremiumStat title="Retention" value="74%" subtitle="30-day retention" icon={ShieldCheck} color="#8b5cf6" />
            </div>
            <ChartCard title="User Growth Over Time" subtitle="New signups and daily active users">
              <AdminChart data={userData} type="area" height={260} xKey="date" dataKeys={[{ key: "total", label: "Cumulative", color: P }, { key: "newUsers", label: "New Signups", color: G }, { key: "activeUsers", label: "Daily Active", color: A }]} />
            </ChartCard>
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">All Recent Activity</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item, i) => (
                    <tr key={item.id} className={cn("border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors", i % 2 === 0 && "bg-muted/10")}>
                      <td className="px-5 py-3 font-semibold text-foreground">{item.user}</td>
                      <td className="px-5 py-3 text-muted-foreground">{item.action}</td>
                      <td className="px-5 py-3 text-foreground">{item.target}</td>
                      <td className="px-5 py-3 text-muted-foreground text-right">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "chat":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <PremiumStat title="Total Messages" value={summaryStats.totalMessages.toLocaleString()} subtitle={`+${summaryStats.messagesToday} today`} icon={MessageSquare} trend={summaryStats.messageGrowthPct} color="#6366f1" />
              <PremiumStat title="AI Responses" value={(Math.round(summaryStats.totalMessages * 0.94)).toLocaleString()} subtitle="94% answer rate" icon={Zap} color="#10b981" />
              <PremiumStat title="Avg Msg/Session" value="12.4" subtitle="messages per session" icon={Activity} color="#f59e0b" />
              <PremiumStat title="Avg Response" value={`${summaryStats.avgResponseMs} ms`} subtitle="AI response time" icon={Clock} color="#06b6d4" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ChartCard title="Daily Message Volume" subtitle="Messages vs AI responses">
                <AdminChart data={msgData} type="area" height={240} xKey="date" dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "aiResponses", label: "AI Responses", color: C }]} />
              </ChartCard>
              <ChartCard title="Messages by Workspace" subtitle="Volume breakdown per type">
                <AdminChart data={workspaceUsageData} type="bar" height={240} xKey="name" dataKeys={[{ key: "messages", label: "Messages", color: P }]} />
              </ChartCard>
            </div>
          </div>
        );

      case "workspaces":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <PremiumStat title="Total Workspaces" value={summaryStats.totalWorkspaces} trend={summaryStats.workspacesGrowthPct} icon={FolderOpen} color="#6366f1" />
              <PremiumStat title="Documents" value={summaryStats.totalDocuments.toLocaleString()} subtitle="across all workspaces" icon={FileText} color="#f59e0b" />
              <PremiumStat title="Storage Used" value={summaryStats.storageUsed} subtitle="total storage" icon={Database} color="#10b981" />
              <PremiumStat title="Shared Spaces" value="42" subtitle="team workspaces" icon={Users} color="#8b5cf6" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ChartCard title="Workspace Distribution" subtitle="Workspaces and documents by type">
                <AdminChart data={workspaceUsageData} type="bar" height={240} xKey="name" dataKeys={[{ key: "workspaces", label: "Workspaces", color: P }, { key: "documents", label: "Documents", color: A }]} />
              </ChartCard>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Top Workspaces by Usage</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Workspace</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Users</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Msgs</th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Docs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWorkspaces.map((ws, i) => (
                      <tr key={ws.name} className={cn("border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors", i % 2 === 0 && "bg-muted/10")}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate max-w-[120px]">{ws.name}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">{ws.type}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{ws.users}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{ws.messages.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{ws.documents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <PremiumStat title="Total API Calls" value={summaryStats.totalApiCalls.toLocaleString()} trend={4.1} icon={Zap} color="#6366f1" />
              <PremiumStat title="Avg Response" value={`${summaryStats.avgResponseMs} ms`} subtitle="last 30 days" icon={Clock} color="#10b981" />
              <PremiumStat title="Error Rate" value={`${summaryStats.errorRate}%`} subtitle="below threshold" icon={Activity} color="#f59e0b" />
              <PremiumStat title="Uptime" value={`${summaryStats.uptime}%`} subtitle="last 30 days" icon={ShieldCheck} color="#10b981" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ChartCard title="API Call Volume" subtitle="Daily API calls over time">
                <AdminChart data={sysData} type="area" height={240} xKey="date" dataKeys={[{ key: "apiCalls", label: "API Calls", color: P }]} />
              </ChartCard>
              <ChartCard title="Response Time & Error Rate" subtitle="Latency (ms) and error rate (%)">
                <AdminChart data={sysData} type="area" height={240} xKey="date" dataKeys={[{ key: "avgResponseMs", label: "Response (ms)", color: A }, { key: "errorRate", label: "Error Rate (%)", color: R }]} />
              </ChartCard>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Database", latency: "12 ms", uptime: "99.99%" },
                { label: "AI Engine", latency: `${summaryStats.avgResponseMs} ms`, uptime: "99.97%" },
                { label: "File Storage", latency: "28 ms", uptime: "99.98%" },
                { label: "Auth Service", latency: "8 ms", uptime: "100%" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-emerald-500">Live</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-3">
                    <Server className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">Latency: <span className="text-foreground font-medium">{s.latency}</span></p>
                  <p className="text-xs text-muted-foreground">Uptime: <span className="text-foreground font-medium">{s.uptime}</span></p>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--background))" }}>
      {/* ── Dark Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
        style={{ background: "hsl(224, 30%, 8%)", borderRight: "1px solid hsl(224, 20%, 14%)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-16 shrink-0 px-4 gap-3"
          style={{ borderBottom: "1px solid hsl(224, 20%, 14%)" }}
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white truncate leading-tight">Admin Panel</p>
              <p className="text-[10px] text-white/40 truncate">Enplify.ai</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "hsl(224, 15%, 40%)" }}>
              Analytics
            </p>
          )}
          {NAV.map((nav) => {
            const isActive = section === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setSection(nav.id)}
                title={collapsed ? nav.label : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group",
                  collapsed && "justify-center"
                )}
                style={{
                  background: isActive ? "hsl(230, 60%, 55%, 0.2)" : "transparent",
                  color: isActive ? "hsl(230, 85%, 70%)" : "hsl(224, 15%, 55%)",
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "hsl(224, 20%, 14%)";
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = "hsl(210, 20%, 85%)";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = "hsl(224, 15%, 55%)";
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "hsl(230, 85%, 65%)" }}
                  />
                )}
                <nav.icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="text-[13px] font-medium flex-1 text-left truncate">{nav.label}</span>
                )}
                {!collapsed && nav.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary min-w-[18px] text-center">
                    {nav.badge}
                  </span>
                )}
                {collapsed && nav.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-3 mx-2" style={{ height: 1, background: "hsl(224, 20%, 14%)" }} />

          {/* Back to app */}
          <button
            onClick={() => navigate("/")}
            title={collapsed ? "Back to App" : undefined}
            className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150", collapsed && "justify-center")}
            style={{ color: "hsl(224, 15%, 45%)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "hsl(224, 20%, 14%)";
              (e.currentTarget as HTMLElement).style.color = "hsl(210, 20%, 75%)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "hsl(224, 15%, 45%)";
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">Back to App</span>}
          </button>
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 shrink-0" style={{ borderTop: "1px solid hsl(224, 20%, 14%)" }}>
          <button
            onClick={() => setCollapsed(v => !v)}
            className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150", collapsed && "justify-center")}
            style={{ color: "hsl(224, 15%, 45%)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "hsl(224, 20%, 14%)";
              (e.currentTarget as HTMLElement).style.color = "hsl(210, 20%, 75%)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "hsl(224, 15%, 45%)";
            }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-[12px]">Collapse menu</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0" style={{ background: "hsl(var(--background))" }}>
        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-7 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-base font-bold text-foreground">{activeNav.label}</h1>
            <p className="text-xs text-muted-foreground">
              {section === "overview" && "Platform-wide analytics snapshot"}
              {section === "users" && "User acquisition and engagement metrics"}
              {section === "chat" && "Message volume and AI performance"}
              {section === "workspaces" && "Workspace and document statistics"}
              {section === "system" && "API health and infrastructure metrics"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">A</span>
              </div>
              {!collapsed && <span className="text-sm font-medium text-foreground hidden lg:block">Admin</span>}
            </div>
          </div>
        </header>

        {/* Page body */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1280px] mx-auto px-7 py-7">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
