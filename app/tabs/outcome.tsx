import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { api } from "../../services/api";
import { saveCallOutcome } from "../../services/call.service";
import { fetchPipeline } from "../../services/leads.service";
import type { CallOutcome, Lead } from "../../types";

export default function OutcomeScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{
    leadId: string;
    activityId: string;
    duration: string;
    recordingUrl: string;
    callStatus: string;
  }>();

  const { leadId, activityId, duration, recordingUrl, callStatus } = params;

  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(
    null,
  );
  const [selectedOutcomeReasonId, setSelectedOutcomeReasonId] = useState<
    string | null
  >(null);
  const [remark, setRemark] = useState("");
  const [saved, setSaved] = useState(false);

  /* ── Fetch pipeline outcomes ── */
  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipeline,
  });

  /* ── Fetch lead details ── */
  const { data: lead } = useQuery<Lead>({
    queryKey: ["lead", leadId],
    queryFn: async () => (await api.get(`/leads/${leadId}`)).data,
    enabled: !!leadId,
  });

  /* ── All outcomes from pipeline ── */
  const outcomes: CallOutcome[] = [
    ...(pipeline?.activeStage ?? []),
    ...(pipeline?.closedStage ?? []),
  ];

  const selectedOutcome = outcomes.find((o) => o.id === selectedOutcomeId);

  /* ── Save mutation ── */
  const mutation = useMutation({
    mutationFn: () =>
      saveCallOutcome({
        activityId,
        leadId,
        outcomeId: selectedOutcomeId ?? undefined,
        outcomeReasonId: selectedOutcomeReasonId ?? undefined,
        remark: remark.trim() || undefined,
        duration: parseInt(duration ?? "0", 10),
        recordingUrl: recordingUrl || undefined,
      }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["my-leads"] });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      setTimeout(() => router.back(), 1500);
    },
    onError: (e: any) => {
      Alert.alert(
        "Error",
        e?.response?.data?.error ?? "Failed to save outcome",
      );
    },
  });

  const durationSecs = parseInt(duration ?? "0", 10);
  const durationStr =
    durationSecs > 0
      ? `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`
      : "—";

  if (saved) {
    return (
      <View style={styles.successWrap as any}>
        <View style={styles.successIcon as any}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle as any}>Outcome Saved</Text>
        <Text style={styles.successSub as any}>Going back to leads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root as any}>
      {/* Header */}
      <View style={styles.header as any}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn as any}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.zinc900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle as any}>Log Call Outcome</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body as any}
        keyboardShouldPersistTaps="handled"
      >
        {/* Lead info card */}
        {lead && (
          <View style={styles.leadCard as any}>
            <View
              style={
                [styles.leadAvatar, { backgroundColor: Colors.gold }] as any
              }
            >
              <Text style={styles.leadAvatarText as any}>
                {(lead.personName || lead.companyName || "?")[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.leadName as any}>
                {lead.personName || lead.companyName}
              </Text>
              {lead.companyName && lead.personName && (
                <Text style={styles.leadCompany as any}>
                  {lead.companyName}
                </Text>
              )}
              <Text style={styles.leadPhone as any}>{lead.phone}</Text>
            </View>
          </View>
        )}

        {/* Call stats */}
        <View style={styles.statsRow as any}>
          <View style={styles.statBox as any}>
            <Ionicons name="time-outline" size={18} color={Colors.gold} />
            <Text style={styles.statValue as any}>{durationStr}</Text>
            <Text style={styles.statLabel as any}>Duration</Text>
          </View>
          <View style={styles.statDivider as any} />
          <View style={styles.statBox as any}>
            <Ionicons
              name={callStatus === "completed" ? "call" : "call-outline"}
              size={18}
              color={
                callStatus === "completed" ? Colors.emerald : Colors.zinc400
              }
            />
            <Text style={styles.statValue as any}>
              {callStatus === "completed" ? "Connected" : (callStatus ?? "—")}
            </Text>
            <Text style={styles.statLabel as any}>Status</Text>
          </View>
          {!!recordingUrl && (
            <>
              <View style={styles.statDivider as any} />
              <View style={styles.statBox as any}>
                <Ionicons name="mic" size={18} color={Colors.blue} />
                <Text style={styles.statValue as any}>Available</Text>
                <Text style={styles.statLabel as any}>Recording</Text>
              </View>
            </>
          )}
        </View>

        {/* Outcome selection */}
        <Text style={styles.sectionLabel as any}>Select Outcome</Text>
        <View style={styles.outcomesGrid as any}>
          {outcomes.map((outcome) => (
            <TouchableOpacity
              key={outcome.id}
              style={
                [
                  styles.outcomeChip,
                  selectedOutcomeId === outcome.id && {
                    backgroundColor: outcome.color + "22",
                    borderColor: outcome.color,
                  },
                ] as any
              }
              onPress={() => {
                setSelectedOutcomeId(outcome.id);
                setSelectedOutcomeReasonId(null);
              }}
            >
              <View
                style={
                  [styles.outcomeDot, { backgroundColor: outcome.color }] as any
                }
              />
              <Text
                style={
                  [
                    styles.outcomeChipText,
                    selectedOutcomeId === outcome.id && {
                      color: outcome.color,
                      fontWeight: "700",
                    },
                  ] as any
                }
              >
                {outcome.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reason sub-selection */}
        {selectedOutcome?.reasons && selectedOutcome.reasons.length > 0 && (
          <>
            <Text style={styles.sectionLabel as any}>Reason (optional)</Text>
            <View style={styles.reasonsWrap as any}>
              {selectedOutcome.reasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={
                    [
                      styles.reasonChip,
                      selectedOutcomeReasonId === reason.id &&
                        styles.reasonChipActive,
                    ] as any
                  }
                  onPress={() =>
                    setSelectedOutcomeReasonId(
                      selectedOutcomeReasonId === reason.id ? null : reason.id,
                    )
                  }
                >
                  <Text
                    style={
                      [
                        styles.reasonText,
                        selectedOutcomeReasonId === reason.id &&
                          styles.reasonTextActive,
                      ] as any
                    }
                  >
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Remark */}
        <Text style={styles.sectionLabel as any}>Remark (optional)</Text>
        <TextInput
          style={styles.remarkInput as any}
          placeholder="Add a note about this call..."
          placeholderTextColor={Colors.zinc400}
          value={remark}
          onChangeText={setRemark}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Save button */}
        <TouchableOpacity
          style={[
            styles.saveBtn as any,
            (!selectedOutcomeId || mutation.isPending) &&
              styles.saveBtnDisabled,
          ]}
          onPress={() => mutation.mutate()}
          disabled={!selectedOutcomeId || mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.saveBtnText as any}>Save Outcome</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipBtn as any}
          onPress={() => router.back()}
        >
          <Text style={styles.skipText as any}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

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
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.zinc900 },

  body: { padding: 16, gap: 16, paddingBottom: 40 },

  leadCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  leadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  leadAvatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  leadName: { fontSize: 15, fontWeight: "700", color: Colors.zinc900 },
  leadCompany: { fontSize: 12, color: Colors.zinc500, marginTop: 1 },
  leadPhone: { fontSize: 12, color: Colors.zinc400, marginTop: 2 },

  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    overflow: "hidden",
  },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 4 },
  statValue: { fontSize: 13, fontWeight: "700", color: Colors.zinc900 },
  statLabel: {
    fontSize: 10,
    color: Colors.zinc400,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.zinc200,
    marginVertical: 10,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.zinc400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  outcomesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  outcomeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.zinc200,
  },
  outcomeDot: { width: 8, height: 8, borderRadius: 4 },
  outcomeChipText: { fontSize: 13, fontWeight: "600", color: Colors.zinc700 },

  reasonsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.zinc200,
  },
  reasonChipActive: {
    backgroundColor: Colors.gold + "22",
    borderColor: Colors.gold,
  },
  reasonText: { fontSize: 12, color: Colors.zinc500, fontWeight: "600" },
  reasonTextActive: { color: Colors.gold },

  remarkInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    padding: 12,
    fontSize: 14,
    color: Colors.zinc800,
    minHeight: 80,
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 15,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  skipBtn: { alignItems: "center", paddingVertical: 4 },
  skipText: { fontSize: 13, color: Colors.zinc400 },

  successWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bg,
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.emerald,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: { fontSize: 22, fontWeight: "700", color: Colors.zinc900 },
  successSub: { fontSize: 14, color: Colors.zinc400 },
});
