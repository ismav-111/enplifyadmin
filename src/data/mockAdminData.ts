import { subDays, format } from "date-fns";

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
  workspace: string;
}

export const dataSources: DataSource[] = [
  { id: "ds-1", name: "SharePoint Corp", type: "SharePoint", logo: "sharepoint", status: "active", documents: 1248, lastSync: "3 min ago", syncFrequency: "Every 15 min", storageUsed: "4.2 GB", queriesThisMonth: 12840, errorCount: 0, workspace: "Engineering Hub" },
  { id: "ds-2", name: "Snowflake DW", type: "Snowflake", logo: "snowflake", status: "active", documents: 214, lastSync: "1 hr ago", syncFrequency: "Every 6 hours", storageUsed: "5.6 GB", queriesThisMonth: 3180, errorCount: 0, workspace: "Engineering Hub" },
  { id: "ds-3", name: "ServiceNow ITSM", type: "ServiceNow", logo: "servicenow", status: "active", documents: 890, lastSync: "12 min ago", syncFrequency: "Every 30 min", storageUsed: "0.7 GB", queriesThisMonth: 2890, errorCount: 1, workspace: "Engineering Hub" },
  { id: "ds-4", name: "Google Drive – Mktg", type: "Google Drive", logo: "google-drive", status: "active", documents: 632, lastSync: "8 min ago", syncFrequency: "Every 30 min", storageUsed: "1.8 GB", queriesThisMonth: 8210, errorCount: 2, workspace: "Marketing Team" },
  { id: "ds-5", name: "SharePoint – Mktg", type: "SharePoint", logo: "sharepoint", status: "syncing", documents: 341, lastSync: "Syncing now", syncFrequency: "Every hour", storageUsed: "0.9 GB", queriesThisMonth: 3420, errorCount: 0, workspace: "Marketing Team" },
  { id: "ds-6", name: "Salesforce CRM", type: "Salesforce", logo: "salesforce", status: "syncing", documents: 4820, lastSync: "Syncing now", syncFrequency: "Every hour", storageUsed: "2.1 GB", queriesThisMonth: 6430, errorCount: 0, workspace: "Sales Operations" },
  { id: "ds-7", name: "Zoho CRM", type: "Zoho", logo: "zoho", status: "active", documents: 445, lastSync: "22 min ago", syncFrequency: "Every hour", storageUsed: "0.4 GB", queriesThisMonth: 980, errorCount: 0, workspace: "Sales Operations" },
  { id: "ds-8", name: "OneDrive – Legal", type: "OneDrive", logo: "onedrive", status: "error", documents: 312, lastSync: "3 hr ago", syncFrequency: "Every hour", storageUsed: "0.9 GB", queriesThisMonth: 1240, errorCount: 14, workspace: "Executive Suite" },
  { id: "ds-9", name: "SharePoint – Exec", type: "SharePoint", logo: "sharepoint", status: "active", documents: 56, lastSync: "45 min ago", syncFrequency: "Every 2 hours", storageUsed: "0.2 GB", queriesThisMonth: 620, errorCount: 0, workspace: "Executive Suite" },
  { id: "ds-10", name: "Google Drive – Product", type: "Google Drive", logo: "google-drive", status: "active", documents: 178, lastSync: "18 min ago", syncFrequency: "Every 30 min", storageUsed: "0.6 GB", queriesThisMonth: 2100, errorCount: 0, workspace: "Product Research" },
  { id: "ds-11", name: "Snowflake Analytics", type: "Snowflake", logo: "snowflake", status: "active", documents: 92, lastSync: "2 hr ago", syncFrequency: "Every 12 hours", storageUsed: "1.2 GB", queriesThisMonth: 840, errorCount: 0, workspace: "Product Research" },
  { id: "ds-12", name: "SQL Prod DB", type: "SQL Database", logo: "sql-database", status: "inactive", documents: 0, lastSync: "2 days ago", syncFrequency: "Manual", storageUsed: "0 GB", queriesThisMonth: 0, errorCount: 0, workspace: "Dev Sandbox" },
];

export const dataSourceQueryTrend = generateDailyData(30, 1200, 400).map((d) => ({
  ...d,
  queries: d.value,
  errors: Math.max(0, Math.round(Math.random() * 6)),
}));

export const dataSourceStats = {
  total: 12,
  active: 8,
  syncing: 2,
  error: 1,
  inactive: 1,
  totalDocuments: 9228,
  totalStorage: "18.6 GB",
  totalQueriesMonth: 42750,
};

