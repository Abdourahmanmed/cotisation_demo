import React, { useMemo, useEffect, useState } from "react";

/** =========================
 *  Fake DB (MVP local)
 *  ========================= */
const BANKS = [
  {
    id: "exim",
    name: "EXIM Bank",
    accounts: ["100200300", "100200301", "100200302"],
  },
  { id: "salaam", name: "Salaam Bank", accounts: ["200300400", "200300401"] },
  { id: "mtn", name: "MTN Money", accounts: ["77001122", "77001133"] },
];

const FAKE_USERS = [
  {
    id: "u_admin",
    role: "ADMIN",
    email: "admin@vip.com",
    password: "admin123",
    fullName: "VIP Admin",
    phone: "77 00 00 00",
  },
  {
    id: "u_client",
    role: "CLIENT",
    email: "client@vip.com",
    password: "client123",
    fullName: "Client VIP",
    phone: "77 12 34 56",
    address: "Djibouti, Plateau",
  },
];

// Cotisations (exemple demo)
const FAKE_COTISATIONS = [
  {
    id: "c_001",
    userId: "u_client",
    bankId: "exim",
    accountNumber: "100200300",
    amount: 6000,
    months: 6,
    total: 36000,
    status: "CONFIRMED", // PENDING | CONFIRMED
    createdAt: new Date().toISOString(),
  },
];

/** =========================
 *  Helpers UI
 *  ========================= */
const cn = (...classes) => classes.filter(Boolean).join(" ");

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80">
      {children}
    </span>
  );
}

function Toast({ type = "success", message }) {
  const styles =
    type === "error"
      ? "border-red-400/20 bg-red-500/10 text-red-100"
      : "border-emerald-400/20 bg-emerald-500/10 text-emerald-50";

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-bold backdrop-blur",
        styles,
      )}
    >
      {message}
    </div>
  );
}

function Field({ label, children, error, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-semibold text-white/90">{label}</label>
        {hint ? <span className="text-xs text-white/50">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-semibold text-red-300">{error}</p>
      ) : null}
    </div>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition",
        "focus:border-emerald-400/40 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10",
        className,
      )}
    />
  );
}

function Select({ className, ...props }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition",
        "focus:border-emerald-400/40 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10",
        className,
      )}
    />
  );
}

function PrimaryButton({ loading, children, className, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-slate-950 transition",
        "bg-gradient-to-r from-emerald-400 to-lime-300",
        "hover:brightness-110 active:brightness-95",
        "disabled:cursor-not-allowed disabled:opacity-70",
        "ring-1 ring-white/10 shadow-[0_12px_30px_-12px_rgba(16,185,129,0.65)]",
        className,
      )}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />
          <span>Validation...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

function GhostButton({ children, className, ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white/90 transition",
        "hover:bg-white/10 active:bg-white/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

function StepPill({ index, current, title }) {
  const active = index === current;
  const done = index < current;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-full border px-3 py-2 transition",
        active
          ? "border-emerald-400/30 bg-emerald-400/10"
          : "border-white/10 bg-white/5 hover:bg-white/10",
      )}
    >
      <div
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full text-xs font-black",
          done
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-emerald-400 text-slate-950"
              : "bg-white/10 text-white/70",
        )}
      >
        {done ? "✓" : index}
      </div>
      <div className="text-sm font-semibold text-white/90">{title}</div>
    </div>
  );
}

/** =========================
 *  App (Mini router)
 *  ========================= */
