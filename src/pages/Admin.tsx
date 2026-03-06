import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, MessageSquare, FolderOpen, FileText,
  Activity, Server, Zap, Clock, ShieldCheck,
  Database, LogOut, LayoutDashboard, ChevronLeft,
  ChevronRight, TrendingUp, ArrowUpRight, Search,
  RefreshCw, AlertTriangle, CheckCircle2, Layers,
  HardDrive, BarChart3, Star, XCircle, Settings, User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import enplifyLogo from "@/assets/enplify-logo.png";
import { Badge } from "@/components/ui/badge";
import { AdminChart } from "@/components/admin/AdminChart";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import {
  summaryStats, userGrowthData, messageVolumeData,
  workspaceUsageData, systemMetricsData, topWorkspaces,
  recentActivity, dataSources, dataSourceQueryTrend,
  dataSourceStats, topSearchQueries, contentQualityData,
  workspaceDetails,
  type DataSource,
} from "@/data/mockAdminData";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// ── logo imports ────────────────────────────────────────────────────────────
import sharepoint from "@/assets/logos/sharepoint.svg";
import googleDrive from "@/assets/logos/google-drive.svg";
import salesforce from "@/assets/logos/salesforce.svg";
import snowflake from "@/assets/logos/snowflake.svg";
import onedrive from "@/assets/logos/onedrive.svg";
import servicenow from "@/assets/logos/servicenow.svg";
import sqlDatabase from "@/assets/logos/sql-database.svg";
import zoho from "@/assets/logos/zoho.svg";

const LOGO_MAP: Record<string, string> = {
  sharepoint, "google-drive": googleDrive, salesforce, snowflake,
  onedrive, servicenow, "sql-database": sqlDatabase, zoho,
};

type Section = "overview" | "users" | "chat" | "workspaces" | "datasources" | "system";

const NAV: { id: Section; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "overview",    label: "Overview",           icon: LayoutDashboard },
  { id: "users",       label: "Users & Activity",   icon: Users },
  { id: "chat",        label: "Chat & Messages",     icon: MessageSquare },
  { id: "datasources", label: "Data Sources",        icon: Layers, badge: 1 },
  { id: "workspaces",  label: "Workspaces & Docs",  icon: FolderOpen },
  { id: "system",      label: "System & API",        icon: Server },
];

// WCAG AA sidebar colour tokens (all ≥4.5:1 on #0d1117 bg)
const SB = {
  bg:        "#0d1117",
  border:    "#1e2837",
  label:     "#94a3b8",   // slate-400  – 7.5:1
  nav:       "#c4cdd9",   // slate-300  – 10:1
  navHover:  "#e2e8f0",   // slate-200  – 13:1
  navActive: "#e0eaff",   // indigo-100 – 13.5:1
  activeBg:  "rgba(99,102,241,0.18)",
  activeBar: "#818cf8",   // indigo-400
  mutedText: "#64748b",   // slate-500  – 4.6:1
};

function sliceByDays<T>(data: T[], days: number | null) {
  if (!days) return data;
  return data.slice(-days);
}

