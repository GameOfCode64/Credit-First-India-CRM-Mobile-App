import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { useAuthStore } from "../../store/Authstore";

const ROLES = [
  { label: "Employee", value: "EMPLOYEE" },
  { label: "Manager", value: "MANAGER" },
];

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError("Enter your email/username and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(identifier.trim(), password);
      router.replace("/tabs/leads");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleLabel =
    ROLES.find((r) => r.value === role)?.label ?? "Select";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page heading (outside card, matches screenshot) ── */}
        <View style={styles.headingWrap}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.headingSub}>
            Sign in to your account to continue
          </Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          {/* Email or Username */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor={Colors.zinc400}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Enter your password"
                placeholderTextColor={Colors.zinc400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity
                onPress={() => setShowPw((p) => !p)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPw ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.zinc400}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Role dropdown */}
          {/* <View style={styles.fieldWrap}>
            <Text style={styles.label}>Role</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowRoleMenu((p) => !p)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !role && { color: Colors.zinc400 },
                ]}
              >
                {selectedRoleLabel}
              </Text>
              <Ionicons
                name={showRoleMenu ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.zinc400}
              />
            </TouchableOpacity>

            {showRoleMenu && (
              <View style={styles.dropdownMenu}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.dropdownItem,
                      role === r.value && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setRole(r.value);
                      setShowRoleMenu(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        role === r.value && styles.dropdownItemTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                    {role === r.value && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.gold}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View> */}

          {/* Remember me */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe((p) => !p)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxActive]}
            >
              {rememberMe && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>
            <Text style={styles.rememberText}>Remember me for 7 days</Text>
          </TouchableOpacity>

          {/* Error */}
          {!!error && (
            <View style={styles.errorWrap}>
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={Colors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Sign In button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text style={styles.footerLink}>Contact your administrator</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* Heading */
  headingWrap: { marginBottom: 28 },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.gold,
    letterSpacing: -0.5,
  },
  headingSub: {
    fontSize: 14,
    color: Colors.zinc500,
    marginTop: 6,
    lineHeight: 20,
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  /* Fields */
  fieldWrap: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.zinc700,
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.zinc900,
    backgroundColor: Colors.white,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    borderRadius: 10,
    paddingLeft: 14,
    backgroundColor: Colors.white,
  },
  eyeBtn: { padding: 12 },

  /* Dropdown */
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.zinc200,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
  },
  dropdownText: { fontSize: 14, color: Colors.zinc900 },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: Colors.zinc200,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: Colors.white,
    overflow: "hidden",
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownItemActive: { backgroundColor: Colors.goldLight },
  dropdownItemText: { fontSize: 14, color: Colors.zinc700 },
  dropdownItemTextActive: { color: Colors.gold, fontWeight: "700" },

  /* Remember me */
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.zinc300,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  rememberText: { fontSize: 14, color: Colors.zinc700 },

  /* Error */
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
    backgroundColor: Colors.redLight,
    padding: 10,
    borderRadius: 8,
  },
  errorText: { fontSize: 12, color: Colors.danger, flex: 1 },

  /* Button */
  btn: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gold,
  },
  btnDisabled: { opacity: 0.6 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  /* Footer */
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
    flexWrap: "wrap",
  },
  footerText: { fontSize: 13, color: Colors.zinc500 },
  footerLink: { fontSize: 13, color: Colors.gold, fontWeight: "700" },
});
