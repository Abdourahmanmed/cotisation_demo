import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import { PrimaryButton, GhostButton } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function InviteCommunity() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const nav = useNavigate();

  // ✅ lien unique
  const inviteLink = useMemo(() => {
    const origin = window.location.origin;
    const ref = user?.id || "";
    return `${origin}/register${ref ? `?ref=${ref}` : ""}`;
  }, [user?.id]);

  // ✅ message i18n + lien
  const message = useMemo(() => {
    return `${t("invite_message")}\n${inviteLink}`;
  }, [inviteLink, t]);

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  function shareSms() {
    const url = `sms:?&body=${encodeURIComponent(message)}`;
    window.location.href = url;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success(t("invite_copy_success"));
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error(t("invite_copy_error"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
        <div className="text-xs text-white/45">{t("invite_title")}</div>
      </div>

      <Card className="p-7">
        <div className="text-xl font-black">{t("invite_card_title")}</div>
        <div className="mt-1 text-sm text-white/55">{t("invite_desc")}</div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-black text-white/60">
            {t("invite_link_label")}
          </div>
          <div className="mt-2 break-all text-sm font-semibold text-white/85">
            {inviteLink}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <PrimaryButton type="button" onClick={shareWhatsApp}>
            {t("invite_whatsapp")}
          </PrimaryButton>

          <PrimaryButton type="button" onClick={shareSms}>
            {t("invite_sms")}
          </PrimaryButton>

          <GhostButton type="button" onClick={copyLink}>
            {copied ? t("invite_copied") : t("invite_copy")}
          </GhostButton>
        </div>

        <div className="mt-6 flex justify-center">
          <GhostButton
            type="button"
            onClick={() => nav("/client")}
            className="px-6"
          >
            {t("invite_dashboard")}
          </GhostButton>
        </div>

        <div className="mt-5 text-xs text-white/45">{t("invite_tip")}</div>
      </Card>
    </div>
  );
}
