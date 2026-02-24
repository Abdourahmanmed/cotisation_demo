import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import Input from "../components/ui/Input";
import { PrimaryButton, GhostButton } from "../components/ui/Button";

import { loginApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-semibold text-white/90">{label}</label>
        {hint ? <span className="text-xs text-white/50">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState("");

  // si l'utilisateur arrive de /otp ou /register avec un email
  useEffect(() => {
    if (state?.email) setEmail(state.email);
  }, [state?.email]);

  const m = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      login(data);
      toast.success(t("login_success", "Connexion réussie ✅"));
      if (data?.user?.role === "ADMIN") nav("/admin");
      else nav("/client");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("login_error", "Erreur login"));
    },
  });

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !m.isPending;
  }, [email, password, m.isPending]);

  function onSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return toast.error(t("fill_required", "Veuillez remplir les champs requis."));
    }
    m.mutate({ email: email.trim(), password });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
      </div>

      <Card className="p-7">
        <div className="text-xl font-black tracking-tight">
          {t("login", "Se connecter")}
        </div>
        <div className="mt-1 text-sm text-white/55">
          {t("login_subtitle", "Accès client ou admin.")}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <Field label={t("email", "Email")} hint={t("required", "Obligatoire")}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email", "Email")}
              type="email"
              autoComplete="email"
              required
            />
          </Field>

          <Field
            label={t("password", "Mot de passe")}
            hint={t("required", "Obligatoire")}
          >
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-3">
            <PrimaryButton type="submit" loading={m.isPending} disabled={!canSubmit}>
              {t("login", "Se connecter")}
            </PrimaryButton>

            <GhostButton type="button" onClick={() => nav("/register")}>
              {t("create_account", "Créer un compte")}
            </GhostButton>

            <GhostButton type="button" onClick={() => nav(-1)}>
              {t("back", "Retour")}
            </GhostButton>
          </div>

          <p className="text-xs text-white/40">
            {t(
              "login_hint",
              "Conseil: si tu viens de t’inscrire, vérifie ton OTP puis connecte-toi."
            )}
          </p>
        </form>
      </Card>
    </div>
  );
}