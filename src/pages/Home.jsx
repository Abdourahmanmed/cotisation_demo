import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Brand from "../components/Brand";
import Card from "../components/ui/Card";

const cn = (...c) => c.filter(Boolean).join(" ");

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const floaty = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] font-bold text-white/50">{label}</div>
      <div className="mt-1 text-sm font-black text-white/90">{value}</div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="text-sm font-black text-white/90">{title}</div>
      </div>
      <p className="mt-2 text-sm text-white/60">{desc}</p>
    </div>
  );
}

// function PreviewClient() {
//   return (
//     <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
//       <div className="flex items-center justify-between">
//         <div className="text-sm font-black text-white/85">Dashboard Client</div>
//         <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/60">
//           Profil • OTP • Cotisation
//         </span>
//       </div>

//       <div className="mt-4 grid gap-3">
//         <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//           <div className="text-xs font-bold text-white/55">Statut</div>
//           <div className="mt-2 flex items-center gap-2">
//             <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
//             <div className="text-sm font-semibold text-white/85">
//               En attente de consentement
//             </div>
//           </div>
//         </div>

//         <div className="grid gap-3 md:grid-cols-2">
//           <StatPill label="Méthode" value="Wallet (Djibouti)" />
//           <StatPill label="Fréquence" value="Mensuelle" />
//         </div>

//         <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
//           <div className="text-xs font-bold text-emerald-100/80">
//             Montant à cotiser
//           </div>
//           <div className="mt-1 text-xl font-black text-emerald-50">
//             6,000 DJF
//           </div>
//           <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
//             <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
//           </div>
//           <div className="mt-2 text-xs text-emerald-100/70">
//             Progression du processus • Exemple
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PreviewAdmin() {
//   return (
//     <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
//       <div className="flex items-center justify-between">
//         <div className="text-sm font-black text-white/85">Dashboard Admin</div>
//         <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/60">
//           Stats • Actions • Audit
//         </span>
//       </div>

//       <div className="mt-4 grid gap-3">
//         <div className="grid gap-3 md:grid-cols-3">
//           <StatPill label="Total clients" value="124" />
//           <StatPill label="Actifs" value="86" />
//           <StatPill label="Cotisations" value="97" />
//         </div>

//         <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//           <div className="text-xs font-bold text-white/55">Dernières actions</div>
//           <div className="mt-3 space-y-2 text-sm text-white/70">
//             <div className="flex items-center justify-between">
//               <span>✅ Consentement forcé</span>
//               <span className="text-xs text-white/45">il y a 2 min</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span>🟡 User status → ACTIVE</span>
//               <span className="text-xs text-white/45">il y a 12 min</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span>🔒 Reset OTP security</span>
//               <span className="text-xs text-white/45">il y a 41 min</span>
//             </div>
//           </div>
//         </div>

//         <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//           <div className="flex items-center justify-between">
//             <div className="text-xs font-bold text-white/55">Audit (aperçu)</div>
//             <span className="text-[11px] font-bold text-white/45">
//               Traçabilité
//             </span>
//           </div>
//           <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
//             <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-300 to-emerald-400" />
//           </div>
//           <div className="mt-2 text-xs text-white/50">
//             Exemples de logs • IP • user-agent • actions
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-0px)] text-white">
      {/* Background premium */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-40 right-[-10rem] h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-10rem] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-40" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Brand />
          <div className="hidden text-xs text-white/50 md:block">
            Xeer Ciise • Cotisations • Sécurisé
          </div>
        </div>

        {/* HERO */}
        <Card className="mt-6 overflow-hidden p-0">
          <div className="relative grid gap-8 p-7 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Plateforme premium • Flow client + admin
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Cotisations <span className="text-emerald-300">Xeer Ciise</span>,
                avec une expérience{" "}
                <span className="text-white/90">VIP</span>.
              </h1>

              <p className="text-sm leading-relaxed text-white/60">
                Inscription sécurisée (docs), OTP par email, cotisation (Wallet
                Djibouti ou Virement), consentement, et suivi complet côté Admin
                (stats + audit + actions).
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_16px_40px_-16px_rgba(16,185,129,0.7)] hover:brightness-110"
                >
                  Créer un compte
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10"
                >
                  Se connecter
                </Link>
              </div>

              {/* <div className="grid gap-3 sm:grid-cols-3">
                <StatPill label="Sécurité" value="OTP + Audit" />
                <StatPill label="Paiement" value="Wallet / Virement" />
                <StatPill label="Admin" value="Actions + Logs" />
              </div> */}
            </motion.div>

            {/* Center image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="relative"
            >
              <motion.div
                variants={floaty}
                animate="animate"
                className="relative mx-auto max-w-lg"
              >
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-emerald-400/20 to-cyan-300/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3">
                  <img
                    src="/images/xeer_ciise.jpg"
                    alt="Xeer Ciise"
                    className="h-64 w-full rounded-[1.6rem] object-cover md:h-72"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-xs font-extrabold text-white/80">
                      Communauté • Confiance • Transparence
                    </div>
                    <div className="text-xs text-white/50">
                      Aperçu visuel • Demo
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom strip */}
          {/* <div className="border-t border-white/10 bg-white/5 px-7 py-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Feature
                title="Inscription & documents"
                desc="Upload sécurisé (pièce d’identité + selfie). Statut PENDING → ACTIVE après OTP."
              />
              <Feature
                title="OTP email (réel)"
                desc="Code à 6 chiffres, TTL, limites d’envoi, tentatives, lock, audit des actions."
              />
              <Feature
                title="Admin: suivi & actions"
                desc="Stats, liste clients/cotisations, suspend, cancel, force consent, audit logs."
              />
            </div>
          </div> */}
        </Card>

        {/* PREVIEWS
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <PreviewClient />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.05 }}>
            <PreviewAdmin />
          </motion.div>
        </div> */}

        <div className="mt-8 text-center text-xs text-white/35">
          © Cotisations Xeer Ciise • UI/UX VIP • React + Tailwind
        </div>
      </div>
    </div>
  );
}
