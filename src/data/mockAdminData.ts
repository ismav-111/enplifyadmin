import { subDays, format, subHours, subMinutes } from "date-fns";

function generateDailyData(days: number, base: number, variance: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return {
      date: format(date, "MMM dd"),
      value: Math.max(0, Math.round(base + (Math.random() - 0.4) * variance)),
    };
  });
}

export const userGrowthData = generateDailyData(30, 12, 8).map((d, i, arr) => ({
  ...d,
  total: 240 + arr.slice(0, i + 1).reduce((sum, x) => sum + x.value, 0),
  newUsers: d.value,
  activeUsers: Math.round(d.value * 0.7 + Math.random() * 5),
}));

export const messageVolumeData = generateDailyData(30, 420, 200).map((d) => ({
  ...d,
  messages: d.value,
  aiResponses: Math.round(d.value * 0.95),
}));

export const workspaceUsageData = [
  { name: "Personal", workspaces: 84, documents: 312, messages: 4210 },
  { name: "Shared", workspaces: 42, documents: 891, messages: 9870 },
  { name: "Organization", workspaces: 18, documents: 2140, messages: 21400 },
];

export const systemMetricsData = generateDailyData(30, 240, 80).map((d) => ({
  ...d,
  apiCalls: d.value * 3,
  avgResponseMs: Math.round(820 + (Math.random() - 0.5) * 300),
  errorRate: parseFloat((Math.random() * 0.8).toFixed(2)),
}));

// ── Data Sources ─────────────────────────────────────────────────────────────
export type DataSourceStatus = "active" | "syncing" | "error" | "inactive";

export interface DataSource {
  id: string;
  name: string;
  type: string;
  logo: string;
  status: DataSourceStatus;
  documents: number;
  lastSync: string;
  syncFrequency: string;
  storageUsed: string;
  queriesThisMonth: number;
  errorCount: number;
  workspaceId: string;
  tenantId: string;
}

