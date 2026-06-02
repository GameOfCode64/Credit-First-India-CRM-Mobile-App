import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { api } from "../../services/api";
import { initiateCall } from "../../services/call.service";
import { fetchLeadActivities } from "../../services/leads.service";
import { useAuthStore } from "../../store/Authstore";
import type { Lead, LeadActivity } from "../../types";

export default function LeadDetailScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { leadId } = useLocalSearchParams<{ leadId: string }>();

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ["lead", leadId],
    queryFn: async () => (await api.get(`/leads/${leadId}`)).data,
    enabled: !!leadId,
  });

  const { data: activities = [] } = useQuery<LeadActivity[]>({
    queryKey: ["lead-activities", leadId],
    queryFn: () => fetchLeadActivities(leadId!),
    enabled: !!leadId,
  });

  const callMutation = useMutation({
    mutationFn: () => initiateCall(leadId!, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-leads"] }),
  });

  if (isLoading || !lead) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  const metaEntries = Object.entries(lead.meta ?? {}).filter(([, v]) => v);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.zinc900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lead.personName || lead.companyName}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Lead hero card */}
        <View style={styles.heroCard}>
          <View style={[styles.heroAvatar, { backgroundColor: Colors.gold }]}>
            <Text style={styles.heroAvatarText}>
              {(lead.personName || lead.companyName || "?")[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroName}>
            {lead.personName || lead.companyName || "Unknown"}
          </Text>
          {lead.companyName && lead.personName && (
            <Text style={styles.heroCompany}>{lead.companyName}</Text>
          )}
          <View style={[styles.statusBadge]}>
            <Text style={styles.statusText}>{lead.status}</Text>
          </View>
        </View>

        {/* Contact + actions */}
        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={16} color={Colors.zinc500} />
            <Text style={styles.contactText}>{lead.phone}</Text>
          </View>

          <View style={styles.actionRow}>
            {/* Direct dial */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Linking.openURL(`tel:${lead.phone}`)}
            >
              <Ionicons name="call" size={18} color={Colors.zinc700} />
              <Text style={styles.actionBtnText}>Direct Call</Text>
            </TouchableOpacity>

            {/* CRM call via Exotel */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnGold,
                callMutation.isPending && { opacity: 0.6 },
              ]}
              onPress={() => callMutation.mutate()}
              disabled={callMutation.isPending}
            >
              {callMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                    Call via CRM
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Follow-up */}
        {lead.followUpAt && (
          <View style={styles.followUpCard}>
            <Ionicons name="calendar-outline" size={16} color={Colors.blue} />
            <Text style={styles.followUpText}>
              Follow-up:{" "}
              {new Date(lead.followUpAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}

        {/* Campaign */}
        {lead.campaign && (
          <View style={styles.infoRow}>
            <Ionicons
              name="megaphone-outline"
              size={15}
              color={Colors.zinc400}
            />
            <Text style={styles.infoLabel}>Campaign</Text>
            <Text style={styles.infoValue}>{lead.campaign.name}</Text>
          </View>
        )}

        {/* Meta fields */}
        {metaEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Info</Text>
            <View style={styles.metaGrid}>
              {metaEntries.map(([key, val]) => (
                <View key={key} style={styles.metaItem}>
                  <Text style={styles.metaKey}>{key}</Text>
                  <Text style={styles.metaVal}>{String(val)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Call History ({activities.length})
          </Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>No calls yet</Text>
          ) : (
            activities.map((act) => (
              <View key={act.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityDot,
                    { backgroundColor: act.outcome?.color ?? Colors.zinc300 },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.activityTop}>
                    <Text style={styles.activityOutcome}>
                      {act.outcome?.name ?? act.type}
                    </Text>
                    <Text style={styles.activityTime}>
                      {new Date(act.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Text>
                  </View>
                  {act.remark && (
                    <Text style={styles.activityRemark}>{act.remark}</Text>
                  )}
                  {act.user && (
                    <Text style={styles.activityUser}>by {act.user.name}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc200,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: Colors.zinc900,
  },

  body: { padding: 16, gap: 12, paddingBottom: 40 },

  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.zinc200,
    gap: 8,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  heroAvatarText: { color: "#fff", fontWeight: "800", fontSize: 26 },
  heroName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.zinc900,
    textAlign: "center",
  },
  heroCompany: { fontSize: 13, color: Colors.zinc500, textAlign: "center" },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.gold + "22",
    borderWidth: 1,
    borderColor: Colors.gold + "44",
  },
  statusText: { fontSize: 12, fontWeight: "700", color: Colors.gold },

  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    gap: 12,
  },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  contactText: { fontSize: 15, color: Colors.zinc700, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.zinc100,
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  actionBtnGold: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  actionBtnText: { fontSize: 13, fontWeight: "700", color: Colors.zinc700 },

  followUpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  followUpText: { fontSize: 13, color: Colors.blue, fontWeight: "600" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.zinc400,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: { fontSize: 13, color: Colors.zinc700, fontWeight: "600" },

  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.zinc400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  metaGrid: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    overflow: "hidden",
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc100,
  },
  metaKey: { fontSize: 12, color: Colors.zinc500, fontWeight: "600", flex: 1 },
  metaVal: { fontSize: 13, color: Colors.zinc800, flex: 1, textAlign: "right" },

  activityItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    flexShrink: 0,
  },
  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  activityOutcome: { fontSize: 13, fontWeight: "700", color: Colors.zinc800 },
  activityTime: { fontSize: 11, color: Colors.zinc400 },
  activityRemark: { fontSize: 12, color: Colors.zinc700, lineHeight: 18 },
  activityUser: { fontSize: 11, color: Colors.zinc400, marginTop: 4 },

  emptyText: {
    fontSize: 13,
    color: Colors.zinc400,
    textAlign: "center",
    paddingVertical: 16,
  },
});
