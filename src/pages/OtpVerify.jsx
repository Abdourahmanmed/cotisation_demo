import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import Input from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/Button";
import { verifyOtpApi } from "../api/otp.api";

export default function OtpVerify() {
  const nav = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState("");

  const m = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: () => {
      toast.success("OTP vérifié ✅ Tu peux te connecter.");
      nav("/login", { state: { email } });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "OTP invalide"),
  });

  function onSubmit(e) {
    e.preventDefault();
    if (!email) return toast.error("Email requis");
    if (!/^\d{6}$/.test(code)) return toast.error("Code doit être 6 chiffres");
    m.mutate({ email, code });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
        <div className="text-xs text-white/45">Étape 2/2</div>
      </div>

      <Card className="p-7">
        <div className="text-xl font-black">Vérification OTP</div>
        <div className="mt-1 text-sm text-white/55">
          Saisis le code reçu par email (6 chiffres).
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />

          <Input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Code OTP (6 chiffres)"
            inputMode="numeric"
          />

          <PrimaryButton type="submit" loading={m.isPending}>
            Vérifier
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