export const dataSources: DataSource[] = [
  { id: "ds-1",  name: "SharePoint Corp",        type: "SharePoint",   logo: "sharepoint",   status: "active",   documents: 1248, lastSync: "3 min ago",   syncFrequency: "Every 15 min",   storageUsed: "4.2 GB",  queriesThisMonth: 12840, errorCount: 0,  workspaceId: "ws-1",  tenantId: "t-1" },
  { id: "ds-2",  name: "Snowflake DW",            type: "Snowflake",    logo: "snowflake",    status: "active",   documents: 214,  lastSync: "1 hr ago",    syncFrequency: "Every 6 hours",  storageUsed: "5.6 GB",  queriesThisMonth: 3180,  errorCount: 0,  workspaceId: "ws-1",  tenantId: "t-1" },
  { id: "ds-3",  name: "ServiceNow ITSM",         type: "ServiceNow",   logo: "servicenow",   status: "active",   documents: 890,  lastSync: "12 min ago",  syncFrequency: "Every 30 min",   storageUsed: "0.7 GB",  queriesThisMonth: 2890,  errorCount: 1,  workspaceId: "ws-1",  tenantId: "t-1" },
  { id: "ds-4",  name: "Google Drive – Mktg",     type: "Google Drive", logo: "google-drive", status: "active",   documents: 632,  lastSync: "8 min ago",   syncFrequency: "Every 30 min",   storageUsed: "1.8 GB",  queriesThisMonth: 8210,  errorCount: 2,  workspaceId: "ws-2",  tenantId: "t-1" },
  { id: "ds-5",  name: "SharePoint – Mktg",       type: "SharePoint",   logo: "sharepoint",   status: "syncing",  documents: 341,  lastSync: "Syncing now", syncFrequency: "Every hour",     storageUsed: "0.9 GB",  queriesThisMonth: 3420,  errorCount: 0,  workspaceId: "ws-2",  tenantId: "t-1" },
  { id: "ds-6",  name: "OneDrive – Legal",        type: "OneDrive",     logo: "onedrive",     status: "error",    documents: 312,  lastSync: "3 hr ago",    syncFrequency: "Every hour",     storageUsed: "0.9 GB",  queriesThisMonth: 1240,  errorCount: 14, workspaceId: "ws-3",  tenantId: "t-1" },
  { id: "ds-7",  name: "SharePoint – Exec",       type: "SharePoint",   logo: "sharepoint",   status: "active",   documents: 56,   lastSync: "45 min ago",  syncFrequency: "Every 2 hours",  storageUsed: "0.2 GB",  queriesThisMonth: 620,   errorCount: 0,  workspaceId: "ws-3",  tenantId: "t-1" },
  { id: "ds-8",  name: "GitHub Repos",            type: "SQL Database", logo: "sql-database", status: "active",   documents: 892,  lastSync: "5 min ago",   syncFrequency: "Every 15 min",   storageUsed: "2.1 GB",  queriesThisMonth: 7640,  errorCount: 0,  workspaceId: "ws-4",  tenantId: "t-2" },
  { id: "ds-9",  name: "Snowflake Analytics",     type: "Snowflake",    logo: "snowflake",    status: "active",   documents: 134,  lastSync: "2 hr ago",    syncFrequency: "Every 12 hours", storageUsed: "3.4 GB",  queriesThisMonth: 2410,  errorCount: 0,  workspaceId: "ws-4",  tenantId: "t-2" },
  { id: "ds-10", name: "Salesforce CRM",          type: "Salesforce",   logo: "salesforce",   status: "syncing",  documents: 4820, lastSync: "Syncing now", syncFrequency: "Every hour",     storageUsed: "2.1 GB",  queriesThisMonth: 6430,  errorCount: 0,  workspaceId: "ws-5",  tenantId: "t-2" },
  { id: "ds-11", name: "Zoho CRM",                type: "Zoho",         logo: "zoho",         status: "active",   documents: 445,  lastSync: "22 min ago",  syncFrequency: "Every hour",     storageUsed: "0.4 GB",  queriesThisMonth: 980,   errorCount: 0,  workspaceId: "ws-5",  tenantId: "t-2" },
  { id: "ds-12", name: "Google Drive – Product",  type: "Google Drive", logo: "google-drive", status: "active",   documents: 178,  lastSync: "18 min ago",  syncFrequency: "Every 30 min",   storageUsed: "0.6 GB",  queriesThisMonth: 2100,  errorCount: 0,  workspaceId: "ws-6",  tenantId: "t-2" },
  { id: "ds-13", name: "SharePoint Ops",          type: "SharePoint",   logo: "sharepoint",   status: "active",   documents: 2140, lastSync: "7 min ago",   syncFrequency: "Every 15 min",   storageUsed: "6.8 GB",  queriesThisMonth: 15200, errorCount: 0,  workspaceId: "ws-7",  tenantId: "t-3" },
  { id: "ds-14", name: "SQL Retail DB",           type: "SQL Database", logo: "sql-database", status: "error",    documents: 0,    lastSync: "5 hr ago",    syncFrequency: "Every 2 hours",  storageUsed: "0 GB",    queriesThisMonth: 0,     errorCount: 8,  workspaceId: "ws-7",  tenantId: "t-3" },
  { id: "ds-15", name: "Snowflake Retail DW",     type: "Snowflake",    logo: "snowflake",    status: "active",   documents: 512,  lastSync: "30 min ago",  syncFrequency: "Every 6 hours",  storageUsed: "12.4 GB", queriesThisMonth: 18900, errorCount: 0,  workspaceId: "ws-8",  tenantId: "t-3" },
  { id: "ds-16", name: "ServiceNow Tickets",      type: "ServiceNow",   logo: "servicenow",   status: "inactive", documents: 0,    lastSync: "3 days ago",  syncFrequency: "Manual",         storageUsed: "0 GB",    queriesThisMonth: 0,     errorCount: 0,  workspaceId: "ws-8",  tenantId: "t-3" },
];

export const dataSourceQueryTrend = generateDailyData(30, 1200, 400).map((d) => ({
  ...d,
  queries: d.value,
  errors: Math.max(0, Math.round(Math.random() * 6)),
}));

export const dataSourceStats = {
  total: 16,
  active: 10,
  syncing: 2,
  error: 3,
  inactive: 2,
  totalDocuments: 12814,
  totalStorage: "41.9 GB",
  totalQueriesMonth: 85860,
};

// ── Tenants ───────────────────────────────────────────────────────────────────
export type TenantPlan = "starter" | "pro" | "enterprise";
export type TenantStatus = "active" | "trial" | "suspended";

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: TenantPlan;
  status: TenantStatus;
  adminEmail: string;
  users: number;
  maxUsers: number;
  workspacesCount: number;
  maxWorkspaces: number;
  documents: number;
  storage: string;
  maxStorage: string;
  storageUsedPct: number;
  messages: number;
  dataSources: number;
  joinedDate: string;
  lastActive: string;
  trialEndsAt?: string;
  workspaceIds: string[];
}

