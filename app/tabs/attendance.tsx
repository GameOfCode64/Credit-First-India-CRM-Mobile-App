import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import {
  clockIn,
  clockOut,
  fetchMyAttendance,
} from "../../services/call.service";
import { useAuthStore } from "../../store/Authstore";

export default function AttendanceScreen() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const {
    data: attendance,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: fetchMyAttendance,
    refetchInterval: 60_000,
  });

  const hasClockIn = !!attendance?.clockIn;
  const hasClockOut = !!attendance?.clockOut;
  const done = hasClockIn && hasClockOut;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-today"] });
      showToast("✅ Checked in successfully!");
    },
    onError: (e: any) =>
      showToast(e?.response?.data?.error ?? "Clock in failed", "error"),
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-today"] });
      showToast("👋 Checked out successfully!");
    },
    onError: (e: any) =>
      showToast(e?.response?.data?.error ?? "Clock out failed", "error"),
  });

  const loading = clockInMutation.isPending || clockOutMutation.isPending;

  const fmtTime = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={Colors.gold}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSub}>Mark your daily attendance</Text>
      </View>

      {/* Clock card */}
      <View style={styles.clockCard}>
        <View style={styles.clockIconWrap}>
          <Ionicons name="time-outline" size={32} color={Colors.gold} />
        </View>
        <Text style={styles.clockTime}>
          {now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Text>
        <Text style={styles.clockDate}>{fmtDate(now)}</Text>

        {/* Check-in/out times */}
        {(hasClockIn || hasClockOut) && (
          <View style={styles.timesRow}>
            {hasClockIn && (
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>CLOCK IN</Text>
                <Text style={[styles.timeValue, { color: Colors.emerald }]}>
                  {fmtTime(attendance?.clockIn)}
                </Text>
              </View>
            )}
            {hasClockOut && (
              <View
                style={[
                  styles.timeItem,
                  {
                    borderLeftWidth: 1,
                    borderLeftColor: Colors.zinc200,
                    paddingLeft: 20,
                  },
                ]}
              >
                <Text style={styles.timeLabel}>CLOCK OUT</Text>
                <Text style={[styles.timeValue, { color: Colors.zinc500 }]}>
                  {fmtTime(attendance?.clockOut)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action button */}
      {isLoading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 24 }} />
      ) : done ? (
        <View style={styles.doneCard}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.emerald} />
          <Text style={styles.doneText}>Attendance completed for today</Text>
        </View>
      ) : !hasClockIn ? (
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.clockInBtn,
            loading && styles.btnLoading,
          ]}
          onPress={() => clockInMutation.mutate()}
          disabled={loading}
          activeOpacity={0.85}
        >
          {clockInMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Clock In</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.clockOutBtn,
            loading && styles.btnLoading,
          ]}
          onPress={() => clockOutMutation.mutate()}
          disabled={loading}
          activeOpacity={0.85}
        >
          {clockOutMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Clock Out</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* User info */}
      <View style={styles.userCard}>
        <View style={[styles.userAvatar, { backgroundColor: Colors.gold }]}>
          <Text style={styles.userAvatarText}>
            {user?.name
              ?.split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role}</Text>
        </View>
      </View>

      {/* Toast */}
      {!!toast && (
        <View
          style={[
            styles.toast,
            toast.type === "error" ? styles.toastError : styles.toastSuccess,
          ]}
        >
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  header: { paddingTop: 44, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: Colors.zinc900 },
  headerSub: { fontSize: 13, color: Colors.zinc400, marginTop: 4 },

  clockCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.zinc200,
    marginBottom: 20,
  },
  clockIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.goldLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  clockTime: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.zinc900,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  clockDate: {
    fontSize: 13,
    color: Colors.zinc400,
    marginTop: 4,
    textAlign: "center",
  },

  timesRow: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc100,
    gap: 20,
  },
  timeItem: { alignItems: "center" },
  timeLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.zinc400,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  timeValue: { fontSize: 16, fontWeight: "700" },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 14,
    marginBottom: 16,
  },
  clockInBtn: { backgroundColor: Colors.gold },
  clockOutBtn: { backgroundColor: Colors.red },
  btnLoading: { opacity: 0.6 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },

  doneCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 16,
  },
  doneText: { fontSize: 14, fontWeight: "600", color: Colors.emerald },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    marginTop: 8,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  userName: { fontSize: 15, fontWeight: "700", color: Colors.zinc900 },
  userRole: {
    fontSize: 12,
    color: Colors.zinc400,
    marginTop: 2,
    textTransform: "capitalize",
  },

  toast: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  toastSuccess: { backgroundColor: Colors.zinc900 },
  toastError: { backgroundColor: Colors.red },
  toastText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
