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
    <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[11px] font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-black text-emerald-600">{value}</div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <div className="text-sm font-black text-slate-800">{title}</div>
      </div>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

// function PreviewClient() {
//   return (
//     <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-lg">
//       <div className="flex items-center justify-between">
//         <div className="text-sm font-black text-slate-800">Dashboard Client</div>
//         <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
//           Profil • OTP • Cotisation
//         </span>
//       </div>

//       <div className="mt-4 grid gap-3">
//         <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
//           <div className="text-xs font-bold text-slate-600">Statut</div>
//           <div className="mt-2 flex items-center gap-2">
//             <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
//             <div className="text-sm font-semibold text-slate-800">
//               En attente de consentement
//             </div>
//           </div>
//         </div>

//         <div className="grid gap-3 md:grid-cols-2">
//           <StatPill label="Méthode" value="Wallet (Djibouti)" />
//           <StatPill label="Fréquence" value="Mensuelle" />
//         </div>

//         <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
//           <div className="text-xs font-bold text-emerald-700">
//             Montant à cotiser
//           </div>
//           <div className="mt-1 text-xl font-black text-emerald-600">
//             6,000 DJF
//           </div>
//           <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
//             <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
//           </div>
//           <div className="mt-2 text-xs text-emerald-600">
//             Progression du processus • Exemple
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PreviewAdmin() {
//   return (
//     <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-lg">
//       <div className="flex items-center justify-between">
//         <div className="text-sm font-black text-slate-800">Dashboard Admin</div>
//         <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
//           Stats • Actions • Audit
//         </span>
//       </div>

//       <div className="mt-4 grid gap-3">
//         <div className="grid gap-3 md:grid-cols-3">
//           <StatPill label="Total clients" value="124" />
//           <StatPill label="Actifs" value="86" />
//           <StatPill label="Cotisations" value="97" />
//         </div>

//         <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
//           <div className="text-xs font-bold text-slate-600">Dernières actions</div>
//           <div className="mt-3 space-y-2 text-sm text-slate-700">
//             <div className="flex items-center justify-between">
//               <span>✅ Consentement forcé</span>
//               <span className="text-xs text-slate-500">il y a 2 min</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span>🟡 User status → ACTIVE</span>
//               <span className="text-xs text-slate-500">il y a 12 min</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span>🔒 Reset OTP security</span>
//               <span className="text-xs text-slate-500">il y a 41 min</span>
//             </div>
//           </div>
//         </div>

//         <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
//           <div className="flex items-center justify-between">
//             <div className="text-xs font-bold text-slate-600">Audit (aperçu)</div>
//             <span className="text-[11px] font-bold text-slate-500">
//               Traçabilité
//             </span>
//           </div>
//           <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
//             <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
//           </div>
//           <div className="mt-2 text-xs text-slate-600">
//             Exemples de logs • IP • user-agent • actions
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-0px)] bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Background premium */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute top-40 right-[-10rem] h-80 w-80 rounded-full bg-emerald-400/5 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-10rem] h-96 w-96 rounded-full bg-emerald-300/8 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.04)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Brand />
          <div className="hidden text-xs text-slate-500 md:block">
            Xeer Ciise • Cotisations • Sécurisé
          </div>
        </div>

        {/* HERO */}
        <Card className="mt-6 overflow-hidden border border-emerald-100 bg-white p-0 shadow-xl">
          <div className="relative grid gap-8 p-7 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Plateforme premium • Flow client + admin
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Cotisations <span className="text-emerald-600">Xeer Ciise</span>,
                avec une expérience{" "}
                <span className="text-slate-800">VIP</span>.
              </h1>

              <p className="text-sm leading-relaxed text-slate-600">
                Inscription sécurisée (docs), OTP par email, cotisation (Wallet
                Djibouti ou Virement), consentement, et suivi complet côté Admin
                (stats + audit + actions).
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
                >
                  Créer un compte
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-extrabold text-emerald-700 transition-all hover:bg-emerald-50"
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
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-emerald-500/10 to-emerald-300/5 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white p-3 shadow-xl">
                  <img
                    src="/images/xeer_ciise.jpg"
                    alt="Xeer Ciise"
                    className="h-64 w-full rounded-[1.6rem] object-cover md:h-72"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <div className="text-xs font-extrabold text-emerald-700">
                      Communauté • Confiance • Transparence
                    </div>
                    <div className="text-xs text-slate-500">
                      Aperçu visuel • Demo
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom strip */}
          {/* <div className="border-t border-emerald-100 bg-emerald-50/50 px-7 py-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Feature
                title="Inscription & documents"
                desc="Upload sécurisé (pièce d'identité + selfie). Statut PENDING → ACTIVE après OTP."
              />
              <Feature
                title="OTP email (réel)"
                desc="Code à 6 chiffres, TTL, limites d'envoi, tentatives, lock, audit des actions."
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

        <div className="mt-8 text-center text-xs text-slate-400">
          © Cotisations Xeer Ciise • UI/UX VIP • React + Tailwind
        </div>
      </div>
    </div>
  );
}