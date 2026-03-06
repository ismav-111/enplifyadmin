import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, MessageSquare, FolderOpen, FileText,
  Activity, Server, Zap, Clock, ShieldCheck,
  Database, LogOut, LayoutDashboard,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  TrendingUp, ArrowUpRight, Search,
  RefreshCw, AlertTriangle, CheckCircle2, Layers,
  HardDrive, BarChart3, XCircle, Settings, User,
  Building2, ThumbsUp, ThumbsDown, MessageCircle,
  ArrowLeft
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
  workspaceUsageData, systemMetricsData,
  recentActivity, dataSources, dataSourceQueryTrend,
  dataSourceStats, topSearchQueries, contentQualityData,
  workspaceDetails, tenants, chatSessions, feedbackTrendData,
  type DataSource, type Tenant, type WorkspaceDetail, type ChatSession,
} from "@/data/mockAdminData";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// ── Logo imports ──────────────────────────────────────────────────────────────
import sharepoint    from "@/assets/logos/sharepoint.svg";
import googleDrive   from "@/assets/logos/google-drive.svg";
import salesforce    from "@/assets/logos/salesforce.svg";
import snowflake     from "@/assets/logos/snowflake.svg";
import onedrive      from "@/assets/logos/onedrive.svg";
import servicenow    from "@/assets/logos/servicenow.svg";
import sqlDatabase   from "@/assets/logos/sql-database.svg";
import zoho          from "@/assets/logos/zoho.svg";

const LOGO_MAP: Record<string, string> = {
  sharepoint, "google-drive": googleDrive, salesforce, snowflake,
  onedrive, servicenow, "sql-database": sqlDatabase, zoho,
};

// ── Navigation ────────────────────────────────────────────────────────────────
type Section = "overview" | "tenants" | "system";

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Platform Overview", icon: LayoutDashboard },
  { id: "tenants",  label: "Tenants",            icon: Building2 },
  { id: "system",   label: "System & API",        icon: Server },
];

// ── Sidebar colour tokens ─────────────────────────────────────────────────────
const SB = {
  bg:        "#0d1117",
  border:    "#1e2837",
  label:     "#94a3b8",
  nav:       "#c4cdd9",
  navHover:  "#e2e8f0",
  navActive: "#e0eaff",
  activeBg:  "rgba(99,102,241,0.18)",
  activeBar: "#818cf8",
  mutedText: "#64748b",
};

// ── Colours ───────────────────────────────────────────────────────────────────
const P = "hsl(230,80%,60%)";
const G = "hsl(152,69%,47%)";
const A = "hsl(38,92%,52%)";
const C = "hsl(188,80%,46%)";
const R = "hsl(0,72%,56%)";

function sliceByDays<T>(data: T[], days: number) {
  return data.slice(-days);
}

// ── Reusable micro-components ─────────────────────────────────────────────────

