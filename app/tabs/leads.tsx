import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { initiateCall } from "../../services/call.service";
import { fetchCampaigns, fetchMyLeads } from "../../services/leads.service";
import { useAuthStore } from "../../store/Authstore";
import type { Campaign, Lead } from "../../types";

export default function LeadsScreen() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  const {
    data: leads = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Lead[]>({
    queryKey: ["my-leads", campaignId],
    queryFn: () => fetchMyLeads(campaignId ?? undefined),
  });

  const callMutation = useMutation({
    mutationFn: ({ leadId }: { leadId: string }) =>
      initiateCall(leadId, user!.id),
    onMutate: ({ leadId }) => setCallingId(leadId),
    onSuccess: (_, { leadId }) => {
      showToast("📞 Connecting call...");
      setCallingId(null);
      qc.invalidateQueries({ queryKey: ["my-leads"] });
    },
    onError: (e: any) => {
      showToast(e?.response?.data?.error ?? "Call failed", true);
      setCallingId(null);
    },
  });

  const showToast = (msg: string, isError = false) => {
    setToast(isError ? `❌ ${msg}` : msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.personName?.toLowerCase().includes(q) ||
        l.companyName?.toLowerCase().includes(q) ||
        l.phone?.includes(q),
    );
  }, [leads, search]);

  const renderLead = ({ item: lead }: { item: Lead }) => (
    <View style={styles.card as any}>
      <View style={styles.cardTop as any}>
        {/* Avatar */}
        <View
          style={
            [styles.avatar, { backgroundColor: stringToColor(lead.id) }] as any
          }
        >
          <Text style={styles.avatarText as any}>
            {(lead.personName || lead.companyName || "?")[0].toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo as any}>
          <Text style={styles.cardName as any} numberOfLines={1}>
            {lead.personName || lead.companyName || "Unknown"}
          </Text>
          {lead.companyName && lead.personName ? (
            <Text style={styles.cardCompany as any} numberOfLines={1}>
              {lead.companyName}
            </Text>
          ) : null}
          <Text style={styles.cardPhone as any}>{lead.phone}</Text>
        </View>

        {/* Status badge */}
        <View
          style={
            [styles.statusBadge, { backgroundColor: Colors.zinc100 }] as any
          }
        >
          <Text style={styles.statusText as any} numberOfLines={1}>
            {lead.status}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.cardActions as any}>
        {/* Called today indicator */}
        {lead.calledToday && (
          <View style={styles.calledBadge as any}>
            <Ionicons
              name="checkmark-circle"
              size={12}
              color={Colors.emerald}
            />
            <Text style={styles.calledText as any}>Called today</Text>
          </View>
        )}

        <View style={{ flex: 1 }} />

        {/* Direct dial (opens phone app) */}
        <TouchableOpacity
          style={styles.dialBtn as any}
          onPress={() => Linking.openURL(`tel:${lead.phone}`)}
        >
          <Ionicons name="call-outline" size={16} color={Colors.zinc700} />
        </TouchableOpacity>

        {/* Exotel call (routes through CRM) */}
        <TouchableOpacity
          style={
            [
              styles.callBtn,
              callingId === lead.id && styles.callBtnLoading,
            ] as any
          }
          onPress={() => callMutation.mutate({ leadId: lead.id })}
          disabled={!!callingId}
        >
          {callingId === lead.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="phone-portrait-outline" size={15} color="#fff" />
              <Text style={styles.callBtnText as any}>Call via CRM</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root as any}>
      {/* Header */}
      <View style={styles.header as any}>
        <Text style={styles.headerTitle as any}>My Leads</Text>
        <Text style={styles.headerSub as any}>
          {leads.length} leads assigned
        </Text>
      </View>

      {/* Campaign filter chips */}
      {campaigns.length > 0 && (
        <FlatList
          horizontal
          data={[{ id: null, name: "All" } as any, ...campaigns]}
          keyExtractor={(c) => c.id ?? "all"}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow as any}
          renderItem={({ item: c }) => (
            <TouchableOpacity
              style={
                [styles.chip, campaignId === c.id && styles.chipActive] as any
              }
              onPress={() => setCampaignId(c.id ?? null)}
            >
              <Text
                style={
                  [
                    styles.chipText,
                    campaignId === c.id && styles.chipTextActive,
                  ] as any
                }
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Search */}
      <View style={styles.searchWrap as any}>
        <Ionicons
          name="search-outline"
          size={16}
          color={Colors.zinc400}
          style={styles.searchIcon as any}
        />
        <TextInput
          style={styles.searchInput as any}
          placeholder="Search name, company, phone..."
          placeholderTextColor={Colors.zinc400}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={Colors.zinc400} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centered as any}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered as any}>
          <Ionicons name="people-outline" size={40} color={Colors.zinc300} />
          <Text style={styles.emptyText as any}>No leads found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(l) => l.id}
          renderItem={renderLead}
          contentContainerStyle={styles.list as any}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.gold}
            />
          }
        />
      )}

      {/* Toast */}
      {!!toast && (
        <View style={styles.toast as any}>
          <Text style={styles.toastText as any}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

// Deterministic color from string
const stringToColor = (str: string) => {
  const colors = [
    Colors.gold,
    "#0d7a5f",
    Colors.blue,
    "#7c3aed",
    "#be123c",
    "#0369a1",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc200,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.zinc900 },
  headerSub: { fontSize: 12, color: Colors.zinc400, marginTop: 2 },

  chipsRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { fontSize: 12, fontWeight: "600", color: Colors.zinc700 },
  chipTextActive: { color: "#fff" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginTop: 0,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.zinc800 },

  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: "700", color: Colors.zinc900 },
  cardCompany: { fontSize: 12, color: Colors.zinc500, marginTop: 1 },
  cardPhone: { fontSize: 12, color: Colors.zinc400, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 90,
  },
  statusText: { fontSize: 10, fontWeight: "600", color: Colors.zinc700 },

  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  calledBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  calledText: { fontSize: 11, color: Colors.emerald, fontWeight: "600" },

  dialBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.zinc100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.gold,
  },
  callBtnLoading: { opacity: 0.7 },
  callBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 14, color: Colors.zinc400 },

  toast: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: Colors.zinc900,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  toastText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  // alias
});