// ── Workspace detail (per-workspace overview for admin) ───────────────────────
export interface WorkspaceDetail {
  id: string;
  name: string;
  type: "personal" | "shared" | "organization";
  users: number;
  messages: number;
  documents: number;
  storage: string;
  sessions: number;
  lastActive: string;
  dataSourceIds: string[];
}

export const workspaceDetails: WorkspaceDetail[] = [
  {
    id: "ws-1", name: "Engineering Hub", type: "organization",
    users: 28, messages: 4810, documents: 2352, storage: "10.5 GB", sessions: 184, lastActive: "2 min ago",
    dataSourceIds: ["ds-1", "ds-2", "ds-3"],
  },
  {
    id: "ws-2", name: "Marketing Team", type: "shared",
    users: 14, messages: 5230, documents: 973, storage: "2.7 GB", sessions: 97, lastActive: "5 min ago",
    dataSourceIds: ["ds-4", "ds-5"],
  },
  {
    id: "ws-3", name: "Sales Operations", type: "shared",
    users: 9, messages: 3920, documents: 5265, storage: "2.5 GB", sessions: 73, lastActive: "18 min ago",
    dataSourceIds: ["ds-6", "ds-7"],
  },
  {
    id: "ws-4", name: "Executive Suite", type: "organization",
    users: 5, messages: 1980, documents: 368, storage: "1.1 GB", sessions: 41, lastActive: "1 hr ago",
    dataSourceIds: ["ds-8", "ds-9"],
  },
  {
    id: "ws-5", name: "Product Research", type: "shared",
    users: 6, messages: 2740, documents: 270, storage: "1.8 GB", sessions: 62, lastActive: "34 min ago",
    dataSourceIds: ["ds-10", "ds-11"],
  },
  {
    id: "ws-6", name: "My Workspace", type: "personal",
    users: 1, messages: 1240, documents: 43, storage: "0.3 GB", sessions: 28, lastActive: "3 hr ago",
    dataSourceIds: [],
  },
  {
    id: "ws-7", name: "Dev Sandbox", type: "personal",
    users: 1, messages: 980, documents: 28, storage: "0.2 GB", sessions: 19, lastActive: "2 days ago",
    dataSourceIds: ["ds-12"],
  },
];

export const topWorkspaces = workspaceDetails.map(w => ({
  name: w.name, type: w.type, users: w.users, messages: w.messages, documents: w.documents, storage: w.storage,
}));

export const recentActivity = [
  { id: "1", user: "alice@company.com", action: "Created workspace", target: "Q1 Planning", time: "2 min ago", type: "workspace" },
  { id: "2", user: "bob@company.com", action: "Uploaded document", target: "annual-report.pdf", time: "8 min ago", type: "document" },
  { id: "3", user: "carol@company.com", action: "Sent 24 messages", target: "Marketing Team", time: "15 min ago", type: "chat" },
  { id: "4", user: "dave@company.com", action: "Invited user", target: "Engineering Hub", time: "32 min ago", type: "user" },
  { id: "5", user: "eve@company.com", action: "API key generated", target: "Production", time: "1 hr ago", type: "api" },
  { id: "6", user: "frank@company.com", action: "Deleted document", target: "draft-v1.docx", time: "2 hr ago", type: "document" },
  { id: "7", user: "grace@company.com", action: "Created workspace", target: "Legal Review", time: "3 hr ago", type: "workspace" },
  { id: "8", user: "henry@company.com", action: "Sent 61 messages", target: "Sales Operations", time: "4 hr ago", type: "chat" },
];

export const summaryStats = {
  totalUsers: 347,
  activeUsersToday: 89,
  userGrowthPct: 12.4,
  totalMessages: 98430,
  messagesToday: 1284,
  messageGrowthPct: 8.7,
  totalWorkspaces: 144,
  workspacesGrowthPct: 5.2,
  totalDocuments: 3343,
  storageUsed: "18.4 GB",
  totalApiCalls: 284920,
  avgResponseMs: 834,
  errorRate: 0.34,
  uptime: 99.97,
};

// ── Search analytics ─────────────────────────────────────────────────────────
export const topSearchQueries = [
  { query: "quarterly revenue report", count: 482, avgResults: 8.2 },
  { query: "onboarding process", count: 374, avgResults: 12.1 },
  { query: "product roadmap 2025", count: 291, avgResults: 5.4 },
  { query: "sales pipeline update", count: 263, avgResults: 9.8 },
  { query: "IT ticket escalation policy", count: 218, avgResults: 4.1 },
  { query: "leave policy HR", count: 197, avgResults: 7.3 },
];

// ── Content quality ──────────────────────────────────────────────────────────
export const contentQualityData = [
  { name: "Answered", value: 84 },
  { name: "Partial", value: 11 },
  { name: "No Answer", value: 5 },
];