export const tenants: Tenant[] = [
  {
    id: "t-1", name: "Acme Corporation", domain: "acme.com", plan: "enterprise",
    status: "active", adminEmail: "admin@acme.com",
    users: 64, maxUsers: 200, workspacesCount: 3, maxWorkspaces: 999,
    documents: 3443, storage: "14.3 GB", maxStorage: "500 GB", storageUsedPct: 3,
    messages: 21800, dataSources: 7, joinedDate: "Jan 2024", lastActive: "2 min ago",
    workspaceIds: ["ws-1", "ws-2", "ws-3"],
  },
  {
    id: "t-2", name: "TechStart Inc", domain: "techstart.io", plan: "pro",
    status: "active", adminEmail: "admin@techstart.io",
    users: 28, maxUsers: 50, workspacesCount: 3, maxWorkspaces: 20,
    documents: 6469, storage: "8.6 GB", maxStorage: "50 GB", storageUsedPct: 17,
    messages: 14280, dataSources: 5, joinedDate: "Mar 2024", lastActive: "18 min ago",
    workspaceIds: ["ws-4", "ws-5", "ws-6"],
  },
  {
    id: "t-3", name: "GlobalRetail Group", domain: "globalretail.com", plan: "enterprise",
    status: "active", adminEmail: "it@globalretail.com",
    users: 142, maxUsers: 500, workspacesCount: 2, maxWorkspaces: 999,
    documents: 2652, storage: "19.2 GB", maxStorage: "1 TB", storageUsedPct: 2,
    messages: 38400, dataSources: 4, joinedDate: "Sep 2023", lastActive: "5 min ago",
    workspaceIds: ["ws-7", "ws-8"],
  },
  {
    id: "t-4", name: "HealthBridge Labs", domain: "healthbridge.co", plan: "starter",
    status: "trial", adminEmail: "cto@healthbridge.co",
    users: 7, maxUsers: 10, workspacesCount: 1, maxWorkspaces: 5,
    documents: 84, storage: "0.3 GB", maxStorage: "5 GB", storageUsedPct: 6,
    messages: 1240, dataSources: 0, joinedDate: "Feb 2025", lastActive: "3 hr ago",
    trialEndsAt: "Mar 20, 2025",
    workspaceIds: ["ws-9"],
  },
  {
    id: "t-5", name: "LegacyFinance Ltd", domain: "legacyfinance.com", plan: "pro",
    status: "suspended", adminEmail: "admin@legacyfinance.com",
    users: 15, maxUsers: 50, workspacesCount: 1, maxWorkspaces: 20,
    documents: 421, storage: "1.1 GB", maxStorage: "50 GB", storageUsedPct: 2,
    messages: 4820, dataSources: 0, joinedDate: "Jun 2024", lastActive: "12 days ago",
    workspaceIds: ["ws-10"],
  },
];

// ── Workspace detail ─────────────────────────────────────────────────────────
export interface WorkspaceDetail {
  id: string;
  name: string;
  type: "personal" | "shared" | "organization";
  tenantId: string;
  users: number;
  messages: number;
  documents: number;
  storage: string;
  sessions: number;
  lastActive: string;
  dataSourceIds: string[];
  status: "active" | "inactive" | "archived";
}

