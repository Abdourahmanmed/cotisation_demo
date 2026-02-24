import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Brand from "../components/Brand";
import Card from "../components/ui/Card";
import LanguageSwitcher from "../components/LanguageSwitcher";

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

export default function Home() {
  const { t, i18n } = useTranslation();

  // petit helper pour RTL (ar)
  const isRTL = i18n.language?.startsWith("ar");

  return (
    <div className="relative min-h-[calc(100vh-0px)] text-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background premium */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-40 right-[-10rem] h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-10rem] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-40" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Brand />
          <div className="hidden text-xs text-white/50 md:block">
            {t("demo")}
          </div>
          <LanguageSwitcher />
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
                {t("app_name")}
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {t("home_title")}
              </h1>

              <p className="text-sm leading-relaxed text-white/60">
                {t("home_desc")}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_16px_40px_-16px_rgba(16,185,129,0.7)] hover:brightness-110"
                >
                  {t("create_account")}
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10"
                >
                  {t("login")}
                </Link>
              </div>
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
                    alt={t("app_name")}
                    className="h-64 w-full rounded-[1.6rem] object-cover md:h-72"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-xs font-extrabold text-white/80">
                      {t("slog")}
                    </div>
                    <div className="text-xs text-white/50">{t("demo")}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-white/35">
          © {t("app_name")} • UI/UX VIP • React + Tailwind
        </div>
      </div>
    </div>
  );
}
