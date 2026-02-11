import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Brand from "../components/Brand";
import Input from "../components/ui/Input";
import { PrimaryButton, GhostButton } from "../components/ui/Button";
import { loginApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState("");

  const m = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      login(data);
      toast.success("Connexion réussie ✅");
      if (data.user.role === "ADMIN") nav("/admin");
      else nav("/client");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Erreur login"),
  });

  function onSubmit(e) {
    e.preventDefault();
    m.mutate({ email, password });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Brand />
      </div>

      <Card className="p-7">
        <div className="text-xl font-black">Connexion</div>
        <div className="mt-1 text-sm text-white/55">Accès client ou admin.</div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            type="password"
            required
          />

          <div className="grid gap-3 md:grid-cols-2">
            <PrimaryButton type="submit" loading={m.isPending}>
              Se connecter
            </PrimaryButton>
            <GhostButton type="button" onClick={() => nav("/register")}>
              Créer un compte
            </GhostButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
