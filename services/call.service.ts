import { api } from "./api";

// Trigger Exotel call from desktop (or mobile)
export const initiateCall = async (leadId: string, agentUserId: string) => {
  const res = await api.post("/exotel/call", { leadId, agentUserId });
  return res.data;
};

// Save call outcome after call ends (from mobile app)
export const saveCallOutcome = async (payload: {
  activityId: string;
  leadId: string;
  outcomeId?: string;
  outcomeReasonId?: string;
  remark?: string;
  duration?: number;
  recordingUrl?: string;
}) => {
  const res = await api.post("/exotel/outcome", payload);
  return res.data;
};

// Register FCM token so push notifications reach this device
export const registerFcmToken = async (fcmToken: string) => {
  const res = await api.post("/exotel/fcm-token", { fcmToken });
  return res.data;
};

// Self clock-in/out
export const clockIn = async () => {
  const res = await api.post("/users/me/clock-in");
  return res.data;
};

export const clockOut = async () => {
  const res = await api.post("/users/me/clock-out");
  return res.data;
};

export const fetchMyAttendance = async () => {
  const res = await api.get("/users/me/attendance");
  return res.data;
};
