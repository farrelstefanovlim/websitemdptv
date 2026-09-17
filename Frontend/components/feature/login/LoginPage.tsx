"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { useAuthStore } from "@/stores/auth.store"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Alert from "@/components/ui/Alert"
import Icon from "@/components/ui/Icon"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const success = await login(email, password)
    if (success) {
      router.push("/admin/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 noise-bg z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-pattern z-0 opacity-20 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[120px] pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary-fixed/20 blur-[100px] pulse-glow pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative z-10 w-full max-w-md mx-4">
        {/* Card */}
        <div className="glass-card-premium rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="flex flex-col items-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 drop-shadow-md">
                <Image src="/logo-mdptv.png" alt="MDPTV Logo" width={80} height={80} className="w-full h-full object-contain" priority />
              </div>
              <h1 className="text-4xl font-black text-on-primary font-display tracking-tight">MDPTV</h1>
              <p className="text-on-primary-container text-xs mt-2 tracking-widest uppercase font-bold">Admin Panel System</p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Administrator" type="email" required startIcon="mail" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@mdptv.com" className="!bg-white/10 !text-white !border-white/15 !placeholder:text-white/40 focus:!border-secondary" />

            <Input label="Kata Sandi" required isPassword startIcon="lock" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="!bg-white/10 !text-white !border-white/15 !placeholder:text-white/40 focus:!border-secondary" />

            <div className="pt-2">
              <Button type="submit" variant="secondary" size="md" fullWidth isLoading={isLoading} startIcon={<Icon name="login" size="sm" />}>
                Masuk ke Dashboard
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-on-primary-container/40 text-[11px] mt-8">© 2026 UKM MDPTV — Universitas Multi Data Palembang</p>
        </div>
      </motion.div>
    </div>
  )
}
