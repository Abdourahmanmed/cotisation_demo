import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { PrimaryButton } from "../components/ui/Button";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createSubscriptionApi,
  listSubscriptionsApi,
  consentApi,
} from "../api/subscriptions.api";
import LanguageSwitcher from "../components/LanguageSwitcher";

const BANKS_BY_COUNTRY = {
  Djibouti: ["Salaam Bank", "EXIM Bank", "BCIMR", "BRED", "CAC Bank"],
  Ethiopie: ["Commercial Bank of Ethiopia", "Dashen Bank", "Awash Bank"],
  France: ["BNP Paribas", "Société Générale", "Crédit Agricole", "Boursorama"],
};

const WALLET_PROVIDERS = [
  { id: "WAAFI", label: "Waafi" },
  { id: "CAC_PAY", label: "CAC Pay" },
  { id: "D_MONEY", label: "D-Money" },
  { id: "SABAPAY", label: "SabaPay" },
  { id: "DAHABPLACE", label: "Dahabplace" },
];

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  // =========================
  // STATE
  // =========================
  const [bankCountry, setBankCountry] = useState("Djibouti");
  const [bankName, setBankName] = useState("Salaam Bank");
  const [currency, setCurrency] = useState("DJF");

  const [paymentMethod, setPaymentMethod] = useState("WALLET"); // WALLET | BANK_TRANSFER
  const [mode, setMode] = useState("MANUAL"); // AUTOMATIC | MANUAL
  const [accountNumber, setAccountNumber] = useState("");

  const [walletProvider, setWalletProvider] = useState("WAAFI");
  const [walletAccount, setWalletAccount] = useState(user?.phone || "");

  const [amount, setAmount] = useState("6000");
  const [frequency, setFrequency] = useState("MONTHLY");

  // =========================
  // DERIVED
  // =========================
  const countries = useMemo(() => Object.keys(BANKS_BY_COUNTRY), []);
  const banksForCountry = useMemo(
    () => BANKS_BY_COUNTRY[bankCountry] || [],
    [bankCountry],
  );

  const isDjibouti = useMemo(
    () => bankCountry.trim().toLowerCase() === "djibouti",
    [bankCountry],
  );

  // =========================
  // EFFECTS
  // =========================
  // Si pays change et banque invalide => reset banque
  useEffect(() => {
    if (!banksForCountry.length) {
      setBankName("");
      return;
    }
    if (!banksForCountry.includes(bankName)) {
      setBankName(banksForCountry[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCountry, banksForCountry]);

  // Si wallet mais pays != Djibouti => switch auto en virement
  useEffect(() => {
    if (!isDjibouti && paymentMethod === "WALLET") {
      setPaymentMethod("BANK_TRANSFER");
    }
  }, [isDjibouti, paymentMethod]);

  // =========================
  // QUERIES
  // =========================
  const q = useQuery({
    queryKey: ["my-subs"],
    queryFn: listSubscriptionsApi,
  });

  const createM = useMutation({
    mutationFn: createSubscriptionApi,
    onSuccess: () => {
      toast.success(t("sub_created", "Cotisation créée ✅"));
      q.refetch();
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message ||
          t("sub_create_error", "Erreur création"),
      ),
  });

  const consentM = useMutation({
    mutationFn: ({ id }) => consentApi(id, true),
    onSuccess: () => {
      toast.success(t("consent_accepted", "Consentement accepté ✅"));
      q.refetch();
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message ||
          t("consent_error", "Erreur consentement"),
      ),
  });

  // =========================
  // SUBMIT
  // =========================
  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      bankCountry,
      bankName,
      currency,
      paymentMethod,
      amount: Number(amount || 0),
      frequency,
    };

    if (!payload.amount || payload.amount <= 0) {
      return toast.error(t("amount_required", "Montant requis."));
    }

    if (paymentMethod === "BANK_TRANSFER") {
      if (!accountNumber.trim())
        return toast.error(t("account_required", "Numéro de compte requis."));
      payload.mode = mode;
      payload.accountNumber = accountNumber.trim();
    } else {
      if (!isDjibouti)
        return toast.error(
          t("wallet_only_dj", "Wallet disponible uniquement pour Djibouti."),
        );
      if (!walletAccount.trim())
        return toast.error(t("wallet_required", "Numéro wallet requis."));
      payload.walletProvider = walletProvider;
      payload.walletAccount = walletAccount.trim();
    }

    createM.mutate(payload);
  }

  const subs = q.data?.subscriptions || [];
  const submitDisabled =
    createM.isPending ||
    (paymentMethod === "BANK_TRANSFER"
      ? !accountNumber.trim()
      : !walletAccount.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
        <LanguageSwitcher />
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/60">
            {user?.fullName} • <span className="font-bold">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
          >
            {t("logout", "Déconnexion")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* FORM */}
        <Card className="p-7 lg:col-span-7">
          <div className="text-xl font-black">
            {t("client_create_sub", "Créer une cotisation")}
          </div>
          <div className="mt-1 text-sm text-white/55">
            {t("client_sub_desc", "Wallet (Djibouti) ou virement bancaire.")}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Currency + PaymentMethod */}
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="DJF" className="bg-slate-900">
                  DJF
                </option>
                <option value="USD" className="bg-slate-900">
                  USD
                </option>
                <option value="EUR" className="bg-slate-900">
                  EUR
                </option>
              </Select>

              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="BANK_TRANSFER" className="bg-slate-900">
                  {t("bank_transfer", "Virement bancaire")}
                </option>
                <option
                  value="WALLET"
                  className="bg-slate-900"
                  disabled={!isDjibouti}
                >
                  {t("wallet_djibouti", "Wallet (Djibouti)")}
                </option>
              </Select>
            </div>

            {/* BANK TRANSFER */}
            {paymentMethod === "BANK_TRANSFER" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  value={bankCountry}
                  onChange={(e) => setBankCountry(e.target.value)}
                >
                  {countries.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">
                      {c}
                    </option>
                  ))}
                </Select>

                <Select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={!banksForCountry.length}
                >
                  {banksForCountry.length ? (
                    banksForCountry.map((b) => (
                      <option key={b} value={b} className="bg-slate-900">
                        {b}
                      </option>
                    ))
                  ) : (
                    <option value="" className="bg-slate-900">
                      {t("choose_country_first", "-- Choisir un pays --")}
                    </option>
                  )}
                </Select>

                <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="AUTOMATIC" className="bg-slate-900">
                    AUTOMATIC
                  </option>
                  <option value="MANUAL" className="bg-slate-900">
                    MANUAL
                  </option>
                </Select>

                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={t("account_number", "Numéro de compte")}
                />
              </div>
            ) : (
              /* WALLET */
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  value={walletProvider}
                  onChange={(e) => setWalletProvider(e.target.value)}
                >
                  {WALLET_PROVIDERS.map((w) => (
                    <option key={w.id} value={w.id} className="bg-slate-900">
                      {w.label}
                    </option>
                  ))}
                </Select>

                <Input
                  value={walletAccount}
                  onChange={(e) => setWalletAccount(e.target.value)}
                  placeholder={t("wallet_number", "Numéro wallet")}
                />
              </div>
            )}

            {/* Amount + Frequency */}
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder={t("amount", "Montant")}
                inputMode="numeric"
              />

              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="MONTHLY" className="bg-slate-900">
                  MONTHLY
                </option>
                <option value="QUARTERLY" className="bg-slate-900">
                  QUARTERLY
                </option>
                <option value="SEMIANNUAL" className="bg-slate-900">
                  SEMIANNUAL
                </option>
                <option value="ANNUAL" className="bg-slate-900">
                  ANNUAL
                </option>
              </Select>
            </div>

            <PrimaryButton
              type="submit"
              loading={createM.isPending}
              disabled={submitDisabled}
            >
              {t("create", "Créer")}
            </PrimaryButton>
          </form>
        </Card>

        {/* LIST */}
        <Card className="p-7 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">
              {t("my_subs", "Mes cotisations")}
            </div>
            <div className="text-xs text-white/45">
              {subs.length} {t("total", "total")}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {q.isLoading ? (
              <div className="text-sm text-white/60">
                {t("loading", "Chargement…")}
              </div>
            ) : q.isError ? (
              <div className="text-sm text-red-200">
                {t("load_error", "Erreur de chargement.")}
              </div>
            ) : subs.length === 0 ? (
              <div className="text-sm text-white/60">
                {t("no_subs", "Aucune cotisation.")}
              </div>
            ) : (
              subs.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold">
                      {s.paymentMethod}
                    </div>
                    <div className="text-xs text-white/50">{s.status}</div>
                  </div>

                  <div className="mt-2 text-xs text-white/60">
                    {s.bankCountry} • {s.bankName} • {s.currency}
                  </div>

                  <div className="mt-2 text-sm font-black text-emerald-200">
                    {s.amount} {s.currency} • {s.frequency}
                  </div>

                  {!s.consentAccepted ? (
                    <div className="mt-3">
                      <PrimaryButton
                        loading={consentM.isPending}
                        onClick={() => consentM.mutate({ id: s.id })}
                        type="button"
                      >
                        {t("accept_conditions", "Accepter les conditions")}
                      </PrimaryButton>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs font-bold text-emerald-200">
                      ✅ {t("consent_ok", "Consentement accepté")}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