const Stat = ({
  label, value, sub, icon: Icon, trend, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: number; color: string;
}) => {
  const isUp = (trend ?? 0) >= 0;
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border px-4 py-3.5 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div className="absolute inset-0 opacity-[0.04] rounded-xl"
        style={{ background: `radial-gradient(circle at 80% 50%, ${color}, transparent 70%)` }} />
      <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      {trend !== undefined && (
        <span className={cn("flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
          isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
          <ArrowUpRight className={cn("w-2.5 h-2.5", !isUp && "rotate-90")} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
};

const CC = ({ title, sub, children, className }: {
  title: string; sub?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={cn("rounded-xl bg-card border border-border p-4", className)}>
    <p className="text-[13px] font-semibold text-foreground leading-none">{title}</p>
    {sub && <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">{sub}</p>}
    <div className={sub ? "" : "mt-3"}>{children}</div>
  </div>
);

const StatusBadge = ({ s }: { s: DataSource["status"] }) => {
  const cfg = {
    active:   { icon: CheckCircle2,  cls: "bg-emerald-500/10 text-emerald-600", label: "Active" },
    syncing:  { icon: RefreshCw,     cls: "bg-blue-500/10 text-blue-600",       label: "Syncing" },
    error:    { icon: XCircle,       cls: "bg-rose-500/10 text-rose-600",       label: "Error" },
    inactive: { icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-600",     label: "Inactive" },
  }[s];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full", cfg.cls)}>
      <Icon className={cn("w-3 h-3", s === "syncing" && "animate-spin")} />
      {cfg.label}
    </span>
  );
};

const planColors: Record<string, string> = { starter: "#94a3b8", pro: "#6366f1", enterprise: "#f59e0b" };
const planBg: Record<string, string>     = { starter: "#94a3b818", pro: "#6366f118", enterprise: "#f59e0b18" };
const statusColors: Record<string, string> = { active: "#10b981", trial: "#3b82f6", suspended: "#ef4444" };

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState<{ preset: number | null; range: DateRange | undefined }>({ preset: 30, range: undefined });

  // Drill-down state: tenant → workspace → session
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  // Tenant list filters
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantPlanFilter, setTenantPlanFilter] = useState<string>("all");
  const [tenantStatusFilter, setTenantStatusFilter] = useState<string>("all");

  const days = dateRange.preset ?? 30;
  const userData = sliceByDays(userGrowthData, days);
  const msgData  = sliceByDays(messageVolumeData, days);
  const sysData  = sliceByDays(systemMetricsData, days);
  const dsQ      = sliceByDays(dataSourceQueryTrend, days);
  const fbData   = sliceByDays(feedbackTrendData, days);

  const selectedTenant    = tenants.find(t => t.id === selectedTenantId) ?? null;
  const selectedWorkspace = workspaceDetails.find(w => w.id === selectedWorkspaceId) ?? null;

  const tenantWorkspaces = useMemo(() =>
    workspaceDetails.filter(w => w.tenantId === selectedTenantId),
    [selectedTenantId]
  );

  const workspaceSessions = useMemo(() =>
    chatSessions.filter(s => s.workspaceId === selectedWorkspaceId),
    [selectedWorkspaceId]
  );

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goToTenants = () => {
    setSelectedTenantId(null);
    setSelectedWorkspaceId(null);
    setExpandedWorkspaces(new Set());
    setSection("tenants");
  };

  const selectTenant = (id: string) => {
    setSelectedTenantId(id);
    setSelectedWorkspaceId(null);
    setExpandedWorkspaces(new Set());
  };

  const selectWorkspace = (id: string) => {
    setSelectedWorkspaceId(id);
  };

  const backToTenant = () => {
    setSelectedWorkspaceId(null);
  };

  // ── Active nav label ──────────────────────────────────────────────────────
  const activeNav = NAV.find(n => n.id === section)!;

  // Breadcrumb
  const breadcrumb = () => {
    if (section !== "tenants") return activeNav.label;
    if (selectedWorkspace && selectedTenant) return `${selectedTenant.name} / ${selectedWorkspace.name}`;
    if (selectedTenant) return selectedTenant.name;
    return "Tenants";
  };

  // ── Feedback summary helpers ──────────────────────────────────────────────
  const totalUp   = summaryStats.totalThumbsUp;
  const totalDown = summaryStats.totalThumbsDown;
  const satisfactionPct = Math.round((totalUp / (totalUp + totalDown)) * 100);

  // ═══════════════════════════════════════════════════════════════════════════
  //  SECTION: OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const renderOverview = () => (
    <div className="space-y-5">
      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total Users"     value={summaryStats.totalUsers.toLocaleString()}    sub={`${summaryStats.activeUsersToday} active today`}          icon={Users}         trend={summaryStats.userGrowthPct}    color="#6366f1" />
        <Stat label="Messages Sent"   value={summaryStats.totalMessages.toLocaleString()} sub={`+${summaryStats.messagesToday.toLocaleString()} today`}   icon={MessageSquare} trend={summaryStats.messageGrowthPct} color="#10b981" />
        <Stat label="Active Tenants"  value={`${summaryStats.activeTenants} / ${summaryStats.totalTenants}`} sub="tenants on platform" icon={Building2} color="#f59e0b" />
        <Stat label="Workspaces"      value={summaryStats.totalWorkspaces}                sub={`${summaryStats.totalDocuments.toLocaleString()} docs`}   icon={FolderOpen}    trend={summaryStats.workspacesGrowthPct} color="#8b5cf6" />
      </div>

      {/* KPI row 2 — Feedback + System */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="AI Satisfaction"  value={`${satisfactionPct}%`}           sub={`${totalUp.toLocaleString()} thumbs up`}     icon={ThumbsUp}    color="#10b981" />
        <Stat label="Negative Feedback" value={totalDown.toLocaleString()}      sub="thumbs down across all chats"                icon={ThumbsDown}  color="#ef4444" />
        <Stat label="Avg AI Response"  value={`${summaryStats.avgResponseMs} ms`} sub="last 30 days"                             icon={Clock}       color="#06b6d4" />
        <Stat label="Uptime"           value={`${summaryStats.uptime}%`}        sub="30-day SLA"                                 icon={ShieldCheck} color="#10b981" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CC title="User Growth" sub="New vs active users per day">
          <AdminChart data={userData} type="area" xKey="date"
            dataKeys={[{ key: "newUsers", label: "New Users", color: P }, { key: "activeUsers", label: "Active", color: G }]} />
        </CC>
        <CC title="AI Feedback Trend" sub="Thumbs up vs thumbs down over time">
          <AdminChart data={fbData} type="area" xKey="date"
            dataKeys={[{ key: "thumbsUp", label: "👍 Positive", color: G }, { key: "thumbsDown", label: "👎 Negative", color: R }]} />
        </CC>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CC title="Message Volume" sub="Daily messages and AI responses">
          <AdminChart data={msgData} type="area" xKey="date"
            dataKeys={[{ key: "messages", label: "Messages", color: P }, { key: "aiResponses", label: "AI Responses", color: C }]} />
        </CC>

        {/* Recent activity */}
        <CC title="Recent Activity" sub="Latest platform actions">
          <div className="space-y-1.5">
            {recentActivity.slice(0, 7).map((item) => {
              const Icon = { workspace: FolderOpen, document: FileText, chat: MessageSquare, user: Users, api: Zap }[item.type] ?? Activity;
              const c    = { workspace: "#6366f1",  document: "#f59e0b",  chat: "#10b981",    user: "#8b5cf6", api: "#06b6d4" }[item.type] ?? "#6366f1";
              return (
                <div key={item.id} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
                  <span className="p-1 rounded-md mt-0.5 shrink-0" style={{ background: `${c}18` }}>
                    <Icon className="w-3 h-3" style={{ color: c }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-foreground leading-snug truncate">
                      <span className="font-semibold">{item.user.split("@")[0]}</span>
                      <span className="text-muted-foreground"> {item.action} </span>
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CC>
      </div>

      {/* Content quality + Top queries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CC title="AI Response Quality" sub="Query resolution breakdown">
          <div className="space-y-3 mt-1">
            {contentQualityData.map((cq) => {
              const c = cq.name === "Answered" ? "#10b981" : cq.name === "Partial" ? "#f59e0b" : "#ef4444";
              return (
                <div key={cq.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-foreground font-medium">{cq.name}</span>
                    <span className="text-[13px] font-bold text-foreground">{cq.value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cq.value}%`, background: c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CC>

        <CC title="Top Search Queries" sub="Most searched this period" className="lg:col-span-2">
          <div className="space-y-2">
            {topSearchQueries.map((q, i) => (
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
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  SECTION: TENANTS — Tenant list
  // ═══════════════════════════════════════════════════════════════════════════
  const renderTenantList = () => {
    const PLANS   = ["all", "starter", "pro", "enterprise"] as const;
    const STATUSES = ["all", "active", "trial", "suspended"] as const;

    const filtered = tenants.filter(t => {
      const matchSearch = tenantSearch.trim() === "" ||
        t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
        t.domain.toLowerCase().includes(tenantSearch.toLowerCase()) ||
        t.adminEmail.toLowerCase().includes(tenantSearch.toLowerCase());
      const matchPlan   = tenantPlanFilter   === "all" || t.plan   === tenantPlanFilter;
      const matchStatus = tenantStatusFilter === "all" || t.status === tenantStatusFilter;
      return matchSearch && matchPlan && matchStatus;
    });

    const hasActiveFilters = tenantSearch !== "" || tenantPlanFilter !== "all" || tenantStatusFilter !== "all";

    const planChipStyle = (p: string) => ({
      active: p === tenantPlanFilter,
      bg:     p === tenantPlanFilter
        ? (p === "all" ? "bg-primary text-primary-foreground" : "")
        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
    });

    return (
      <div className="space-y-5">
        {/* Platform KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Total Tenants"  value={summaryStats.totalTenants} sub={`${summaryStats.activeTenants} active`} icon={Building2}    color="#6366f1" />
          <Stat label="Total Users"    value={summaryStats.totalUsers}   sub="across all tenants"                      icon={Users}         color="#10b981" />
          <Stat label="Workspaces"     value={summaryStats.totalWorkspaces} sub="active workspaces"                   icon={FolderOpen}    color="#f59e0b" />
          <Stat label="Total Messages" value={summaryStats.totalMessages.toLocaleString()} sub="all time"             icon={MessageSquare} color="#8b5cf6" />
        </div>

        {/* ── Search + filter bar ─────────────────────────────────────── */}
        <div className="rounded-xl bg-card border border-border p-3 space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, domain, or admin email…"
              value={tenantSearch}
              onChange={e => setTenantSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2 text-[13px] bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors"
            />
            {tenantSearch && (
              <button
                onClick={() => setTenantSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter chips row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Plan filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Plan</span>
              <div className="flex gap-1">
                {PLANS.map(p => (
                  <button key={p}
                    onClick={() => setTenantPlanFilter(p)}
                    className={cn(
                      "text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition-colors border",
                      tenantPlanFilter === p
                        ? "border-primary/60 text-primary-foreground"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    style={tenantPlanFilter === p ? {
                      background: p === "all" ? "hsl(var(--primary))" : planColors[p] ?? "hsl(var(--primary))",
                      borderColor: p === "all" ? "hsl(var(--primary))" : planColors[p] ?? "hsl(var(--primary))",
                    } : undefined}>
                    {p === "all" ? "All plans" : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Status</span>
              <div className="flex gap-1">
                {STATUSES.map(s => (
                  <button key={s}
                    onClick={() => setTenantStatusFilter(s)}
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition-colors border",
                      tenantStatusFilter === s
                        ? "border-transparent text-primary-foreground"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    style={tenantStatusFilter === s ? {
                      background: s === "all" ? "hsl(var(--primary))" : statusColors[s] ?? "hsl(var(--primary))",
                    } : undefined}>
                    {s !== "all" && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: tenantStatusFilter === s ? "white" : statusColors[s] ?? "#94a3b8" }} />
                    )}
                    {s === "all" ? "All statuses" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={() => { setTenantSearch(""); setTenantPlanFilter("all"); setTenantStatusFilter("all"); }}
                className="ml-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {tenants.length} tenants
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>

        {/* Tenant cards */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="rounded-xl bg-card border border-border px-6 py-12 flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-foreground">No tenants match your filters</p>
              <p className="text-xs text-muted-foreground">Try adjusting the search or filter options above</p>
              <button
                onClick={() => { setTenantSearch(""); setTenantPlanFilter("all"); setTenantStatusFilter("all"); }}
                className="mt-2 text-[12px] font-semibold text-primary hover:underline">
                Clear all filters
              </button>
            </div>
          ) : filtered.map((t) => {
            const tWorkspaces = workspaceDetails.filter(w => w.tenantId === t.id);
            const tSessions   = chatSessions.filter(s => s.tenantId === t.id);
            const tUp         = tSessions.reduce((acc, s) => acc + s.thumbsUp, 0);
            const tDown       = tSessions.reduce((acc, s) => acc + s.thumbsDown, 0);
            const tSat        = tUp + tDown > 0 ? Math.round((tUp / (tUp + tDown)) * 100) : 0;

            return (
              <div key={t.id}
                onClick={() => selectTenant(t.id)}
                className={cn(
                  "group rounded-xl bg-card border border-border p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all",
                  t.status === "suspended" && "opacity-70"
                )}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0"
                    style={{ background: planBg[t.plan], color: planColors[t.plan] }}>
                    {t.name.charAt(0)}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-foreground">{t.name}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: planBg[t.plan], color: planColors[t.plan] }}>{t.plan}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[t.status] }} />
                        <span className="capitalize" style={{ color: statusColors[t.status] }}>{t.status}</span>
                      </span>
                      {t.status === "trial" && t.trialEndsAt && (
                        <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                          Trial ends {t.trialEndsAt}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t.domain} · Admin: {t.adminEmail}</p>

                    {/* Metrics strip */}
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
                      {[
                        { label: "Users",        value: `${t.users} / ${t.maxUsers}` },
                        { label: "Workspaces",   value: String(tWorkspaces.length) },
                        { label: "Messages",     value: t.messages.toLocaleString() },
                        { label: "Docs",         value: t.documents.toLocaleString() },
                        { label: "Storage",      value: t.storage },
                        { label: "Satisfaction", value: tSat ? `${tSat}%` : "—" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                          <p className="text-[12px] font-semibold text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Storage bar */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${t.storageUsedPct}%`,
                          background: t.storageUsedPct > 80 ? "#ef4444" : t.storageUsedPct > 60 ? "#f59e0b" : "#10b981"
                        }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{t.storage} / {t.maxStorage}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-[11px] font-semibold text-primary group-hover:underline whitespace-nowrap">
                      View details →
                    </span>
                    <span className="text-[10px] text-muted-foreground">Last active {t.lastActive}</span>
                    <span className="text-[10px] text-muted-foreground">Joined {t.joinedDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SECTION: TENANTS — Tenant detail (workspace list)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderTenantDetail = () => {
    if (!selectedTenant) return null;
    const t = selectedTenant;
    const tSessions = chatSessions.filter(s => s.tenantId === t.id);
    const tUp    = tSessions.reduce((acc, s) => acc + s.thumbsUp, 0);
    const tDown  = tSessions.reduce((acc, s) => acc + s.thumbsDown, 0);
    const tSat   = tUp + tDown > 0 ? Math.round((tUp / (tUp + tDown)) * 100) : 0;
    const tMsgs  = tenantWorkspaces.reduce((acc, w) => acc + w.messages, 0);
    const tDocs  = tenantWorkspaces.reduce((acc, w) => acc + w.documents, 0);
    const tSessCount = tSessions.length;

    return (
      <div className="space-y-5">
        {/* Back */}
        <button onClick={() => setSelectedTenantId(null)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> All Tenants
        </button>

        {/* Tenant header */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-bold shrink-0"
              style={{ background: planBg[t.plan], color: planColors[t.plan] }}>
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[16px] font-bold text-foreground">{t.name}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: planBg[t.plan], color: planColors[t.plan] }}>{t.plan}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[t.status] }} />
                  <span className="capitalize" style={{ color: statusColors[t.status] }}>{t.status}</span>
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">{t.domain} · {t.adminEmail} · Joined {t.joinedDate}</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {[
              { label: "Users",       value: `${t.users} / ${t.maxUsers}`,   color: "#6366f1" },
              { label: "Workspaces",  value: String(tenantWorkspaces.length), color: "#f59e0b" },
              { label: "Messages",    value: tMsgs.toLocaleString(),          color: "#10b981" },
              { label: "Documents",   value: tDocs.toLocaleString(),          color: "#8b5cf6" },
              { label: "Sessions",    value: String(tSessCount),              color: "#06b6d4" },
              { label: "Satisfaction",value: tSat ? `${tSat}%` : "—",        color: tSat >= 80 ? "#10b981" : tSat >= 60 ? "#f59e0b" : "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg bg-muted/30 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-[15px] font-bold mt-0.5" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Storage */}
          <div className="flex items-center gap-2 mt-3">
            <p className="text-[11px] text-muted-foreground shrink-0">Storage</p>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${t.storageUsedPct}%`,
                background: t.storageUsedPct > 80 ? "#ef4444" : t.storageUsedPct > 60 ? "#f59e0b" : "#10b981"
              }} />
            </div>
            <p className="text-[11px] text-muted-foreground shrink-0">{t.storage} / {t.maxStorage} ({t.storageUsedPct}%)</p>
          </div>
        </div>

        {/* Feedback summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ThumbsUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Positive Feedback</p>
              <p className="text-[18px] font-bold text-emerald-500">{tUp.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <ThumbsDown className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Negative Feedback</p>
              <p className="text-[18px] font-bold text-rose-500">{tDown.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Satisfaction Score</p>
              <p className="text-[18px] font-bold text-blue-500">{tSat ? `${tSat}%` : "—"}</p>
            </div>
          </div>
        </div>

        {/* Workspace list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-semibold text-foreground">Workspaces
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">({tenantWorkspaces.length})</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Click a workspace to review sessions and data sources</p>
            </div>
            {tenantWorkspaces.length > 0 && (
              <button
                onClick={() => setExpandedWorkspaces(
                  expandedWorkspaces.size === tenantWorkspaces.length
                    ? new Set()
                    : new Set(tenantWorkspaces.map(w => w.id))
                )}
                className="text-[11px] font-semibold text-primary hover:underline">
                {expandedWorkspaces.size === tenantWorkspaces.length ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {tenantWorkspaces.map((ws) => {
              const wsSources  = dataSources.filter(ds => ws.dataSourceIds.includes(ds.id));
              const wsSessions = chatSessions.filter(s => s.workspaceId === ws.id);
              const wsUp   = wsSessions.reduce((acc, s) => acc + s.thumbsUp, 0);
              const wsDown = wsSessions.reduce((acc, s) => acc + s.thumbsDown, 0);
              const wsSat  = wsUp + wsDown > 0 ? Math.round((wsUp / (wsUp + wsDown)) * 100) : 0;
              const isExpanded = expandedWorkspaces.has(ws.id);
              const typeColor  = { personal: "#6366f1", shared: "#10b981", organization: "#f59e0b" }[ws.type];
              const errCount   = wsSources.reduce((s, d) => s + d.errorCount, 0);
              const hasError   = wsSources.some(d => d.status === "error");

              return (
                <div key={ws.id} className={cn("rounded-xl bg-card border overflow-hidden transition-shadow hover:shadow-sm",
                  hasError ? "border-rose-500/40" : "border-border")}>

                  {/* Header */}
                  <button onClick={() => toggleWorkspace(ws.id)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-muted/20 hover:bg-muted/30 transition-colors text-left">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${typeColor}18` }}>
                        <FolderOpen className="w-3.5 h-3.5" style={{ color: typeColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13px] font-semibold text-foreground">{ws.name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize shrink-0">{ws.type}</Badge>
                          {ws.status === "inactive" && <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">Inactive</Badge>}
                          {hasError && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-rose-500/10 text-rose-500">
                              <AlertTriangle className="w-2.5 h-2.5" />{errCount} error{errCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Last active {ws.lastActive} · {wsSources.length} data source{wsSources.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      {([
                        { icon: Users,         label: "Users",    value: String(ws.users) },
                        { icon: MessageSquare, label: "Msgs",     value: ws.messages.toLocaleString() },
                        { icon: BarChart3,     label: "Sessions", value: String(ws.sessions) },
                        { icon: ThumbsUp,      label: "Sat.",     value: wsSat ? `${wsSat}%` : "—" },
                        { icon: FileText,      label: "Docs",     value: ws.documents.toLocaleString() },
                      ] as { icon: React.ElementType; label: string; value: string }[]).map(({ icon: Icon, label, value }) => (
                        <div key={label} className="text-center hidden lg:block">
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                          <p className="text-[12px] font-semibold text-foreground">{value}</p>
                        </div>
                      ))}
                      <div className="pl-3 border-l border-border ml-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); selectWorkspace(ws.id); }}
                          className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap">
                          Sessions →
                        </button>
                      </div>
                      <div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>

                  {/* Expandable: Data Sources */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {wsSources.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border/60 bg-muted/10">
                                {["Data Source","Type","Status","Docs","Storage","Queries/mo","Sync Freq","Last Sync","Errors"].map((h, idx) => (
                                  <th key={h} className={cn("px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap",
                                    idx < 3 ? "text-left" : "text-right")}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {wsSources.map((ds, i) => (
                                <tr key={ds.id} className={cn("border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors",
                                  i % 2 === 0 && "bg-muted/5",
                                  ds.status === "error" && "bg-rose-500/5")}>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <img src={LOGO_MAP[ds.logo]} alt={ds.type} className="w-4 h-4 shrink-0 object-contain"
                                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                      <span className="text-[12px] font-medium text-foreground">{ds.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{ds.type}</td>
                                  <td className="px-4 py-2.5"><StatusBadge s={ds.status} /></td>
                                  <td className="px-4 py-2.5 text-right text-[12px] text-muted-foreground">{ds.documents.toLocaleString()}</td>
                                  <td className="px-4 py-2.5 text-right text-[12px] text-muted-foreground">{ds.storageUsed}</td>
                                  <td className="px-4 py-2.5 text-right text-[12px] text-muted-foreground">{ds.queriesThisMonth.toLocaleString()}</td>
                                  <td className="px-4 py-2.5 text-right text-[11px] text-muted-foreground whitespace-nowrap">{ds.syncFrequency}</td>
                                  <td className="px-4 py-2.5 text-right text-[11px] text-muted-foreground whitespace-nowrap">{ds.lastSync}</td>
                                  <td className="px-4 py-2.5 text-right">
                                    {ds.errorCount > 0
                                      ? <span className="text-[12px] font-bold text-rose-500">{ds.errorCount}</span>
                                      : <span className="text-[12px] font-bold text-emerald-500">—</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="px-4 py-6 flex flex-col items-center gap-2">
                          <Database className="w-5 h-5 text-muted-foreground/30" />
                          <p className="text-[12px] text-muted-foreground">No data sources connected to this workspace</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {tenantWorkspaces.length === 0 && (
              <div className="rounded-xl bg-card border border-border px-6 py-12 flex flex-col items-center gap-2">
                <FolderOpen className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No workspaces found for this tenant</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SECTION: TENANTS — Workspace detail (sessions)
  // ═══════════════════════════════════════════════════════════════════════════
  const renderWorkspaceDetail = () => {
    if (!selectedWorkspace || !selectedTenant) return null;
    const ws = selectedWorkspace;
    const wsSources = dataSources.filter(ds => ws.dataSourceIds.includes(ds.id));
    const wsUp   = workspaceSessions.reduce((acc, s) => acc + s.thumbsUp, 0);
    const wsDown = workspaceSessions.reduce((acc, s) => acc + s.thumbsDown, 0);
    const wsSat  = wsUp + wsDown > 0 ? Math.round((wsUp / (wsUp + wsDown)) * 100) : 0;
    const activeSessions = workspaceSessions.filter(s => s.status === "active").length;

    return (
      <div className="space-y-5">
        {/* Breadcrumb back */}
        <div className="flex items-center gap-2">
          <button onClick={backToTenant}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> {selectedTenant.name}
          </button>
          <span className="text-muted-foreground text-[12px]">/</span>
          <span className="text-[12px] font-semibold text-foreground">{ws.name}</span>
        </div>

        {/* Workspace header */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl shrink-0"
              style={{ background: `${{ personal: "#6366f1", shared: "#10b981", organization: "#f59e0b" }[ws.type]}18` }}>
              <FolderOpen className="w-5 h-5"
                style={{ color: { personal: "#6366f1", shared: "#10b981", organization: "#f59e0b" }[ws.type] }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[16px] font-bold text-foreground">{ws.name}</h2>
                <Badge variant="secondary" className="capitalize">{ws.type}</Badge>
                {ws.status === "inactive" && <Badge variant="destructive">Inactive</Badge>}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{selectedTenant.name} · Last active {ws.lastActive}</p>
            </div>
          </div>

          {/* Workspace KPIs */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {[
              { label: "Users",        value: String(ws.users),           color: "#6366f1" },
              { label: "Messages",     value: ws.messages.toLocaleString(), color: "#10b981" },
              { label: "Sessions",     value: String(ws.sessions),        color: "#f59e0b" },
              { label: "Active Now",   value: String(activeSessions),     color: "#06b6d4" },
              { label: "Docs",         value: ws.documents.toLocaleString(), color: "#8b5cf6" },
              { label: "Satisfaction", value: wsSat ? `${wsSat}%` : "—", color: wsSat >= 80 ? "#10b981" : "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg bg-muted/30 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-[15px] font-bold mt-0.5" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ThumbsUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Thumbs Up</p>
              <p className="text-[20px] font-bold text-emerald-500">{wsUp}</p>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <ThumbsDown className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Thumbs Down</p>
              <p className="text-[20px] font-bold text-rose-500">{wsDown}</p>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Satisfaction Score</p>
              <p className="text-[20px] font-bold text-blue-500">{wsSat ? `${wsSat}%` : "—"}</p>
            </div>
          </div>
        </div>

        {/* Chat Sessions table */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-foreground">Chat Sessions
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">({workspaceSessions.length})</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">All user chat sessions in this workspace with feedback metrics</p>
            </div>
            {activeSessions > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeSessions} live
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Session","User","Started","Duration","Messages","👍","👎","Feedback %","Avg Resp.","Status"].map((h, i) => (
                    <th key={h} className={cn("px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap",
                      i >= 4 ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workspaceSessions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-[12px] text-muted-foreground">No sessions recorded yet</td>
                  </tr>
                ) : workspaceSessions.map((sess, i) => (
                  <tr key={sess.id} className={cn("border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors",
                    i % 2 === 0 && "bg-muted/5")}>
                    <td className="px-4 py-2.5 max-w-[180px]">
                      <p className="text-[12px] font-semibold text-foreground truncate">{sess.title}</p>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-muted-foreground whitespace-nowrap">
                      {sess.user.split("@")[0]}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{sess.startedAt}</td>
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{sess.duration}</td>
                    <td className="px-4 py-2.5 text-right text-[12px] font-medium text-foreground">{sess.messages}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-500">
                        <ThumbsUp className="w-3 h-3" />{sess.thumbsUp}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {sess.thumbsDown > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-500">
                          <ThumbsDown className="w-3 h-3" />{sess.thumbsDown}
                        </span>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={cn("text-[12px] font-bold",
                        sess.feedbackRate >= 50 ? "text-emerald-500" : sess.feedbackRate >= 20 ? "text-amber-500" : "text-muted-foreground")}>
                        {sess.feedbackRate}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-[12px] text-muted-foreground">{sess.avgResponseMs} ms</td>
                    <td className="px-4 py-2.5 text-right">
                      {sess.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Ended</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Sources for this workspace */}
        {wsSources.length > 0 && (
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <p className="text-[13px] font-semibold text-foreground">Connected Data Sources
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">({wsSources.length})</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Source","Type","Status","Docs","Storage","Queries/mo","Last Sync","Errors"].map((h, idx) => (
                      <th key={h} className={cn("px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap",
                        idx < 3 ? "text-left" : "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wsSources.map((ds, i) => (
                    <tr key={ds.id} className={cn("border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors",
                      i % 2 === 0 && "bg-muted/5",
                      ds.status === "error" && "bg-rose-500/5")}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <img src={LOGO_MAP[ds.logo]} alt={ds.type} className="w-4 h-4 shrink-0 object-contain"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <span className="text-[12px] font-medium text-foreground">{ds.name}</span>
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
                          : <span className="text-[12px] font-bold text-emerald-500">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SECTION: SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  const renderSystem = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total API Calls" value={summaryStats.totalApiCalls.toLocaleString()} trend={4.1}     icon={Zap}         color="#6366f1" />
        <Stat label="Avg Response"    value={`${summaryStats.avgResponseMs} ms`}          sub="30-day avg" icon={Clock}       color="#10b981" />
        <Stat label="Error Rate"      value={`${summaryStats.errorRate}%`}                sub="below threshold" icon={Activity} color="#f59e0b" />
        <Stat label="Uptime"          value={`${summaryStats.uptime}%`}                   sub="30-day SLA" icon={ShieldCheck} color="#10b981" />
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

  // ═══════════════════════════════════════════════════════════════════════════
  //  Root render router
  // ═══════════════════════════════════════════════════════════════════════════
  const renderSection = () => {
    if (section === "overview") return renderOverview();
    if (section === "system")   return renderSystem();

    // tenants section: 3-level drill-down
    if (section === "tenants") {
      if (selectedWorkspaceId) return renderWorkspaceDetail();
      if (selectedTenantId)    return renderTenantDetail();
      return renderTenantList();
    }
    return null;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--background))" }}>

      {/* ── Dark sidebar ──────────────────────────────────────────────────── */}
      <aside className={cn("h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300", collapsed ? "w-[60px]" : "w-[210px]")}
        style={{ background: SB.bg, borderRight: `1px solid ${SB.border}` }}>

        {/* Logo */}
        <div className="flex items-center h-14 shrink-0 px-3" style={{ borderBottom: `1px solid ${SB.border}` }}>
          <img src={enplifyLogo} alt="Enplify.ai" className={cn("object-contain brightness-0 invert", collapsed ? "h-4" : "h-5")} />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {!collapsed && (
            <p className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: SB.mutedText }}>Analytics</p>
          )}
          {NAV.map((nav) => {
            const isActive = section === nav.id;
            return (
              <button key={nav.id} onClick={() => { setSection(nav.id); if (nav.id !== "tenants") { setSelectedTenantId(null); setSelectedWorkspaceId(null); } }}
                title={collapsed ? nav.label : undefined}
                className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-100 relative focus:outline-none", collapsed && "justify-center")}
                style={{ background: isActive ? SB.activeBg : "transparent", color: isActive ? SB.navActive : SB.nav }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = SB.border; (e.currentTarget as HTMLElement).style.color = SB.navHover; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = SB.nav; } }}>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full" style={{ background: SB.activeBar }} />}
                <nav.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-[13px] font-medium flex-1 text-left truncate">{nav.label}</span>}
              </button>
            );
          })}

          <div className="my-2 mx-1" style={{ height: 1, background: SB.border }} />

          <button onClick={() => navigate("/")} title={collapsed ? "Back to App" : undefined}
            className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-100 focus:outline-none", collapsed && "justify-center")}
            style={{ color: SB.label }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SB.border; (e.currentTarget as HTMLElement).style.color = SB.navHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = SB.label; }}>
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">Back to App</span>}
          </button>
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 shrink-0" style={{ borderTop: `1px solid ${SB.border}` }}>
          <button onClick={() => setCollapsed(v => !v)}
            className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors duration-100 focus:outline-none", collapsed && "justify-center")}
            style={{ color: SB.label }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SB.border; (e.currentTarget as HTMLElement).style.color = SB.navHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = SB.label; }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-[12px]">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card/70 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            {/* Breadcrumb */}
            {section === "tenants" && (selectedTenantId || selectedWorkspaceId) ? (
              <div className="flex items-center gap-1.5 text-[13px] min-w-0">
                <button onClick={goToTenants} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">Tenants</button>
                {selectedTenantId && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <button onClick={backToTenant}
                      className={cn("transition-colors shrink-0 truncate max-w-[140px]", selectedWorkspaceId ? "text-muted-foreground hover:text-foreground" : "font-semibold text-foreground")}>
                      {selectedTenant?.name}
                    </button>
                  </>
                )}
                {selectedWorkspaceId && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground truncate max-w-[140px]">{selectedWorkspace?.name}</span>
                  </>
                )}
              </div>
            ) : (
              <div>
                <h1 className="text-[15px] font-bold text-foreground leading-none">{activeNav.label}</h1>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {section === "overview" && "Platform-wide analytics snapshot"}
                  {section === "tenants"  && "Select a tenant to drill into workspaces and sessions"}
                  {section === "system"   && "API health and infrastructure metrics"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <span className="text-xs font-bold text-primary">A</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@enplify.ai</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <User className="w-4 h-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/")} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
