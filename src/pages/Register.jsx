import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { PrimaryButton, GhostButton } from "../components/ui/Button";
import Brand from "../components/Brand";
import { registerApi } from "../api/auth.api";

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

function FileBox({ title, subtitle, name, accept }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-extrabold text-white/90">{title}</div>
      <div className="mt-1 text-xs text-white/55">{subtitle}</div>
      <input
        name={name}
        type="file"
        accept={accept}
        className="mt-3 w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-black file:text-white hover:file:bg-white/15"
        required
      />
    </div>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [accepted, setAccepted] = useState(false);

  // NEW: type de compte
  // CLIENT = "client adhérent"
  // ASSOCIATION = "association"
  const [accountType, setAccountType] = useState("CLIENT");

  const isAssociation = accountType === "ASSOCIATION";

  const m = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      toast.success(
        t("register_success_otp_sent", "Inscription OK. OTP envoyé par email."),
      );
      nav("/otp", { state: { email: data?.user?.email } });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          t("register_error", "Erreur inscription"),
      );
    },
  });

  const canSubmit = useMemo(
    () => accepted && !m.isPending,
    [accepted, m.isPending],
  );

  function onSubmit(e) {
    e.preventDefault();

    if (!accepted) {
      return toast.error(
        t(
          "must_accept_terms",
          "Tu dois accepter les conditions d’utilisation.",
        ),
      );
    }

    const fd = new FormData(e.currentTarget);

    // ✅ Champs attendus/utile pour backend
    fd.set("acceptedConditions", "true");
    fd.set("accountType", accountType); // CLIENT | ASSOCIATION

    // Si ASSOCIATION: on force la suppression des fichiers si présents (sécurité)
    if (isAssociation) {
      fd.delete("idDoc");
      fd.delete("selfie");
    }

    // Debug
    console.group("📦 FormData envoyé au backend (/api/auth/register)");
    for (const [key, value] of fd.entries()) {
      if (value instanceof File) {
        console.log(key, {
          name: value.name,
          type: value.type,
          size: value.size,
        });
      } else {
        console.log(key, value);
      }
    }
    console.groupEnd();

    m.mutate(fd);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
        <div className="hidden text-xs text-white/45 md:block">
          {t("step_1_2", "Étape 1/2")}
        </div>
      </div>

      <Card className="p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xl font-black tracking-tight">
              {t("register_title")}
            </div>
            <div className="mt-1 text-sm text-white/55">
              {t("register_subtitle")}
            </div>
          </div>
          <div className="text-xs text-white/45 md:hidden">
            {t("step_1_2", "Étape 1/2")}
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Hidden */}
          <input
            type="hidden"
            name="consentAccepted"
            value={accepted ? "true" : "false"}
          />

          {/* NEW: Account Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={t("account_type", "Type de compte")}
              hint={t("required", "Obligatoire")}
            >
              <Select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="CLIENT" className="bg-slate-900">
                  {t("account_type_client", "Client adhérent")}
                </option>
                <option value="ASSOCIATION" className="bg-slate-900">
                  {t("account_type_association", "Association")}
                </option>
              </Select>
            </Field>

            {/* Petit helper */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/55">
              {isAssociation
                ? t(
                    "association_hint",
                    "Association: infos société + contacts. Pas de documents.",
                  )
                : t(
                    "client_hint",
                    "Client adhérent: formulaire complet + documents + selfie.",
                  )}
            </div>
          </div>

          {/* =========================
              ASSOCIATION FORM
             ========================= */}
          {isAssociation ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={t("company_name", "Nom de la société")}
                  hint={t("required", "Obligatoire")}
                >
                  <Input
                    name="companyName"
                    placeholder={t(
                      "company_name_ph",
                      "Ex: Association Xeer Ciise",
                    )}
                    required
                  />
                </Field>

                <Field
                  label={t("phone_1", "Téléphone 1")}
                  hint={t("required", "Obligatoire")}
                >
                  <Input
                    name="phone1"
                    placeholder={t("phone_placeholder", "Ex: 77 12 34 56")}
                    inputMode="tel"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={t("phone_2", "Téléphone 2")}
                  hint={t("optional", "Optionnel")}
                >
                  <Input
                    name="phone2"
                    placeholder={t("phone2_ph", "Ex: 75 00 00 00")}
                    inputMode="tel"
                  />
                </Field>

                <Field label={t("email")} hint={t("required", "Obligatoire")}>
                  <Input
                    name="email"
                    placeholder={t("email_placeholder", "Ex: contact@mail.com")}
                    type="email"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={t("password")}
                  hint={t("password_hint", "Min 8 caractères")}
                >
                  <Input
                    name="password"
                    placeholder="********"
                    type="password"
                    required
                  />
                </Field>

                <Field label={t("country")} hint={t("required", "Obligatoire")}>
                  <Input
                    name="country"
                    placeholder={t("country_placeholder", "Ex: Djibouti")}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("city")} hint={t("required", "Obligatoire")}>
                  <Input
                    name="city"
                    placeholder={t("city_placeholder", "Ex: Djibouti")}
                    required
                  />
                </Field>

                <Field
                  label={t("commune", "Commune")}
                  hint={t("required", "Obligatoire")}
                >
                  <Input
                    name="commune"
                    placeholder={t("commune_ph", "Ex: Ras-Dika / Balbala")}
                    required
                  />
                </Field>
              </div>
            </>
          ) : (
            /* =========================
               CLIENT FORM (EXISTING)
               ========================= */
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={t("full_name")}
                  hint={t("required", "Obligatoire")}
                >
                  <Input
                    name="fullName"
                    placeholder={t(
                      "full_name_placeholder",
                      "Ex: Abdourahman Youssouf",
                    )}
                    required
                  />
                </Field>

                <Field
                  label={t("phone")}
                  hint={t("phone_hint", "Ex: 77xxxxxx")}
                >
                  <Input
                    name="phone"
                    placeholder={t("phone_placeholder", "Ex: 77 12 34 56")}
                    inputMode="tel"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("email")} hint={t("required", "Obligatoire")}>
                  <Input
                    name="email"
                    placeholder={t("email_placeholder", "Ex: abdou@mail.com")}
                    type="email"
                    required
                  />
                </Field>

                <Field
                  label={t("password")}
                  hint={t("password_hint", "Min 8 caractères")}
                >
                  <Input
                    name="password"
                    placeholder="********"
                    type="password"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("country")} hint={t("required", "Obligatoire")}>
                  <Input
                    name="country"
                    placeholder={t("country_placeholder", "Ex: Djibouti")}
                    required
                  />
                </Field>

                <Field label={t("city")} hint={t("required", "Obligatoire")}>
                  <Input
                    name="city"
                    placeholder={t("city_placeholder", "Ex: Djibouti")}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FileBox
                  title={t("id_doc")}
                  subtitle={t("id_doc_hint", "PNG/JPG/PDF")}
                  name="idDoc"
                  accept="image/*,application/pdf"
                />
                <FileBox
                  title={t("selfie")}
                  subtitle={t("selfie_hint", "PNG/JPG")}
                  name="selfie"
                  accept="image/*"
                />
              </div>
            </>
          )}

          {/* Terms */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/20"
              />
              <div>
                <div className="text-sm font-extrabold text-white/90">
                  {t("accept_terms")}
                </div>
                <div className="mt-1 text-xs text-white/55">
                  {t("accept_terms_hint")}
                </div>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="grid gap-3 md:grid-cols-2">
            <PrimaryButton
              type="submit"
              loading={m.isPending}
              disabled={!canSubmit}
            >
              {t("submit_register")}
            </PrimaryButton>

            <GhostButton type="button" onClick={() => nav(-1)}>
              {t("back", "Retour")}
            </GhostButton>
          </div>

          <p className="text-xs text-white/40">
            {t(
              "register_footer_note",
              "En envoyant ce formulaire, vous acceptez nos conditions et lancez la vérification OTP.",
            )}
          </p>
        </form>
      </Card>
    </div>
  );
}