// ── Compact stat row card ────────────────────────────────────────────────────
const Stat = ({
  label, value, sub, icon: Icon, trend, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: number; color: string;
}) => {
  const isUp = (trend ?? 0) >= 0;
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border px-4 py-3.5 flex items-center gap-3 hover:shadow-sm transition-shadow group">
      <div className="absolute inset-0 opacity-[0.04] rounded-xl" style={{ background: `radial-gradient(circle at 80% 50%, ${color}, transparent 70%)` }} />
      <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      {trend !== undefined && (
        <span className={cn("flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0", isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
          <ArrowUpRight className={cn("w-2.5 h-2.5", !isUp && "rotate-90")} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
};

// ── Chart card ───────────────────────────────────────────────────────────────
const CC = ({ title, sub, children, className }: { title: string; sub?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl bg-card border border-border p-4", className)}>
    <p className="text-[13px] font-semibold text-foreground leading-none">{title}</p>
    {sub && <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">{sub}</p>}
    <div className={sub ? "" : "mt-3"}>{children}</div>
  </div>
);

// ── DS status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ s }: { s: DataSource["status"] }) => {
  const cfg = {
    active:   { icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600", label: "Active" },
    syncing:  { icon: RefreshCw,    cls: "bg-blue-500/10 text-blue-600",       label: "Syncing" },
    error:    { icon: XCircle,      cls: "bg-rose-500/10 text-rose-600",       label: "Error" },
    inactive: { icon: AlertTriangle,cls: "bg-amber-500/10 text-amber-600",     label: "Inactive" },
  }[s];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full", cfg.cls)}>
      <Icon className={cn("w-3 h-3", s === "syncing" && "animate-spin")} />
      {cfg.label}
    </span>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState<{ preset: number | null; range: DateRange | undefined }>({ preset: 30, range: undefined });

  const days = dateRange.preset ?? 30;
  const userData  = sliceByDays(userGrowthData, days);
  const msgData   = sliceByDays(messageVolumeData, days);
  const sysData   = sliceByDays(systemMetricsData, days);
  const dsQ       = sliceByDays(dataSourceQueryTrend, days);

  const P = "hsl(230,80%,60%)"; const G = "hsl(152,69%,47%)";
  const A = "hsl(38,92%,52%)";  const C = "hsl(188,80%,46%)";
  const R = "hsl(0,72%,56%)";

  const activeNav = NAV.find((n) => n.id === section)!;

  // ── Section renderer ───────────────────────────────────────────────────────
  const renderSection = () => {
    switch (section) {

      // ── OVERVIEW ────────────────────────────────────────────────────────
      case "overview":
        return (
          <div className="space-y-5">
            {/* KPI row – 4 compact cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Total Users"    value={summaryStats.totalUsers.toLocaleString()}   sub={`${summaryStats.activeUsersToday} active today`}              icon={Users}         trend={summaryStats.userGrowthPct}    color="#6366f1" />
              <Stat label="Messages Sent"  value={summaryStats.totalMessages.toLocaleString()} sub={`${summaryStats.messagesToday.toLocaleString()} today`}       icon={MessageSquare} trend={summaryStats.messageGrowthPct} color="#10b981" />
              <Stat label="Workspaces"     value={summaryStats.totalWorkspaces}                sub={`${summaryStats.totalDocuments.toLocaleString()} documents`}  icon={FolderOpen}    trend={summaryStats.workspacesGrowthPct} color="#f59e0b" />
              <Stat label="API Calls"      value={summaryStats.totalApiCalls.toLocaleString()} sub={`${summaryStats.avgResponseMs} ms avg`}                      icon={Zap}           trend={4.1}                           color="#06b6d4" />
            </div>

            {/* Second KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Data Sources"    value={`${dataSourceStats.active} / ${dataSourceStats.total}`} sub="active connectors" icon={Layers}  color="#8b5cf6" />
              <Stat label="Storage Used"    value={summaryStats.storageUsed}                               sub="across all sources" icon={HardDrive} color="#f59e0b" />
              <Stat label="Uptime"          value={`${summaryStats.uptime}%`}                              sub="30-day SLA"        icon={ShieldCheck} color="#10b981" />
              <Stat label="Avg AI Response" value={`${summaryStats.avgResponseMs} ms`}                    sub="last 30 days"      icon={Clock}       color="#06b6d4" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CC title="User Growth" sub="New vs active users per day">
                <AdminChart data={userData} type="area" xKey="date" dataKeys={[{ key: "newUsers", label: "New Users", color: P }, { key: "activeUsers", label: "Active", color: G }]} />
              </CC>
              <CC title="Message Volume" sub="Daily messages and AI responses">
                <AdminChart data={msgData} type="area" xKey="date" dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "aiResponses", label: "AI Responses", color: C }]} />
              </CC>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <CC title="Workspace Types" sub="Messages by category">
                <AdminChart data={workspaceUsageData} type="bar" xKey="name" height={160} dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "documents", label: "Docs", color: A }]} />
              </CC>

              {/* Top queries */}
              <CC title="Top Search Queries" sub="Most searched this period">
                <div className="space-y-2">
                  {topSearchQueries.slice(0, 5).map((q, i) => (
                    <div key={q.query} className="flex items-center gap-2">
                      <span className="w-4 text-[10px] font-bold text-muted-foreground shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground font-medium truncate">{q.query}</p>
                        <div className="h-1.5 bg-muted rounded-full mt-1">
                          <div className="h-1.5 rounded-full" style={{ width: `${(q.count / 500) * 100}%`, background: P }} />
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{q.count}</span>
                    </div>
                  ))}
                </div>
              </CC>

              {/* Recent activity */}
              <CC title="Recent Activity" sub="Latest platform actions">
                <div className="space-y-1.5">
                  {recentActivity.slice(0, 5).map((item) => {
                    const Icon = { workspace: FolderOpen, document: FileText, chat: MessageSquare, user: Users, api: Zap }[item.type] ?? Activity;
                    const c = { workspace: "#6366f1", document: "#f59e0b", chat: "#10b981", user: "#8b5cf6", api: "#06b6d4" }[item.type] ?? "#6366f1";
                    return (
                      <div key={item.id} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
                        <span className="p-1 rounded-md mt-0.5 shrink-0" style={{ background: `${c}18` }}>
                          <Icon className="w-3 h-3" style={{ color: c }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground leading-snug truncate">
                            <span className="font-semibold">{item.user.split("@")[0]}</span>
                            <span className="text-muted-foreground"> {item.action}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CC>
            </div>

            {/* Content quality */}
            <div className="grid grid-cols-3 gap-3">
              {contentQualityData.map((cq) => (
                <div key={cq.name} className="rounded-xl bg-card border border-border px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{cq.name} Queries</p>
                    <p className="text-xl font-bold text-foreground">{cq.value}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: cq.name === "Answered" ? "#10b98118" : cq.name === "Partial" ? "#f59e0b18" : "#ef444418" }}>
                    <Star className="w-4 h-4" style={{ color: cq.name === "Answered" ? "#10b981" : cq.name === "Partial" ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── USERS ───────────────────────────────────────────────────────────
      case "users":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Total Users"  value={summaryStats.totalUsers}          icon={Users}       trend={summaryStats.userGrowthPct} color="#6366f1" />
              <Stat label="Active Today" value={summaryStats.activeUsersToday}    sub="of total"     icon={Activity}    color="#10b981" />
              <Stat label="Avg Session"  value="18 min"                           sub="per day"      icon={Clock}       color="#f59e0b" />
              <Stat label="Retention"    value="74%"                              sub="30-day"       icon={ShieldCheck} color="#8b5cf6" />
            </div>
            <CC title="User Growth Over Time" sub="Signups and daily active users">
              <AdminChart data={userData} type="area" height={220} xKey="date" dataKeys={[{ key: "total", label: "Cumulative", color: P }, { key: "newUsers", label: "New", color: G }, { key: "activeUsers", label: "Active", color: A }]} />
            </CC>
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-foreground">All Recent Activity</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["User","Action","Target","Time"].map((h, i) => (
                      <th key={h} className={cn("px-4 py-2 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide", i === 3 && "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item, i) => (
                    <tr key={item.id} className={cn("border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors", i % 2 === 0 && "bg-muted/10")}>
                      <td className="px-4 py-2.5 font-semibold text-foreground text-[13px]">{item.user}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-[13px]">{item.action}</td>
                      <td className="px-4 py-2.5 text-foreground text-[13px]">{item.target}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-[13px] text-right">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ── CHAT ────────────────────────────────────────────────────────────
      case "chat":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Total Messages"   value={summaryStats.totalMessages.toLocaleString()} sub={`+${summaryStats.messagesToday} today`} icon={MessageSquare} trend={summaryStats.messageGrowthPct} color="#6366f1" />
              <Stat label="AI Responses"     value={(Math.round(summaryStats.totalMessages * 0.94)).toLocaleString()} sub="94% answer rate" icon={Zap}     color="#10b981" />
              <Stat label="Avg Msg/Session"  value="12.4"  sub="messages"      icon={Activity}  color="#f59e0b" />
              <Stat label="Avg Response"     value={`${summaryStats.avgResponseMs} ms`} sub="AI latency" icon={Clock} color="#06b6d4" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CC title="Daily Message Volume" sub="Messages vs AI responses">
                <AdminChart data={msgData} type="area" height={200} xKey="date" dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "aiResponses", label: "AI", color: C }]} />
              </CC>
              <CC title="Messages by Workspace Type" sub="Volume breakdown">
                <AdminChart data={workspaceUsageData} type="bar" height={200} xKey="name" dataKeys={[{ key: "messages", label: "Messages", color: P }]} />
              </CC>
            </div>
            {/* Search analytics */}
            <CC title="Top Search Queries" sub="Most common queries and result quality">
              <table className="w-full text-sm mt-1">
                <thead>
                  <tr className="border-b border-border">
                    {["#","Query","Searches","Avg Results","Bar"].map((h, i) => (
                      <th key={h} className={cn("pb-2 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide", i >= 2 && "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topSearchQueries.map((q, i) => (
                    <tr key={q.query} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-2 pr-2 text-[11px] font-bold text-muted-foreground w-6">{i + 1}</td>
                      <td className="py-2 text-[13px] text-foreground font-medium">{q.query}</td>
                      <td className="py-2 text-right text-[13px] text-muted-foreground">{q.count}</td>
                      <td className="py-2 text-right text-[13px] text-muted-foreground">{q.avgResults}</td>
                      <td className="py-2 pl-4 w-24">
                        <div className="h-1.5 bg-muted rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${(q.count / 500) * 100}%`, background: P }} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CC>
          </div>
        );

      // ── DATA SOURCES ────────────────────────────────────────────────────
      case "datasources":
        return (
          <div className="space-y-5">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Total Sources"     value={dataSourceStats.total}                               sub={`${dataSourceStats.active} active`}      icon={Layers}     color="#6366f1" />
              <Stat label="Documents Indexed" value={dataSourceStats.totalDocuments.toLocaleString()}    sub="across all sources"                       icon={FileText}   color="#10b981" />
              <Stat label="Storage Consumed"  value={dataSourceStats.totalStorage}                       sub="raw ingested"                            icon={HardDrive}  color="#f59e0b" />
              <Stat label="Queries / Month"   value={dataSourceStats.totalQueriesMonth.toLocaleString()} sub="retrieval requests"                      icon={Search}     color="#06b6d4" />
            </div>

            {/* Status overview chips */}
            <div className="flex flex-wrap gap-2">
              {(["active","syncing","error","inactive"] as DataSource["status"][]).map(s => {
                const cnt = dataSources.filter(d => d.status === s).length;
                const cfg = { active: { label: "Active", color: "#10b981" }, syncing: { label: "Syncing", color: "#3b82f6" }, error: { label: "Error", color: "#ef4444" }, inactive: { label: "Inactive", color: "#94a3b8" } }[s];
                return (
                  <div key={s} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="font-semibold text-foreground">{cnt}</span>
                    <span className="text-muted-foreground">{cfg.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Query trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CC title="Query Volume Over Time" sub="Daily retrieval requests across all data sources">
                <AdminChart data={dsQ} type="area" height={180} xKey="date" dataKeys={[{ key: "queries", label: "Queries", color: P }, { key: "errors", label: "Errors", color: R }]} />
              </CC>
              <CC title="Documents by Source Type" sub="Indexed document count">
                <AdminChart data={dataSources.filter(d => d.documents > 0).map(d => ({ name: d.type, docs: d.documents }))} type="bar" height={180} xKey="name" dataKeys={[{ key: "docs", label: "Documents", color: A }]} />
              </CC>
            </div>

            {/* Data sources table */}
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-[13px] font-semibold text-foreground">All Data Sources</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Connection status, sync health, and usage metrics</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Source","Type","Status","Documents","Last Sync","Queries/mo","Errors","Workspace"].map((h, i) => (
                        <th key={h} className={cn("px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", i >= 3 && i <= 6 && "text-right")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataSources.map((ds, i) => (
                      <tr key={ds.id} className={cn("border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors", i % 2 === 0 && "bg-muted/10")}>
                        <td className="px-4 py-3 min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <img src={LOGO_MAP[ds.logo]} alt={ds.type} className="w-5 h-5 shrink-0 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <span className="font-semibold text-foreground text-[13px] truncate">{ds.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-muted-foreground">{ds.type}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge s={ds.status} /></td>
                        <td className="px-4 py-3 text-right text-[13px] text-muted-foreground">{ds.documents.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-muted-foreground whitespace-nowrap">{ds.lastSync}</td>
                        <td className="px-4 py-3 text-right text-[13px] text-muted-foreground">{ds.queriesThisMonth.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          {ds.errorCount > 0 ? (
                            <span className="text-[12px] font-bold text-rose-500">{ds.errorCount}</span>
                          ) : (
                            <span className="text-[12px] text-emerald-500 font-bold">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-muted-foreground">{ds.workspace}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // ── WORKSPACES ──────────────────────────────────────────────────────
      case "workspaces":
        return (
          <div className="space-y-5">
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Total Workspaces" value={summaryStats.totalWorkspaces} trend={summaryStats.workspacesGrowthPct} icon={FolderOpen} color="#6366f1" />
              <Stat label="Documents"        value={summaryStats.totalDocuments.toLocaleString()} sub="all workspaces" icon={FileText}  color="#f59e0b" />
              <Stat label="Storage Used"     value={summaryStats.storageUsed} sub="total" icon={Database} color="#10b981" />
              <Stat label="Shared Spaces"    value="42" sub="team workspaces" icon={Users} color="#8b5cf6" />
            </div>

            {/* Distribution chart */}
            <CC title="Workspace Distribution" sub="Workspaces, documents and messages by type">
              <AdminChart data={workspaceUsageData} type="bar" height={180} xKey="name" dataKeys={[{ key: "workspaces", label: "Workspaces", color: P }, { key: "documents", label: "Documents", color: A }, { key: "messages", label: "Messages", color: G }]} />
            </CC>

            {/* Per-workspace detail cards */}
            <div>
              <p className="text-[13px] font-semibold text-foreground mb-3">Workspace Overview</p>
              <div className="space-y-3">
                {workspaceDetails.map((ws) => {
                  const wsSources = dataSources.filter(ds => ws.dataSourceIds.includes(ds.id));
                  const typeColor = { personal: "#6366f1", shared: "#10b981", organization: "#f59e0b" }[ws.type];
                  return (
                    <div key={ws.id} className="rounded-xl bg-card border border-border overflow-hidden">
                      {/* Workspace header */}
                      <div className="px-4 py-3 flex items-center justify-between bg-muted/20 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${typeColor}18` }}>
                            <FolderOpen className="w-3.5 h-3.5" style={{ color: typeColor }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-foreground leading-none">{ws.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Last active {ws.lastActive}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize ml-1">{ws.type}</Badge>
                        </div>
                        {/* Quick stats */}
                        <div className="flex items-center gap-5">
                          {[
                            { icon: Users,       label: "Users",    value: ws.users },
                            { icon: MessageSquare, label: "Messages", value: ws.messages.toLocaleString() },
                            { icon: FileText,    label: "Docs",     value: ws.documents.toLocaleString() },
                            { icon: HardDrive,   label: "Storage",  value: ws.storage },
                            { icon: BarChart3,   label: "Sessions", value: ws.sessions },
                          ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="text-center hidden sm:block">
                              <p className="text-[10px] text-muted-foreground">{label}</p>
                              <p className="text-[13px] font-semibold text-foreground">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Data sources for this workspace */}
                      {wsSources.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border/60">
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Data Source</th>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Docs</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Storage</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Queries/mo</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Last Sync</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Errors</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wsSources.map((ds, i) => (
                                <tr key={ds.id} className={cn("border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors", i % 2 === 0 && "bg-muted/5")}>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <img src={LOGO_MAP[ds.logo]} alt={ds.type} className="w-4 h-4 shrink-0 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                      <span className="text-[12px] font-medium text-foreground truncate">{ds.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{ds.type}</td>
                                  <td className="px-4 py-2.5"><StatusBadge s={ds.status} /></td>
                                  <td className="px-4 py-2.5 text-right text-[12px] text-muted-foreground">{ds.documents.toLocaleString()}</td>
                                  <td className="px-4 py-2.5 text-right text-[12px] text-muted-foreground">{ds.storageUsed}</td>
                                  <td className="px-4 py-2.5 text-right text-[12px] text-muted-foreground">{ds.queriesThisMonth.toLocaleString()}</td>
                                  <td className="px-4 py-2.5 text-right text-[11px] text-muted-foreground whitespace-nowrap">{ds.lastSync}</td>
                                  <td className="px-4 py-2.5 text-right">
                                    {ds.errorCount > 0
                                      ? <span className="text-[12px] font-bold text-rose-500">{ds.errorCount}</span>
                                      : <span className="text-[12px] font-bold text-emerald-500">—</span>
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-[12px] text-muted-foreground italic">No data sources connected</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      // ── SYSTEM ──────────────────────────────────────────────────────────
      case "system":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Total API Calls" value={summaryStats.totalApiCalls.toLocaleString()} trend={4.1}     icon={Zap}        color="#6366f1" />
              <Stat label="Avg Response"    value={`${summaryStats.avgResponseMs} ms`}           sub="30-day avg" icon={Clock}      color="#10b981" />
              <Stat label="Error Rate"      value={`${summaryStats.errorRate}%`}                 sub="below threshold" icon={Activity} color="#f59e0b" />
              <Stat label="Uptime"          value={`${summaryStats.uptime}%`}                    sub="30-day SLA" icon={ShieldCheck} color="#10b981" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CC title="API Call Volume" sub="Daily API calls">
                <AdminChart data={sysData} type="area" height={200} xKey="date" dataKeys={[{ key: "apiCalls", label: "API Calls", color: P }]} />
              </CC>
              <CC title="Response Time & Error Rate" sub="Latency (ms) and error rate (%)">
                <AdminChart data={sysData} type="area" height={200} xKey="date" dataKeys={[{ key: "avgResponseMs", label: "Response (ms)", color: A }, { key: "errorRate", label: "Error Rate (%)", color: R }]} />
              </CC>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Database",     latency: "12 ms",   uptime: "99.99%" },
                { label: "AI Engine",    latency: `${summaryStats.avgResponseMs} ms`, uptime: "99.97%" },
                { label: "File Storage", latency: "28 ms",   uptime: "99.98%" },
                { label: "Auth Service", latency: "8 ms",    uptime: "100%" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-card border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-semibold text-foreground">{s.label}</p>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Latency: <span className="text-foreground font-medium">{s.latency}</span></p>
                  <p className="text-[11px] text-muted-foreground">Uptime: <span className="text-foreground font-medium">{s.uptime}</span></p>
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

      {/* ── Dark sidebar – WCAG AA compliant colours ───────────────────────── */}
      <aside
        className={cn("h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300", collapsed ? "w-[60px]" : "w-[210px]")}
        style={{ background: SB.bg, borderRight: `1px solid ${SB.border}` }}
      >
        {/* Logo row */}
        <div className="flex items-center h-14 shrink-0 px-3" style={{ borderBottom: `1px solid ${SB.border}` }}>
          {collapsed ? (
            <img src={enplifyLogo} alt="Enplify.ai" className="h-4 object-contain brightness-0 invert" />
          ) : (
            <img src={enplifyLogo} alt="Enplify.ai" className="h-5 object-contain brightness-0 invert" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {!collapsed && (
            <p className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: SB.mutedText }}>Analytics</p>
          )}
          {NAV.map((nav) => {
            const isActive = section === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setSection(nav.id)}
                title={collapsed ? nav.label : undefined}
                className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-100 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400", collapsed && "justify-center")}
                style={{
                  background: isActive ? SB.activeBg : "transparent",
                  color: isActive ? SB.navActive : SB.nav,
                }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = SB.border; (e.currentTarget as HTMLElement).style.color = SB.navHover; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = SB.nav; } }}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full" style={{ background: SB.activeBar }} />}
                <nav.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-[13px] font-medium flex-1 text-left truncate">{nav.label}</span>}
                {!collapsed && nav.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center" style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>{nav.badge}</span>
                )}
                {collapsed && nav.badge && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400" />}
              </button>
            );
          })}

          <div className="my-2 mx-1" style={{ height: 1, background: SB.border }} />

          <button
            onClick={() => navigate("/")}
            title={collapsed ? "Back to App" : undefined}
            className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400", collapsed && "justify-center")}
            style={{ color: SB.label }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SB.border; (e.currentTarget as HTMLElement).style.color = SB.navHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = SB.label; }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">Back to App</span>}
          </button>
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 shrink-0" style={{ borderTop: `1px solid ${SB.border}` }}>
          <button
            onClick={() => setCollapsed(v => !v)}
            className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400", collapsed && "justify-center")}
            style={{ color: SB.label }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SB.border; (e.currentTarget as HTMLElement).style.color = SB.navHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = SB.label; }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-[12px]">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card/70 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-[15px] font-bold text-foreground leading-none">{activeNav.label}</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {section === "overview"    && "Platform-wide analytics snapshot"}
              {section === "users"       && "User acquisition and engagement"}
              {section === "chat"        && "Message volume and AI performance"}
              {section === "datasources" && "Connector health, sync status, and query metrics"}
              {section === "workspaces"  && "Workspace and document statistics"}
              {section === "system"      && "API health and infrastructure metrics"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                    <span className="text-xs font-bold text-primary">A</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@enplify.ai</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/")} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
