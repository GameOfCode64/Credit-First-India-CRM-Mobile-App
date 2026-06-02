import type { Lead, LeadActivity } from "../types";
import { api } from "./api";

export const fetchMyLeads = async (campaignId?: string): Promise<Lead[]> => {
  const url = campaignId
    ? `/leads/my-leads?campaignId=${campaignId}`
    : "/leads/my-leads";
  const res = await api.get(url);
  return Array.isArray(res.data) ? res.data : (res.data.leads ?? []);
};

export const fetchLeadActivities = async (
  leadId: string,
): Promise<LeadActivity[]> => {
  const res = await api.get(`/leads/${leadId}/activities`);
  return res.data;
};

export const fetchPipeline = async () => {
  const res = await api.get("/pipeline");
  return res.data;
};

export const fetchCampaigns = async () => {
  const res = await api.get("/campaigns");
  return res.data;
};