export default function App() {
  const [route, setRoute] = useState("HOME"); // HOME | LOGIN | CLIENT | ADMIN
  const [authRole, setAuthRole] = useState(null); // null | "CLIENT" | "ADMIN"
  const [session, setSession] = useState(null); // { userId, role }
  const [toast, setToast] = useState(null);

  // local DB states (MVP)
  const [users, setUsers] = useState(FAKE_USERS);
  const [cotisations, setCotisations] = useState(FAKE_COTISATIONS);

  function showToast(message, type = "success") {
    setToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  }

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem("vip_session");
    if (saved) {
      const s = JSON.parse(saved);
      setSession(s);
      setAuthRole(s.role);
      setRoute(s.role === "ADMIN" ? "ADMIN" : "CLIENT");
    }
  }, []);

  function logout() {
    localStorage.removeItem("vip_session");
    setSession(null);
    setAuthRole(null);
    setRoute("HOME");
    showToast("Déconnecté ✅");
  }

  const currentUser = useMemo(() => {
    if (!session?.userId) return null;
    return users.find((u) => u.id === session.userId) || null;
  }, [session, users]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background premium */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-40 right-[-10rem] h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-10rem] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-40" />
      </div>

      {/* Top bar */}
      <div className="relative mx-auto w-full max-w-6xl px-4 pt-8">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 font-black">
              VIP
            </div>
            <div>
              <div className="text-sm font-black">VIP Cotisation</div>
              <div className="text-xs text-white/50">
                Client + Admin • Demo MVP
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge>{route}</Badge>
            {session ? (
              <>
                <span className="hidden text-xs text-white/50 md:inline">
                  {currentUser?.fullName || "Utilisateur"} • {session.role}
                </span>
                <button
                  onClick={logout}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 hover:bg-white/10"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthRole("CLIENT");
                  setRoute("LOGIN");
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 hover:bg-white/10"
              >
                Se connecter
              </button>
            )}
          </div>
        </div>

        {toast ? (
          <div className="mt-4">
            <Toast type={toast.type} message={toast.message} />
          </div>
        ) : null}
      </div>

      {/* Pages */}
      <div className="relative mx-auto w-full max-w-6xl px-4 py-8">
        {route === "HOME" ? (
          <HomePage
            onSignup={() => {
              // inscription => aller direct onboarding client (step 1 vide)
              setSession({ userId: null, role: "CLIENT" });
              setAuthRole("CLIENT");
              setRoute("CLIENT");
            }}
            onLogin={() => {
              setAuthRole("CLIENT");
              setRoute("LOGIN");
            }}
          />
        ) : null}

        {route === "LOGIN" ? (
          <LoginPage
            defaultRole={authRole || "CLIENT"}
            onBack={() => setRoute("HOME")}
            onLogin={(role, email, password) => {
              const found = users.find(
                (u) =>
                  u.role === role &&
                  u.email === email &&
                  u.password === password,
              );
              if (!found) {
                showToast("Identifiants incorrects.", "error");
                return;
              }
              const s = { userId: found.id, role: found.role };
              setSession(s);
              setAuthRole(found.role);
              localStorage.setItem("vip_session", JSON.stringify(s));

              showToast("Connexion réussie ✅");
              setRoute(found.role === "ADMIN" ? "ADMIN" : "CLIENT");
            }}
          />
        ) : null}

        {route === "CLIENT" ? (
          <ClientOnboardingPage
            // si connecté client => pré-remplir
            initialUser={currentUser}
            banks={BANKS}
            onGoLogin={() => {
              setAuthRole("CLIENT");
              setRoute("LOGIN");
            }}
            onDone={(data) => {
              // data = { profile, cotisation }
              // 1) si userId null (inscription sans login), on crée user local
              let userId = session?.userId;

              if (!userId) {
                userId = "u_" + Math.random().toString(16).slice(2);
                const newUser = {
                  id: userId,
                  role: "CLIENT",
                  email: data.profile.email || `client_${Date.now()}@mail.com`,
                  password: "client123", // MVP
                  fullName: data.profile.fullName,
                  phone: data.profile.phone,
                  address: data.profile.address,
                };
                setUsers((p) => [newUser, ...p]);

                const s = { userId, role: "CLIENT" };
                setSession(s);
                localStorage.setItem("vip_session", JSON.stringify(s));
              } else {
                // si déjà connecté, on met à jour profil
                setUsers((prev) =>
                  prev.map((u) =>
                    u.id === userId
                      ? {
                          ...u,
                          fullName: data.profile.fullName,
                          phone: data.profile.phone,
                          email: data.profile.email,
                          address: data.profile.address,
                        }
                      : u,
                  ),
                );
              }

              // 2) ajouter cotisation
              const cot = {
                id: "c_" + Math.random().toString(16).slice(2),
                userId,
                ...data.cotisation,
                status: "CONFIRMED",
                createdAt: new Date().toISOString(),
              };

              setCotisations((p) => [cot, ...p]);
              showToast("Cotisation confirmée ✅");

              // si tu veux rediriger admin automatiquement (non)
            }}
          />
        ) : null}

        {route === "ADMIN" ? (
          <AdminDashboardPage
            banks={BANKS}
            users={users}
            cotisations={cotisations}
            onGoHome={() => setRoute("HOME")}
          />
        ) : null}
      </div>
    </div>
  );
}

