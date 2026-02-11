import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
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
  const nav = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const m = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      toast.success("Inscription OK. OTP envoyé par email.");
      nav("/otp", { state: { email: data?.user?.email } });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Erreur inscription");
    },
  });

  const canSubmit = useMemo(
    () => accepted && !m.isPending,
    [accepted, m.isPending],
  );

  function onSubmit(e) {
    e.preventDefault();

    if (!accepted)
      return toast.error("Tu dois accepter les conditions d’utilisation.");

    const fd = new FormData(e.currentTarget);

    // ✅ NOM EXACT attendu par le backend
    fd.set("acceptedConditions", "true");

    // 🔍 Debug
    console.group("📦 FormData envoyé au backend");
    for (const [key, value] of fd.entries()) {
      console.log(key, value);
    }
    console.groupEnd();

    m.mutate(fd);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
        <div className="hidden text-xs text-white/45 md:block">Étape 1/2</div>
      </div>

      <Card className="p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xl font-black tracking-tight">Inscription</div>
            <div className="mt-1 text-sm text-white/55">
              Création du compte + documents. Ensuite vérification OTP par
              email.
            </div>
          </div>
          <div className="text-xs text-white/45 md:hidden">Étape 1/2</div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Hidden: garantit l’envoi même si le backend lit req.body */}
          <input
            type="hidden"
            name="accepted"
            value={accepted ? "true" : "false"}
          />
          <input
            type="hidden"
            name="consentAccepted"
            value={accepted ? "true" : "false"}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom complet" hint="Obligatoire">
              <Input
                name="fullName"
                placeholder="Ex: Abdourahman Youssouf"
                required
              />
            </Field>

            <Field label="Téléphone" hint="Ex: 77xxxxxx">
              <Input
                name="phone"
                placeholder="Ex: 77 12 34 56"
                inputMode="tel"
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email" hint="Obligatoire">
              <Input
                name="email"
                placeholder="Ex: abdou@mail.com"
                type="email"
                required
              />
            </Field>

            <Field label="Mot de passe" hint="Min 8 caractères">
              <Input
                name="password"
                placeholder="********"
                type="password"
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pays" hint="Obligatoire">
              <Input name="country" placeholder="Ex: Djibouti" required />
            </Field>

            <Field label="Ville" hint="Obligatoire">
              <Input name="city" placeholder="Ex: Djibouti" required />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FileBox
              title="Pièce d’identité"
              subtitle="PNG/JPG/PDF • max selon config"
              name="idDoc"
              accept="image/*,application/pdf"
            />
            <FileBox
              title="Selfie"
              subtitle="PNG/JPG"
              name="selfie"
              accept="image/*"
            />
          </div>

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
                  J’accepte les conditions d’utilisation
                </div>
                <div className="mt-1 text-xs text-white/55">
                  Ex : après confirmation, la cotisation suit les règles du
                  service.
                </div>
              </div>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <PrimaryButton
              type="submit"
              loading={m.isPending}
              disabled={!canSubmit}
            >
              Créer mon compte
            </PrimaryButton>
            <GhostButton type="button" onClick={() => nav(-1)}>
              Retour
            </GhostButton>
          </div>

          <p className="text-xs text-white/40">
            En envoyant ce formulaire, vous acceptez nos conditions et lancez la
            vérification OTP.
          </p>
        </form>
      </Card>
    </div>
  );
}
