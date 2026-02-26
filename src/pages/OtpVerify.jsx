import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import Input from "../components/ui/Input";
import { PrimaryButton, GhostButton } from "../components/ui/Button";
import { verifyOtpApi } from "../api/otp.api";

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

export default function OtpVerify() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { state } = useLocation();

  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState("");

  const codeRef = useRef(null);

  // Focus auto sur le champ OTP
  useEffect(() => {
    codeRef.current?.focus?.();
  }, []);

  const m = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: () => {
      toast.success(t("otp_verified", "OTP vérifié ✅ Tu peux te connecter."));
      localStorage.setItem("invite_after_login", "1"); // ✅ flag
      nav("/login", { state: { email } });
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || t("otp_invalid", "OTP invalide"),
      ),
  });

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && /^\d{6}$/.test(code) && !m.isPending;
  }, [email, code, m.isPending]);

  function onSubmit(e) {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail) return toast.error(t("email_required", "Email requis"));
    if (!/^\d{6}$/.test(code))
      return toast.error(
        t("otp_code_6_digits", "Le code doit contenir 6 chiffres"),
      );

    m.mutate({ email: cleanEmail, code });
  }

  // UX: quand l'utilisateur atteint 6 chiffres => submit auto
  useEffect(() => {
    if (/^\d{6}$/.test(code) && email.trim() && !m.isPending) {
      // petite micro-délai pour éviter double submit si l'utilisateur clique
      const id = setTimeout(() => {
        m.mutate({ email: email.trim(), code });
      }, 120);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]); // volontaire: déclenche seulement quand code change

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
        <div className="text-xs text-white/45">
          {t("step_2_2", "Étape 2/2")}
        </div>
      </div>

      <Card className="p-7">
        <div className="text-xl font-black tracking-tight">
          {t("otp_title", "Vérification OTP")}
        </div>
        <div className="mt-1 text-sm text-white/55">
          {t("otp_desc_full", "Saisis le code reçu par email (6 chiffres).")}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <Field
            label={t("email", "Email")}
            hint={t("required", "Obligatoire")}
          >
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
            label={t("otp_code", "Code OTP")}
            hint={t("otp_6_digits", "6 chiffres")}
          >
            <Input
              ref={codeRef}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder={t("otp_placeholder", "Code (6 chiffres)")}
              inputMode="numeric"
              maxLength={6}
              required
            />
            <div className="mt-2 flex items-center justify-between text-xs text-white/45">
              <span>
                {t(
                  "otp_tip",
                  "Astuce: colle le code, on enlève automatiquement les lettres.",
                )}
              </span>
              <span className="font-bold text-white/60">{code.length}/6</span>
            </div>
          </Field>

          <div className="grid gap-3 md:grid-cols-3">
            <PrimaryButton
              type="submit"
              loading={m.isPending}
              disabled={!canSubmit}
            >
              {t("verify", "Vérifier")}
            </PrimaryButton>

            <GhostButton
              type="button"
              onClick={() => nav("/login", { state: { email } })}
            >
              {t("login", "Se connecter")}
            </GhostButton>

            <GhostButton type="button" onClick={() => nav(-1)}>
              {t("back", "Retour")}
            </GhostButton>
          </div>

          <p className="text-xs text-white/40">
            {t(
              "otp_footer",
              "Si tu ne reçois rien, vérifie Spam/Promotions ou réessaie avec le bon email.",
            )}
          </p>
        </form>
      </Card>
    </div>
  );
}