/** =========================
 *  Home Page
 *  ========================= */
function HomePage({ onSignup, onLogin }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="text-3xl font-black tracking-tight">
            Une cotisation premium.
            <span className="block bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">
              Simple, rapide, VIP.
            </span>
          </div>

          <p className="mt-3 text-sm text-white/60">
            Inscription en 1 minute, puis cotisation sécurisée. Interface conçue
            pour une présentation client haut niveau.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <PrimaryButton onClick={onSignup}>Inscription</PrimaryButton>
            <GhostButton onClick={onLogin}>Connexion</GhostButton>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Onboarding</Badge>
            <Badge>Live summary</Badge>
            <Badge>Admin dashboard</Badge>
            <Badge>Ready for API</Badge>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-sm font-black text-white/90">
            Identifiants demo
          </div>
          <div className="mt-3 space-y-3 text-sm text-white/75">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white/50">Admin</div>
              <div className="mt-1 font-semibold">admin@vip.com</div>
              <div className="text-white/60">admin123</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold text-white/50">Client</div>
              <div className="mt-1 font-semibold">client@vip.com</div>
              <div className="text-white/60">client123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** =========================
 *  Login Page (Client/Admin)
 *  ========================= */
function LoginPage({ defaultRole, onLogin, onBack }) {
  const [role, setRole] = useState(defaultRole || "CLIENT");
  const [email, setEmail] = useState(
    role === "ADMIN" ? "admin@vip.com" : "client@vip.com",
  );
  const [password, setPassword] = useState(
    role === "ADMIN" ? "admin123" : "client123",
  );

  useEffect(() => {
    setEmail(role === "ADMIN" ? "admin@vip.com" : "client@vip.com");
    setPassword(role === "ADMIN" ? "admin123" : "client123");
  }, [role]);

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-black">Connexion</div>
            <div className="text-sm text-white/55">
              Choisis Client ou Admin.
            </div>
          </div>
          <button
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 hover:bg-white/10"
          >
            Retour
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Rôle">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-extrabold transition",
                  role === "CLIENT"
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-extrabold transition",
                  role === "ADMIN"
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                Admin
              </button>
            </div>
          </Field>

          <Field label="Email">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
          </Field>

          <Field label="Mot de passe">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mot de passe"
              type="password"
            />
          </Field>

          <PrimaryButton onClick={() => onLogin(role, email, password)}>
            Se connecter
          </PrimaryButton>

          <div className="text-xs text-white/45">
            * MVP demo: identifiants pré-remplis.
          </div>
        </div>
      </div>
    </div>
  );
}

/** =========================
 *  Client Onboarding (Your VIP page)
 *  - If user already logged: prefill name/phone/email/address
 *  - If not logged: user completes then we create user locally
 *  ========================= */
