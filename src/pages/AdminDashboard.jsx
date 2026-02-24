import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/Badge";
import SectionTitle from "../components/ui/SectionTitle";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Drawer from "../components/ui/Drawer";
import { useTranslation } from "react-i18next";

import {
  getAdminDashboard,
  getAdminUsers,
  getAdminSubscriptions,
  patchUserStatus,
  patchUserRole,
  resetUserOtp,
  patchSubscriptionStatus,
  forceSubscriptionConsent,
  getUserDetails,
  getAudit,
} from "../api/admin.api";

// Charts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LanguageSwitcher from "../components/LanguageSwitcher";

const USER_STATUS_TONES = {
  PENDING_VERIFICATION: "yellow",
  ACTIVE: "green",
  SUSPENDED: "purple",
  BLOCKED: "red",
};

const SUB_STATUS_TONES = {
  DRAFT: "neutral",
  PENDING_CONSENT: "yellow",
  ACTIVE: "green",
  ACTIVE_MANUAL: "blue",
  CANCELLED: "red",
};

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "-";
  }
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs font-black text-white/55">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-white">
        {value ?? "-"}
      </div>
      {hint ? <div className="mt-2 text-xs text-white/45">{hint}</div> : null}
    </div>
  );
}

function SoftKpi({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-black text-white/55">{label}</div>
      <div className="mt-1 text-sm font-black text-white/85">
        {value ?? "-"}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  // Tabs
  const [tab, setTab] = useState("overview"); // overview | users | subscriptions | audit

  // Users
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Subs
  const [subSearch, setSubSearch] = useState("");
  const [subStatus, setSubStatus] = useState("ALL");

  // Audit filters + paging
  const [auditAction, setAuditAction] = useState("");
  const [auditEntity, setAuditEntity] = useState("");
  const [auditUserId, setAuditUserId] = useState("");
  const [auditLimit, setAuditLimit] = useState(25);
  const [auditOffset, setAuditOffset] = useState(0);

  // Queries
  const qStats = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });
  const qUsers = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });
  const qSubs = useQuery({
    queryKey: ["admin-subs"],
    queryFn: getAdminSubscriptions,
  });

  const qUserDetails = useQuery({
    queryKey: ["admin-user-details", selectedUserId],
    queryFn: () => getUserDetails(selectedUserId),
    enabled: !!selectedUserId,
  });

  const qAudit = useQuery({
    queryKey: [
      "admin-audit",
      auditAction,
      auditEntity,
      auditUserId,
      auditLimit,
      auditOffset,
    ],
    queryFn: () =>
      getAudit({
        action: auditAction || undefined,
        entity: auditEntity || undefined,
        userId: auditUserId || undefined,
        limit: auditLimit,
        offset: auditOffset,
      }),
    enabled: tab === "audit",
    keepPreviousData: true,
  });

  const stats = qStats.data?.stats;
  const users = qUsers.data?.users || [];
  const subs = qSubs.data?.subscriptions || [];

  // Derived data
  const usersFiltered = useMemo(() => {
    const s = userSearch.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      [u.fullName, u.email, u.phone, u.country, u.city, u.role, u.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s),
    );
  }, [users, userSearch]);

  const subsFiltered = useMemo(() => {
    const s = subSearch.trim().toLowerCase();
    return subs.filter((sub) => {
      const matchText = !s
        ? true
        : [
            sub.bankCountry,
            sub.bankName,
            sub.currency,
            sub.paymentMethod,
            sub.mode,
            sub.walletProvider,
            sub.walletAccount,
            sub.user?.fullName,
            sub.user?.email,
            sub.user?.phone,
            sub.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(s);

      const matchStatus = subStatus === "ALL" ? true : sub.status === subStatus;
      return matchText && matchStatus;
    });
  }, [subs, subSearch, subStatus]);

  // Charts data
  const userStatusData = useMemo(() => {
    const map = new Map();
    for (const u of users) map.set(u.status, (map.get(u.status) || 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [users]);

  const subStatusData = useMemo(() => {
    const map = new Map();
    for (const s of subs) map.set(s.status, (map.get(s.status) || 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [subs]);

  const subMethodData = useMemo(() => {
    const map = new Map();
    for (const s of subs)
      map.set(s.paymentMethod, (map.get(s.paymentMethod) || 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [subs]);

  // Mutations
  const mUserStatus = useMutation({
    mutationFn: ({ userId, status }) => patchUserStatus(userId, status),
    onSuccess: () => {
      toast.success(t("admin_user_status_updated"));
      qUsers.refetch();
      if (selectedUserId) qUserDetails.refetch();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || t("error_generic")),
  });

  const mUserRole = useMutation({
    mutationFn: ({ userId, role }) => patchUserRole(userId, role),
    onSuccess: () => {
      toast.success(t("admin_role_updated"));
      qUsers.refetch();
      if (selectedUserId) qUserDetails.refetch();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || t("error_generic")),
  });

  const mResetOtp = useMutation({
    mutationFn: (userId) => resetUserOtp(userId),
    onSuccess: () => {
      toast.success(t("admin_otp_reset_ok"));
      qUsers.refetch();
      if (selectedUserId) qUserDetails.refetch();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || t("error_generic")),
  });

  const mSubStatus = useMutation({
    mutationFn: ({ subscriptionId, status }) =>
      patchSubscriptionStatus(subscriptionId, status),
    onSuccess: () => {
      toast.success(t("admin_sub_status_updated"));
      qSubs.refetch();
      if (selectedUserId) qUserDetails.refetch();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || t("error_generic")),
  });

  const mForceConsent = useMutation({
    mutationFn: ({ subscriptionId, consentVersion }) =>
      forceSubscriptionConsent(subscriptionId, consentVersion),
    onSuccess: () => {
      toast.success(t("admin_consent_forced"));
      qSubs.refetch();
      if (selectedUserId) qUserDetails.refetch();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || t("error_generic")),
  });

  const auditTotal = qAudit.data?.total ?? 0;
  const auditItems = qAudit.data?.items ?? [];
  const canPrev = auditOffset > 0;
  const canNext = auditOffset + auditLimit < auditTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Brand />
        <LanguageSwitcher />
        <div className="flex items-center gap-3">
          <div className="hidden text-xs text-white/60 md:block">
            {user?.fullName} • <span className="font-bold">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10"
          >
            {t("logout")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "overview", label: t("admin_overview") },
          { id: "users", label: t("admin_clients") },
          { id: "subscriptions", label: t("admin_subscriptions") },
          { id: "audit", label: t("admin_audit") },
        ].map((tt) => (
          <button
            key={tt.id}
            onClick={() => setTab(tt.id)}
            className={[
              "rounded-full border px-4 py-2 text-xs font-black transition",
              tab === tt.id
                ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
            ].join(" ")}
          >
            {tt.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="p-7 lg:col-span-7">
            <SectionTitle
              title={t("admin_kpi")}
              subtitle={t("admin_kpi_sub")}
              right={
                <div className="text-xs text-white/45">
                  {qStats.isLoading ? t("loading") : "OK"}
                </div>
              }
            />

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <StatCard
                label={t("admin_total_users")}
                value={stats?.totalUsers}
              />
              <StatCard
                label={t("admin_active_users")}
                value={stats?.activeUsers}
              />
              <StatCard
                label={t("admin_total_subs")}
                value={stats?.totalSubscriptions}
              />
              <StatCard
                label={t("admin_active_subs")}
                value={stats?.activeSubscriptions}
                hint="ACTIVE + ACTIVE_MANUAL"
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-black text-white/60">
                  {t("admin_users_by_status")}
                </div>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userStatusData}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                      />
                      <ReTooltip />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-black text-white/60">
                  {t("admin_subs_by_status")}
                </div>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subStatusData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                      >
                        {subStatusData.map((_, i) => (
                          <Cell key={i} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-7 lg:col-span-5">
            <SectionTitle
              title={t("admin_payment_split")}
              subtitle={t("admin_payment_split_sub")}
            />
            <div className="mt-4 h-64 rounded-2xl border border-white/10 bg-white/5 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subMethodData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  />
                  <ReTooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55">
              {t("admin_tip_pending")}
            </div>
          </Card>
        </div>
      ) : null}

      {/* USERS */}
      {tab === "users" ? (
        <Card className="p-7">
          <SectionTitle
            title={t("admin_clients_title")}
            subtitle={t("admin_clients_sub")}
            right={
              <div className="w-72">
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={t("admin_search_user")}
                />
              </div>
            }
          />

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-2 bg-white/5 px-4 py-3 text-xs font-black text-white/60">
              <div className="col-span-3">{t("client")}</div>
              <div className="col-span-2">{t("phone")}</div>
              <div className="col-span-2">{t("country_city")}</div>
              <div className="col-span-2">{t("role")}</div>
              <div className="col-span-1">{t("status")}</div>
              <div className="col-span-2 text-right">{t("actions")}</div>
            </div>

            {qUsers.isLoading ? (
              <div className="px-4 py-6 text-sm text-white/60">
                {t("loading")}
              </div>
            ) : usersFiltered.length === 0 ? (
              <div className="px-4 py-6 text-sm text-white/60">
                {t("no_results")}
              </div>
            ) : (
              usersFiltered.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-12 items-center gap-2 border-t border-white/10 px-4 py-3 text-sm hover:bg-white/5"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className="col-span-3 text-left"
                    title={t("admin_user_details")}
                  >
                    <div className="font-extrabold text-white/90">
                      {u.fullName}
                    </div>
                    <div className="text-xs text-white/50">{u.email}</div>
                  </button>

                  <div className="col-span-2 text-white/75">{u.phone}</div>

                  <div className="col-span-2 text-white/70">
                    {u.country} / {u.city}
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={u.role}
                      onChange={(e) =>
                        mUserRole.mutate({ userId: u.id, role: e.target.value })
                      }
                    >
                      <option value="CLIENT" className="bg-slate-900">
                        CLIENT
                      </option>
                      <option value="ADMIN" className="bg-slate-900">
                        ADMIN
                      </option>
                    </Select>
                  </div>

                  <div className="col-span-1">
                    <Badge tone={USER_STATUS_TONES[u.status] || "neutral"}>
                      {u.status}
                    </Badge>
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <Select
                      value={u.status}
                      onChange={(e) =>
                        mUserStatus.mutate({
                          userId: u.id,
                          status: e.target.value,
                        })
                      }
                      className="max-w-[180px]"
                    >
                      {[
                        "PENDING_VERIFICATION",
                        "ACTIVE",
                        "SUSPENDED",
                        "BLOCKED",
                      ].map((s) => (
                        <option key={s} value={s} className="bg-slate-900">
                          {s}
                        </option>
                      ))}
                    </Select>

                    <button
                      onClick={() => mResetOtp.mutate(u.id)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10"
                      title="Reset OTP lock/counters"
                    >
                      Reset OTP
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {/* SUBSCRIPTIONS */}
      {tab === "subscriptions" ? (
        <Card className="p-7">
          <SectionTitle
            title={t("admin_subs_title")}
            subtitle={t("admin_subs_sub")}
            right={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-72">
                  <Input
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder={t("admin_search_sub")}
                  />
                </div>
                <div className="w-56">
                  <Select
                    value={subStatus}
                    onChange={(e) => setSubStatus(e.target.value)}
                  >
                    <option value="ALL" className="bg-slate-900">
                      {t("admin_all")}
                    </option>
                    {[
                      "DRAFT",
                      "PENDING_CONSENT",
                      "ACTIVE",
                      "ACTIVE_MANUAL",
                      "CANCELLED",
                    ].map((s) => (
                      <option key={s} value={s} className="bg-slate-900">
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            }
          />

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-2 bg-white/5 px-4 py-3 text-xs font-black text-white/60">
              <div className="col-span-3">{t("client")}</div>
              <div className="col-span-3">{t("payment")}</div>
              <div className="col-span-2">{t("amount")}</div>
              <div className="col-span-2">{t("status")}</div>
              <div className="col-span-2 text-right">{t("actions")}</div>
            </div>

            {qSubs.isLoading ? (
              <div className="px-4 py-6 text-sm text-white/60">
                {t("loading")}
              </div>
            ) : subsFiltered.length === 0 ? (
              <div className="px-4 py-6 text-sm text-white/60">
                {t("no_results")}
              </div>
            ) : (
              subsFiltered.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-12 items-center gap-2 border-t border-white/10 px-4 py-3 text-sm"
                >
                  <div className="col-span-3">
                    <div className="font-extrabold text-white/90">
                      {s.user?.fullName}
                    </div>
                    <div className="text-xs text-white/50">
                      {s.user?.email} • {s.user?.phone}
                    </div>
                    <div className="mt-1 text-[11px] text-white/45">
                      {fmtDate(s.createdAt)}
                    </div>
                  </div>

                  <div className="col-span-3 text-white/70">
                    <div className="font-black text-white/85">
                      {s.paymentMethod}
                    </div>
                    <div className="text-xs text-white/50">
                      {s.bankCountry} • {s.bankName} • {s.currency}
                    </div>
                    {s.paymentMethod === "WALLET" ? (
                      <div className="mt-1 text-xs text-white/60">
                        {s.walletProvider} • {s.walletAccount}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-white/60">
                        {s.mode} • {s.accountNumber || "-"}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <div className="font-black text-emerald-200">
                      {s.amount} {s.currency}
                    </div>
                    <div className="text-xs text-white/50">{s.frequency}</div>
                  </div>

                  <div className="col-span-2">
                    <Badge tone={SUB_STATUS_TONES[s.status] || "neutral"}>
                      {s.status}
                    </Badge>
                    <div className="mt-1 text-xs text-white/45">
                      Consent: {s.consentAccepted ? "✅" : "❌"}
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <Select
                      value={s.status}
                      onChange={(e) =>
                        mSubStatus.mutate({
                          subscriptionId: s.id,
                          status: e.target.value,
                        })
                      }
                      className="max-w-[190px]"
                    >
                      {[
                        "DRAFT",
                        "PENDING_CONSENT",
                        "ACTIVE",
                        "ACTIVE_MANUAL",
                        "CANCELLED",
                      ].map((st) => (
                        <option key={st} value={st} className="bg-slate-900">
                          {st}
                        </option>
                      ))}
                    </Select>

                    {!s.consentAccepted ? (
                      <button
                        onClick={() =>
                          mForceConsent.mutate({
                            subscriptionId: s.id,
                            consentVersion: "admin_force_v1",
                          })
                        }
                        className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-500/15"
                      >
                        {t("admin_force")}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/40"
                      >
                        {t("admin_ok")}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55">
            {t("admin_force_hint")}
          </div>
        </Card>
      ) : null}

      {/* AUDIT */}
      {tab === "audit" ? (
        <Card className="p-7">
          <SectionTitle
            title={t("admin_audit_title")}
            subtitle={t("admin_audit_sub")}
            right={
              <button
                onClick={() => qAudit.refetch()}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10"
              >
                {t("refresh")}
              </button>
            }
          />

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Input
              value={auditAction}
              onChange={(e) => setAuditAction(e.target.value)}
              placeholder={t("admin_action_ph")}
            />
            <Input
              value={auditEntity}
              onChange={(e) => setAuditEntity(e.target.value)}
              placeholder={t("admin_entity_ph")}
            />
            <Input
              value={auditUserId}
              onChange={(e) => setAuditUserId(e.target.value)}
              placeholder={t("admin_userid_ph")}
            />
            <Select
              value={auditLimit}
              onChange={(e) => {
                setAuditLimit(Number(e.target.value));
                setAuditOffset(0);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n} className="bg-slate-900">
                  {n} {t("per_page")}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-white/55">
              {t("total_label")}:{" "}
              <span className="font-black text-white/80">{auditTotal}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!canPrev}
                onClick={() =>
                  setAuditOffset((o) => Math.max(0, o - auditLimit))
                }
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("previous")}
              </button>
              <button
                disabled={!canNext}
                onClick={() => setAuditOffset((o) => o + auditLimit)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("next")}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-2 bg-white/5 px-4 py-3 text-xs font-black text-white/60">
              <div className="col-span-3">{t("admin")}</div>
              <div className="col-span-3">{t("admin_action")}</div>
              <div className="col-span-2">{t("entity")}</div>
              <div className="col-span-2">{t("date")}</div>
              <div className="col-span-2 text-right">{t("ip")}</div>
            </div>

            {qAudit.isLoading ? (
              <div className="px-4 py-6 text-sm text-white/60">
                {t("loading")}
              </div>
            ) : auditItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-white/60">
                {t("no_logs")}
              </div>
            ) : (
              auditItems.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-12 items-center gap-2 border-t border-white/10 px-4 py-3 text-sm"
                >
                  <div className="col-span-3">
                    <div className="font-extrabold text-white/90">
                      {a.user?.fullName || "—"}
                    </div>
                    <div className="text-xs text-white/50">
                      {a.user?.email || a.userId || "—"}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="font-black text-white/85">{a.action}</div>
                    <div className="text-xs text-white/50 line-clamp-1">
                      {a.entityId ? `#${a.entityId}` : "—"}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Badge tone="neutral">{a.entity}</Badge>
                  </div>

                  <div className="col-span-2 text-xs text-white/55">
                    {fmtDate(a.createdAt)}
                  </div>

                  <div className="col-span-2 text-right text-xs text-white/55">
                    {a.ip || "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {/* USER DETAILS DRAWER */}
      <Drawer
        open={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        title={t("admin_user_details")}
        subtitle={selectedUserId}
      >
        {qUserDetails.isLoading ? (
          <div className="text-sm text-white/60">{t("loading")}</div>
        ) : qUserDetails.isError ? (
          <div className="text-sm text-red-200">{t("error_details")}</div>
        ) : (
          <>
            {(() => {
              const u = qUserDetails.data?.user;
              if (!u)
                return (
                  <div className="text-sm text-white/60">{t("no_details")}</div>
                );

              return (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <SoftKpi label={t("name")} value={u.fullName} />
                    <SoftKpi label={t("role")} value={u.role} />
                    <SoftKpi label={t("email")} value={u.email} />
                    <SoftKpi label={t("phone")} value={u.phone} />
                    <SoftKpi label={t("country")} value={u.country} />
                    <SoftKpi label={t("city")} value={u.city} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black text-white/60">
                        {t("status")}
                      </div>
                      <Badge tone={USER_STATUS_TONES[u.status] || "neutral"}>
                        {u.status}
                      </Badge>
                    </div>
                    <div className="mt-3 text-xs text-white/50">
                      {t("created")}: {fmtDate(u.createdAt)} • {t("updated")}:{" "}
                      {fmtDate(u.updatedAt)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-black text-white/60">
                      {t("subscriptions")}
                    </div>
                    <div className="mt-3 space-y-2">
                      {u.subscriptions?.length ? (
                        u.subscriptions.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-xl border border-white/10 bg-white/5 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-black text-white/85">
                                {s.amount} {s.currency} • {s.frequency}
                              </div>
                              <Badge
                                tone={SUB_STATUS_TONES[s.status] || "neutral"}
                              >
                                {s.status}
                              </Badge>
                            </div>
                            <div className="mt-1 text-xs text-white/50">
                              {s.paymentMethod} • {s.bankCountry} • {s.bankName}
                            </div>
                            <div className="mt-2 text-[11px] text-white/45">
                              {fmtDate(s.createdAt)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-white/50">
                          {t("no_subs")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-black text-white/60">
                      {t("last_otps")}
                    </div>
                    <div className="mt-3 space-y-2">
                      {u.otps?.length ? (
                        u.otps.map((o) => (
                          <div
                            key={o.id}
                            className="rounded-xl border border-white/10 bg-white/5 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-black text-white/80">
                                {o.channel}
                              </div>
                              <div className="text-xs text-white/50">
                                {fmtDate(o.createdAt)}
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-white/55">
                              {t("expires")}: {fmtDate(o.expiresAt)} •{" "}
                              {t("attempts")}: {o.attempts} • {t("used")}:{" "}
                              {o.usedAt ? "✅" : "❌"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-white/50">
                          {t("no_otps")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </Drawer>
    </div>
  );
}
