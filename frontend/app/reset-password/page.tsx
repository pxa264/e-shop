'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/navigation'
import toast from 'react-hot-toast'
import { resetPassword } from '@/lib/api'
import { Lock, CheckCircle2, AlertCircle, ChevronLeft, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const code = useMemo(() => searchParams.get('code') || '', [searchParams])

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!code) {
      toast.error('Invalid reset link or missing code parameter.')
    }
  }, [code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const data = await resetPassword(code, password, passwordConfirmation)

      if (data?.jwt) {
        localStorage.setItem('jwt', data.jwt)
        toast.success('Password reset successful. You are now signed in.')
        router.push('/')
        return
      }

      toast.success('Password reset successful. Please sign in with your new password.')
      router.push('/login')
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Reset failed. Please try again later.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-premium p-8 border border-gray-100">
        <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-primary-600 font-bold mb-6 transition-colors group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to sign in
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900">Reset password</h1>
          <p className="text-gray-500 font-medium mt-2">Enter a new password to complete the reset.</p>
        </div>

        {!code ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            This link is invalid. Please start the “Forgot password” process again.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm new password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-soft"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Reset password</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