function ClientOnboardingPage({ initialUser, banks, onDone, onGoLogin }) {
  // Steps: 1 Profil → 2 OTP → 3 Cotisation
  const [step, setStep] = useState(1);

  const [register, setRegister] = useState({
    fullName: initialUser?.fullName || "",
    phone: initialUser?.phone || "",
    email: initialUser?.email || "",
    address: initialUser?.address || "",
  });

  // OTP state
  const [otp, setOtp] = useState({
    sent: false,
    digits: ["", "", "", "", "", ""],
    serverCode: "", // MVP only (fake)
    sending: false,
    verifying: false,
    verified: false,
    cooldown: 0,
  });

  // Cotisation state
  const [pay, setPay] = useState({
    bankId: "",
    accountNumber: "", // text input
    amount: "",
    months: "",
    accepted: false,
  });

  const [errors, setErrors] = useState({});
  const [localToast, setLocalToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedBank = useMemo(
    () => banks.find((b) => b.id === pay.bankId),
    [banks, pay.bankId],
  );

  const total = useMemo(() => {
    const a = Number(pay.amount || 0);
    const m = Number(pay.months || 0);
    return Number.isFinite(a * m) ? a * m : 0;
  }, [pay.amount, pay.months]);

  function showToast(message, type = "success") {
    setLocalToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setLocalToast(null), 2600);
  }

  // cooldown timer
  useEffect(() => {
    if (otp.cooldown <= 0) return;
    const t = setInterval(() => {
      setOtp((p) => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) }));
    }, 1000);
    return () => clearInterval(t);
  }, [otp.cooldown]);

  function validateStep1() {
    const e = {};
    if (!register.fullName.trim()) e.fullName = "Nom requis.";
    if (!register.phone.trim()) e.phone = "Téléphone requis.";
    if (register.email.trim() && !register.email.includes("@"))
      e.email = "Email invalide.";
    if (!register.address.trim()) e.address = "Adresse requise.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function getOtpCode() {
    return otp.digits.join("");
  }

  function validateOtpStep() {
    const e = {};
    const code = getOtpCode();
    if (!otp.sent) e.otp = "Clique sur “Envoyer OTP”.";
    if (!code || code.length !== 6) e.otp = "OTP invalide (6 chiffres).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3() {
    const e = {};
    if (!pay.bankId) e.bankId = "Choisis une banque.";

    if (!pay.accountNumber.trim()) e.accountNumber = "Numéro de compte requis.";
    if (pay.accountNumber.trim().length < 6)
      e.accountNumber = "Numéro de compte trop court.";

    const amountNum = Number(pay.amount);
    const monthsNum = Number(pay.months);

    if (!pay.amount || Number.isNaN(amountNum) || amountNum <= 0)
      e.amount = "Montant invalide.";
    if (!pay.months || Number.isNaN(monthsNum) || monthsNum <= 0)
      e.months = "Mois invalide.";
    if (!pay.accepted) e.accepted = "Tu dois accepter les conditions.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmitRegister(e) {
    e.preventDefault();
    if (!validateStep1()) return;
    showToast("Profil validé ✅");
    setStep(2);
  }

  async function sendOtp() {
    if (!register.phone.trim()) {
      setErrors({ phone: "Téléphone requis pour envoyer OTP." });
      return;
    }

    setOtp((p) => ({ ...p, sending: true }));
    try {
      await new Promise((r) => setTimeout(r, 650));
      const generated = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

      console.log("OTP (MVP) generated:", generated);

      setOtp((p) => ({
        ...p,
        sent: true,
        serverCode: generated,
        sending: false,
        cooldown: 30,
        verified: false,
        digits: ["", "", "", "", "", ""],
      }));

      showToast(`OTP envoyé au ${register.phone} ✅`);
      setErrors((prev) => ({ ...prev, otp: undefined }));
    } catch {
      setOtp((p) => ({ ...p, sending: false }));
      showToast("Erreur lors de l’envoi OTP.", "error");
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    if (!validateOtpStep()) return;

    setOtp((p) => ({ ...p, verifying: true }));
    try {
      await new Promise((r) => setTimeout(r, 550));

      const code = getOtpCode();
      if (code !== otp.serverCode) {
        setOtp((p) => ({ ...p, verifying: false }));
        showToast("OTP incorrect ❌", "error");
        return;
      }

      setOtp((p) => ({ ...p, verifying: false, verified: true }));
      showToast("OTP vérifié ✅");
      setStep(3);
    } catch {
      setOtp((p) => ({ ...p, verifying: false }));
      showToast("Erreur vérification OTP.", "error");
    }
  }

  async function onConfirm(e) {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));

      onDone({
        profile: register,
        cotisation: {
          bankId: pay.bankId,
          accountNumber: pay.accountNumber.trim(),
          amount: Number(pay.amount),
          months: Number(pay.months),
          total,
        },
        otpVerified: otp.verified,
      });

      showToast("Cotisation confirmée ✅");
    } catch {
      showToast("Erreur lors de la confirmation.", "error");
    } finally {
      setLoading(false);
    }
  }

  /** =========================
   *  OTP Component (Bank style)
   *  ========================= */
  function OtpInput() {
    const inputs = React.useRef([]);

    function focusIndex(i) {
      const el = inputs.current[i];
      if (el) el.focus();
    }

    function setDigit(index, value) {
      setOtp((p) => {
        const next = [...p.digits];
        next[index] = value;
        return { ...p, digits: next };
      });
    }

    function onChange(i, e) {
      const v = e.target.value.replace(/\D/g, "");
      if (!v) {
        setDigit(i, "");
        return;
      }
      // If user types multiple digits quickly, keep last one
      const digit = v.slice(-1);
      setDigit(i, digit);
      if (i < 5) focusIndex(i + 1);
    }

    function onKeyDown(i, e) {
      if (e.key === "Backspace") {
        if (otp.digits[i]) {
          // clear current
          setDigit(i, "");
        } else if (i > 0) {
          // go back
          focusIndex(i - 1);
          setDigit(i - 1, "");
        }
      }
      if (e.key === "ArrowLeft" && i > 0) focusIndex(i - 1);
      if (e.key === "ArrowRight" && i < 5) focusIndex(i + 1);
    }

    function onPaste(e) {
      const text = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (!text) return;
      e.preventDefault();

      const arr = text.split("");
      setOtp((p) => {
        const next = ["", "", "", "", "", ""];
        for (let i = 0; i < 6; i++) next[i] = arr[i] || "";
        return { ...p, digits: next };
      });

      // focus last filled
      const last = Math.min(text.length, 6) - 1;
      if (last >= 0) setTimeout(() => focusIndex(last), 0);
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold text-white/90">Code OTP</div>
          <div className="text-xs text-white/50">
            6 chiffres • auto-focus • paste
          </div>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-2xl border p-3",
            errors.otp
              ? "border-red-400/20 bg-red-500/5"
              : "border-white/10 bg-white/5",
          )}
          onPaste={onPaste}
        >
          {otp.digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              onChange={(e) => onChange(i, e)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className={cn(
                "h-12 w-12 rounded-xl border text-center text-lg font-black outline-none transition",
                "border-white/10 bg-white/5 text-white",
                "focus:border-emerald-400/40 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10",
              )}
            />
          ))}
        </div>

        {errors.otp ? (
          <p className="text-xs font-semibold text-red-300">{errors.otp}</p>
        ) : null}

        <div className="text-xs text-white/45">
          * MVP : OTP généré en console. En production, on envoie via SMS API
          (Twilio/MTN/…).
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        {localToast ? (
          <Toast type={localToast.type} message={localToast.message} />
        ) : null}

        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xl font-black">Onboarding Client</div>
              <div className="text-sm text-white/55">
                Profil → OTP → Cotisation
              </div>
            </div>

            {!initialUser ? (
              <button
                onClick={onGoLogin}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 hover:bg-white/10"
              >
                Déjà un compte ? Connexion
              </button>
            ) : (
              <Badge>Pré-rempli</Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <StepPill index={1} current={step} title="Profil" />
            <StepPill index={2} current={step} title="OTP" />
            <StepPill index={3} current={step} title="Cotisation" />
          </div>

          <div className="mt-5">
            {/* STEP 1 */}
            {step === 1 ? (
              <form onSubmit={onSubmitRegister} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Nom complet"
                    error={errors.fullName}
                    hint="Obligatoire"
                  >
                    <Input
                      value={register.fullName}
                      onChange={(e) =>
                        setRegister((p) => ({ ...p, fullName: e.target.value }))
                      }
                      placeholder="Ex: Abdourahman Youssouf"
                    />
                  </Field>

                  <Field
                    label="Téléphone"
                    error={errors.phone}
                    hint="Ex: 77xxxxxx"
                  >
                    <Input
                      value={register.phone}
                      onChange={(e) =>
                        setRegister((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="Ex: 77 12 34 56"
                      inputMode="tel"
                    />
                  </Field>
                </div>

                <Field label="Email (optionnel)" error={errors.email}>
                  <Input
                    value={register.email}
                    onChange={(e) =>
                      setRegister((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Ex: abdou@mail.com"
                    inputMode="email"
                  />
                </Field>

                <Field
                  label="Adresse"
                  error={errors.address}
                  hint="Quartier, ville..."
                >
                  <Input
                    value={register.address}
                    onChange={(e) =>
                      setRegister((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="Ex: Djibouti, Balbala..."
                  />
                </Field>

                <PrimaryButton type="submit">Continuer (OTP)</PrimaryButton>
              </form>
            ) : null}

            {/* STEP 2 OTP */}
            {step === 2 ? (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-black text-white/90">
                    Vérification OTP
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    Un code sera envoyé sur :{" "}
                    <span className="font-bold text-white/80">
                      {register.phone || "—"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <PrimaryButton
                    type="button"
                    onClick={sendOtp}
                    loading={otp.sending}
                    disabled={otp.cooldown > 0}
                  >
                    {otp.cooldown > 0
                      ? `Renvoyer (${otp.cooldown}s)`
                      : "Envoyer OTP"}
                  </PrimaryButton>

                  <GhostButton type="button" onClick={() => setStep(1)}>
                    Changer de numéro
                  </GhostButton>
                </div>

                <OtpInput />

                <PrimaryButton type="submit" loading={otp.verifying}>
                  Vérifier OTP
                </PrimaryButton>
              </form>
            ) : null}

            {/* STEP 3 */}
            {step === 3 ? (
              <form onSubmit={onConfirm} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Sélectionnez une banque" error={errors.bankId}>
                    <div className="relative">
                      <Select
                        value={pay.bankId}
                        onChange={(e) =>
                          setPay((p) => ({ ...p, bankId: e.target.value }))
                        }
                      >
                        <option value="" className="bg-slate-900">
                          -- Choisir --
                        </option>
                        {banks.map((b) => (
                          <option
                            key={b.id}
                            value={b.id}
                            className="bg-slate-900"
                          >
                            {b.name}
                          </option>
                        ))}
                      </Select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/50">
                        ▾
                      </div>
                    </div>
                  </Field>

                  <Field
                    label="Numéro de compte"
                    error={errors.accountNumber}
                    hint="Saisissez votre compte"
                  >
                    <Input
                      value={pay.accountNumber}
                      onChange={(e) =>
                        setPay((p) => ({ ...p, accountNumber: e.target.value }))
                      }
                      placeholder="Ex: 100200300"
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Montant à cotiser"
                    error={errors.amount}
                    hint="DJF"
                  >
                    <Input
                      value={pay.amount}
                      onChange={(e) =>
                        setPay((p) => ({ ...p, amount: e.target.value }))
                      }
                      placeholder="Ex: 6000"
                      inputMode="numeric"
                    />
                  </Field>

                  <Field label="Nombre de mois" error={errors.months}>
                    <Input
                      value={pay.months}
                      onChange={(e) =>
                        setPay((p) => ({ ...p, months: e.target.value }))
                      }
                      placeholder="Ex: 6"
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="flex gap-3">
                    <input
                      type="checkbox"
                      checked={pay.accepted}
                      onChange={(e) =>
                        setPay((p) => ({ ...p, accepted: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/20"
                    />
                    <div>
                      <div className="text-sm font-extrabold text-white/90">
                        J’accepte les conditions d’utilisation
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        Ex : après confirmation, la cotisation suit les règles
                        du service.
                      </div>
                      {errors.accepted ? (
                        <div className="mt-2 text-xs font-semibold text-red-300">
                          {errors.accepted}
                        </div>
                      ) : null}
                    </div>
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <PrimaryButton type="submit" loading={loading}>
                    Confirmer
                  </PrimaryButton>
                  <GhostButton type="button" onClick={() => setStep(2)}>
                    Retour OTP
                  </GhostButton>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-5">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-white/90">Résumé</div>
              <span className="text-xs text-white/45">Live</span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-bold text-white/50">Profil</div>
                <div className="mt-2 space-y-1 text-white/85">
                  <div>
                    <span className="text-white/50">Nom:</span>{" "}
                    <span className="font-semibold">
                      {register.fullName || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Téléphone:</span>{" "}
                    <span className="font-semibold">
                      {register.phone || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Email:</span>{" "}
                    <span className="font-semibold">
                      {register.email || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Adresse:</span>{" "}
                    <span className="font-semibold">
                      {register.address || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white/50">OTP</div>
                  <span className="text-[10px] font-extrabold text-white/35">
                    DEMO
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      otp.verified
                        ? "bg-emerald-400"
                        : otp.sent
                          ? "bg-cyan-300"
                          : "bg-yellow-300",
                    )}
                  />
                  <span className="text-sm font-semibold text-white/80">
                    {otp.verified
                      ? "Vérifié ✅"
                      : otp.sent
                        ? "Envoyé (en attente)"
                        : "Non envoyé"}
                  </span>
                </div>

                {/* ✅ Affichage OTP dans résumé live + bouton copier */}
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] font-bold text-white/45">
                    Code OTP (exemple)
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="text-lg font-black tracking-widest text-white/90">
                      {otp.sent ? otp.serverCode : "— — — — — —"}
                    </div>

                    <button
                      type="button"
                      disabled={!otp.sent}
                      onClick={async () => {
                        try {
                          if (!otp.sent) return;
                          await navigator.clipboard.writeText(otp.serverCode);
                          showToast("OTP copié ✅ (demo)", "success");
                        } catch {
                          showToast(
                            "Impossible de copier (navigateur).",
                            "error",
                          );
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition",
                        otp.sent
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
                          : "border-white/10 bg-white/5 text-white/40 cursor-not-allowed",
                      )}
                    >
                      <span className="leading-none">📋</span>
                      <span>Copier (demo)</span>
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                    <span>
                      * En production : le code ne sera jamais affiché ici.
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-extrabold text-white/45">
                      demo only
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-bold text-white/50">
                  Cotisation
                </div>
                <div className="mt-2 space-y-1 text-white/85">
                  <div>
                    <span className="text-white/50">Banque:</span>{" "}
                    <span className="font-semibold">
                      {selectedBank?.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Compte:</span>{" "}
                    <span className="font-semibold">
                      {pay.accountNumber || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Montant:</span>{" "}
                    <span className="font-semibold">
                      {pay.amount || "0"} DJF
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Mois:</span>{" "}
                    <span className="font-semibold">{pay.months || "0"}</span>
                  </div>

                  <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                    <div className="text-xs font-bold text-emerald-100/80">
                      Total estimé
                    </div>
                    <div className="mt-1 text-lg font-black text-emerald-50">
                      {total} DJF
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-bold text-white/50">Statut</div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      step === 1
                        ? "bg-yellow-300"
                        : step === 2
                          ? "bg-cyan-300"
                          : "bg-emerald-400",
                    )}
                  />
                  <span className="text-sm font-semibold text-white/80">
                    {step === 1 ? "Profil" : step === 2 ? "OTP" : "Cotisation"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-xs text-white/50 backdrop-blur-xl">
            OTP VIP : 6 cases + auto focus + collage + backspace intelligent.
          </div>
        </div>
      </div>
    </div>
  );
}

/** =========================
 *  Admin Dashboard
 *  ========================= */
function AdminDashboardPage({ users, cotisations, banks }) {
  const clients = users.filter((u) => u.role === "CLIENT");

  const enriched = useMemo(() => {
    return cotisations.map((c) => {
      const user = users.find((u) => u.id === c.userId);
      const bank = banks.find((b) => b.id === c.bankId);
      return {
        ...c,
        userName: user?.fullName || "—",
        userPhone: user?.phone || "—",
        userEmail: user?.email || "—",
        bankName: bank?.name || c.bankId,
      };
    });
  }, [cotisations, users, banks]);

  const totalConfirmed = enriched
    .filter((c) => c.status === "CONFIRMED")
    .reduce((sum, c) => sum + (c.total || 0), 0);

  const countConfirmed = enriched.filter(
    (c) => c.status === "CONFIRMED",
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-black">Dashboard Admin</div>
            <div className="text-sm text-white/55">
              Clients, cotisations, statuts.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{clients.length} clients</Badge>
            <Badge>{countConfirmed} cotisations</Badge>
            <Badge>Total {totalConfirmed} DJF</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kpi title="Clients" value={clients.length} />
        <Kpi title="Cotisations confirmées" value={countConfirmed} />
        <Kpi title="Montant total (DJF)" value={totalConfirmed} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-black text-white/90">
            Liste des cotisations
          </div>
          <span className="text-xs text-white/45">Dernières en haut</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-white/60">
              <tr>
                <th className="py-3 pr-4">Client</th>
                <th className="py-3 pr-4">Téléphone</th>
                <th className="py-3 pr-4">Banque</th>
                <th className="py-3 pr-4">Compte</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {enriched.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="py-3 pr-4 font-semibold text-white/85">
                    {c.userName}
                  </td>
                  <td className="py-3 pr-4 text-white/70">{c.userPhone}</td>
                  <td className="py-3 pr-4 text-white/70">{c.bankName}</td>
                  <td className="py-3 pr-4 text-white/70">{c.accountNumber}</td>
                  <td className="py-3 pr-4 font-extrabold text-white/85">
                    {c.total} DJF
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-black",
                        c.status === "CONFIRMED"
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                          : "border-yellow-300/20 bg-yellow-500/10 text-yellow-100",
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {enriched.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-white/50">
                    Aucune cotisation pour le moment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-white/45">
          * MVP: données locales. Branche Prisma/API ensuite.
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="text-xs font-bold text-white/50">{title}</div>
      <div className="mt-2 text-3xl font-black text-white/90">{value}</div>
      <div className="mt-1 text-xs text-white/45">Live demo</div>
    </div>
  );
}