export const workspaceDetails: WorkspaceDetail[] = [
  { id: "ws-1",  name: "Engineering Hub",    type: "organization", tenantId: "t-1", users: 28, messages: 4810, documents: 2352, storage: "10.5 GB", sessions: 184, lastActive: "2 min ago",   status: "active",   dataSourceIds: ["ds-1","ds-2","ds-3"] },
  { id: "ws-2",  name: "Marketing Team",     type: "shared",       tenantId: "t-1", users: 14, messages: 5230, documents: 973,  storage: "2.7 GB",  sessions: 97,  lastActive: "5 min ago",   status: "active",   dataSourceIds: ["ds-4","ds-5"] },
  { id: "ws-3",  name: "Executive Suite",    type: "organization", tenantId: "t-1", users: 5,  messages: 1980, documents: 368,  storage: "1.1 GB",  sessions: 41,  lastActive: "1 hr ago",    status: "active",   dataSourceIds: ["ds-6","ds-7"] },
  { id: "ws-4",  name: "Dev Platform",       type: "organization", tenantId: "t-2", users: 18, messages: 6240, documents: 1026, storage: "5.5 GB",  sessions: 210, lastActive: "10 min ago",  status: "active",   dataSourceIds: ["ds-8","ds-9"] },
  { id: "ws-5",  name: "Sales Operations",   type: "shared",       tenantId: "t-2", users: 9,  messages: 3920, documents: 5265, storage: "2.5 GB",  sessions: 73,  lastActive: "18 min ago",  status: "active",   dataSourceIds: ["ds-10","ds-11"] },
  { id: "ws-6",  name: "Product Research",   type: "shared",       tenantId: "t-2", users: 6,  messages: 2740, documents: 270,  storage: "1.8 GB",  sessions: 62,  lastActive: "34 min ago",  status: "active",   dataSourceIds: ["ds-12"] },
  { id: "ws-7",  name: "Store Operations",   type: "organization", tenantId: "t-3", users: 78, messages: 18200,documents: 2140, storage: "6.8 GB",  sessions: 420, lastActive: "3 min ago",   status: "active",   dataSourceIds: ["ds-13","ds-14"] },
  { id: "ws-8",  name: "Analytics & BI",     type: "organization", tenantId: "t-3", users: 24, messages: 9840, documents: 512,  storage: "12.4 GB", sessions: 180, lastActive: "30 min ago",  status: "active",   dataSourceIds: ["ds-15","ds-16"] },
  { id: "ws-9",  name: "Clinical Research",  type: "shared",       tenantId: "t-4", users: 7,  messages: 1240, documents: 84,   storage: "0.3 GB",  sessions: 28,  lastActive: "3 hr ago",    status: "active",   dataSourceIds: [] },
  { id: "ws-10", name: "Compliance Hub",     type: "organization", tenantId: "t-5", users: 0,  messages: 0,    documents: 421,  storage: "1.1 GB",  sessions: 0,   lastActive: "12 days ago", status: "inactive", dataSourceIds: [] },
];

// ── Chat Sessions per workspace ──────────────────────────────────────────────
export interface ChatSession {
  id: string;
  workspaceId: string;
  tenantId: string;
  user: string;
  title: string;
  messages: number;
  thumbsUp: number;
  thumbsDown: number;
  feedbackRate: number; // % of messages that received feedback
  avgResponseMs: number;
  startedAt: string;
  duration: string;
  status: "active" | "ended";
  topQuery: string;
}

const sessionTitles = [
  "Q3 Revenue Breakdown", "Onboarding Process FAQ", "Product Roadmap Review",
  "IT Ticket Escalation", "Sales Pipeline Analysis", "HR Leave Policy Lookup",
  "Engineering Standup Prep", "Legal Contract Review", "Marketing Campaign ROI",
  "Customer Churn Analysis", "Security Audit Checklist", "Sprint Planning Notes",
  "Competitor Analysis", "Budget Forecast 2025", "Incident Post-mortem",
];

function makeSessions(wsId: string, tenantId: string, users: string[], count: number): ChatSession[] {
  return Array.from({ length: count }, (_, i) => {
    const msgs = Math.floor(Math.random() * 28) + 4;
    const up = Math.floor(msgs * (0.4 + Math.random() * 0.4));
    const down = Math.floor(msgs * Math.random() * 0.15);
    const hoursAgo = Math.floor(Math.random() * 48);
    const minutesAgo = Math.floor(Math.random() * 59);
    return {
      id: `sess-${wsId}-${i}`,
      workspaceId: wsId,
      tenantId,
      user: users[i % users.length],
      title: sessionTitles[i % sessionTitles.length],
      messages: msgs,
      thumbsUp: up,
      thumbsDown: down,
      feedbackRate: Math.round(((up + down) / msgs) * 100),
      avgResponseMs: Math.round(600 + Math.random() * 600),
      startedAt: format(hoursAgo > 0 ? subHours(new Date(), hoursAgo) : subMinutes(new Date(), minutesAgo), "MMM d, HH:mm"),
      duration: `${Math.floor(Math.random() * 40) + 3} min`,
      status: Math.random() > 0.85 ? "active" : "ended",
      topQuery: sessionTitles[(i + 3) % sessionTitles.length].toLowerCase(),
    };
  });
}

