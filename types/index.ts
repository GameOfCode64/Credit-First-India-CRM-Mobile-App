export interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  phone?: string | null;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  teamId?: string | null;
}

export interface Lead {
  id: string;
  personName: string;
  companyName: string;
  phone: string;
  status: string;
  followUpAt?: string | null;
  assignedToId?: string | null;
  campaignId?: string | null;
  campaign?: { id: string; name: string } | null;
  assignedTo?: { id: string; name: string } | null;
  calledToday?: boolean;
  lastCallTime?: string | null;
  meta?: Record<string, any>;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  source?: string | null;
  _count?: { leads: number };
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  type: "CALL" | "STATUS_CHANGE" | "REMARK" | "ASSIGNED";
  remark?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  outcome?: { id: string; name: string; color: string } | null;
  outcomeReason?: { id: string; label: string } | null;
  user?: { id: string; name: string } | null;
  createdAt: string;
}

export interface CallOutcome {
  id: string;
  key: string;
  name: string;
  color: string;
  stage: "ACTIVE" | "CLOSED";
  reasons: { id: string; label: string }[];
}

export interface AttendanceRecord {
  id?: string;
  date?: string;
  clockIn: string | null;
  clockOut: string | null;
}

export interface NotificationData {
  type: "CALL_INITIATED" | "LOG_OUTCOME";
  leadId: string;
  activityId: string;
  duration?: string;
  recordingUrl?: string;
  callStatus?: string;
}
