import { useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { PrimaryButton, GhostButton } from "../components/ui/Button";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createSubscriptionApi,
  listSubscriptionsApi,
  consentApi,
} from "../api/subscriptions.api";

const WALLET_PROVIDERS = [
  { id: "WAAFI", label: "Waafi" },
  { id: "CAC_PAY", label: "CAC Pay" },
  { id: "D_MONEY", label: "D-Money" },
  { id: "SABAPAY", label: "SabaPay" },
  { id: "DAHABPLACE", label: "Dahabplace" },
];

export default function ClientDashboard() {
  const { user, logout } = useAuth();

  const [bankCountry, setBankCountry] = useState("Djibouti");
  const [bankName, setBankName] = useState("Salaam Bank");
  const [currency, setCurrency] = useState("DJF");

  const [paymentMethod, setPaymentMethod] = useState("WALLET"); // WALLET | BANK_TRANSFER
  const [mode, setMode] = useState("MANUAL");
  const [accountNumber, setAccountNumber] = useState("");

  const [walletProvider, setWalletProvider] = useState("WAAFI");
  const [walletAccount, setWalletAccount] = useState(user?.phone || "");

  const [amount, setAmount] = useState("6000");
  const [frequency, setFrequency] = useState("MONTHLY");

  const isDjibouti = useMemo(
    () => bankCountry.trim().toLowerCase() === "djibouti",
    [bankCountry],
  );

  // list subs
  const q = useQuery({
    queryKey: ["my-subs"],
    queryFn: listSubscriptionsApi,
  });

  const createM = useMutation({
    mutationFn: createSubscriptionApi,
    onSuccess: () => {
      toast.success("Cotisation créée ✅");
      q.refetch();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Erreur création"),
  });

  const consentM = useMutation({
    mutationFn: ({ id }) => consentApi(id, true),
    onSuccess: () => {
      toast.success("Consentement accepté ✅");
      q.refetch();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Erreur consentement"),
  });

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      bankCountry,
      bankName,
      currency,
      paymentMethod,
      amount: Number(amount),
      frequency,
    };

    if (paymentMethod === "BANK_TRANSFER") {
      payload.mode = mode;
      payload.accountNumber = accountNumber;
    } else {
      if (!isDjibouti)
        return toast.error("Wallet disponible uniquement pour Djibouti.");
      payload.walletProvider = walletProvider;
      payload.walletAccount = walletAccount;
    }

    createM.mutate(payload);
  }

  const subs = q.data?.subscriptions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/60">
            {user?.fullName} • <span className="font-bold">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="p-7 lg:col-span-7">
          <div className="text-xl font-black">Créer une cotisation</div>
          <div className="mt-1 text-sm text-white/55">
            Wallet (Djibouti) ou virement bancaire.
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={bankCountry}
                onChange={(e) => setBankCountry(e.target.value)}
                placeholder="Pays banque"
              />
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Banque"
              />
            </div>

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
                  Virement bancaire
                </option>
                <option
                  value="WALLET"
                  className="bg-slate-900"
                  disabled={!isDjibouti}
                >
                  Wallet (Djibouti)
                </option>
              </Select>
            </div>

            {paymentMethod === "BANK_TRANSFER" ? (
              <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="Numéro de compte"
                />
              </div>
            ) : (
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
                  placeholder="Numéro wallet"
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="Montant"
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

            <PrimaryButton type="submit" loading={createM.isPending}>
              Créer
            </PrimaryButton>
          </form>
        </Card>

        <Card className="p-7 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">Mes cotisations</div>
            <div className="text-xs text-white/45">{subs.length} total</div>
          </div>

          <div className="mt-4 space-y-3">
            {q.isLoading ? (
              <div className="text-sm text-white/60">Chargement…</div>
            ) : subs.length === 0 ? (
              <div className="text-sm text-white/60">Aucune cotisation.</div>
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
                        Accepter les conditions
                      </PrimaryButton>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs font-bold text-emerald-200">
                      ✅ Consentement accepté
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