export const chatSessions: ChatSession[] = [
  ...makeSessions("ws-1", "t-1", ["alice@acme.com","bob@acme.com","carol@acme.com"], 12),
  ...makeSessions("ws-2", "t-1", ["dave@acme.com","eve@acme.com"], 8),
  ...makeSessions("ws-3", "t-1", ["frank@acme.com","grace@acme.com"], 5),
  ...makeSessions("ws-4", "t-2", ["hank@techstart.io","iris@techstart.io","jay@techstart.io"], 14),
  ...makeSessions("ws-5", "t-2", ["kim@techstart.io","leo@techstart.io"], 7),
  ...makeSessions("ws-6", "t-2", ["mia@techstart.io"], 5),
  ...makeSessions("ws-7", "t-3", ["ned@globalretail.com","ora@globalretail.com","pete@globalretail.com"], 16),
  ...makeSessions("ws-8", "t-3", ["quinn@globalretail.com","rose@globalretail.com"], 9),
  ...makeSessions("ws-9", "t-4", ["sam@healthbridge.co"], 4),
];

// ── Summary stats ─────────────────────────────────────────────────────────────
export const summaryStats = {
  totalTenants: 5,
  activeTenants: 3,
  totalUsers: 256,
  activeUsersToday: 89,
  userGrowthPct: 12.4,
  totalMessages: 98430,
  messagesToday: 1284,
  messageGrowthPct: 8.7,
  totalWorkspaces: 10,
  workspacesGrowthPct: 5.2,
  totalDocuments: 13069,
  storageUsed: "43.6 GB",
  totalApiCalls: 284920,
  avgResponseMs: 834,
  errorRate: 0.34,
  uptime: 99.97,
  totalThumbsUp: chatSessions.reduce((s, c) => s + c.thumbsUp, 0),
  totalThumbsDown: chatSessions.reduce((s, c) => s + c.thumbsDown, 0),
};

export const topWorkspaces = workspaceDetails
  .filter(w => w.status === "active")
  .sort((a, b) => b.messages - a.messages)
  .slice(0, 7)
  .map(w => ({
    name: w.name, type: w.type,
    users: w.users, messages: w.messages, documents: w.documents, storage: w.storage,
  }));

export const recentActivity = [
  { id: "1", user: "alice@acme.com",        action: "Created workspace",  target: "Q1 Planning",       time: "2 min ago",  type: "workspace", tenantId: "t-1" },
  { id: "2", user: "bob@acme.com",          action: "Uploaded document",  target: "annual-report.pdf", time: "8 min ago",  type: "document",  tenantId: "t-1" },
  { id: "3", user: "carol@techstart.io",    action: "Sent 24 messages",   target: "Dev Platform",      time: "15 min ago", type: "chat",      tenantId: "t-2" },
  { id: "4", user: "dave@globalretail.com", action: "Invited 3 users",    target: "Store Operations",  time: "32 min ago", type: "user",      tenantId: "t-3" },
  { id: "5", user: "eve@acme.com",          action: "API key generated",  target: "Production",        time: "1 hr ago",   type: "api",       tenantId: "t-1" },
  { id: "6", user: "frank@techstart.io",    action: "Deleted document",   target: "draft-v1.docx",     time: "2 hr ago",   type: "document",  tenantId: "t-2" },
  { id: "7", user: "grace@healthbridge.co", action: "Created workspace",  target: "Clinical Research", time: "3 hr ago",   type: "workspace", tenantId: "t-4" },
  { id: "8", user: "henry@globalretail.com",action: "Sent 61 messages",   target: "Analytics & BI",    time: "4 hr ago",   type: "chat",      tenantId: "t-3" },
];

// ── Search analytics ─────────────────────────────────────────────────────────
export const topSearchQueries = [
  { query: "quarterly revenue report", count: 482, avgResults: 8.2 },
  { query: "onboarding process",        count: 374, avgResults: 12.1 },
  { query: "product roadmap 2025",      count: 291, avgResults: 5.4 },
  { query: "sales pipeline update",     count: 263, avgResults: 9.8 },
  { query: "IT ticket escalation",      count: 218, avgResults: 4.1 },
  { query: "leave policy HR",           count: 197, avgResults: 7.3 },
];

// ── Content quality ──────────────────────────────────────────────────────────
export const contentQualityData = [
  { name: "Answered", value: 84 },
  { name: "Partial",  value: 11 },
  { name: "No Answer", value: 5 },
];

// ── Feedback trend ───────────────────────────────────────────────────────────
export const feedbackTrendData = generateDailyData(30, 180, 60).map((d, i) => ({
  date: d.date,
  thumbsUp: d.value,
  thumbsDown: Math.max(0, Math.round(d.value * 0.12 + (Math.random() - 0.5) * 8)),
}));
