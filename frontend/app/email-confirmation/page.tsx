'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, ArrowRight, Mail } from 'lucide-react'

export default function EmailConfirmationPage() {
  const searchParams = useSearchParams()

  const confirmed = useMemo(() => {
    const v = searchParams.get('confirmed')
    return v === '1' || v === 'true'
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full animate-fade-in">
        <div className="bg-white rounded-[3rem] shadow-premium p-10 lg:p-16 text-center border border-gray-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 mb-10">
            <div className={`w-24 h-24 ${confirmed ? 'bg-green-50' : 'bg-red-50'} rounded-full flex items-center justify-center mx-auto mb-6 relative`}>
              {confirmed ? (
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500" />
              )}
            </div>

            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
              {confirmed ? '邮箱验证成功！' : '邮箱验证失败'}
            </h1>

            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">
              {confirmed
                ? '你的账号已激活，现在可以使用邮箱和密码登录。'
                : '链接可能已过期或无效。你可以重新发送验证邮件。'}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-soft active:scale-[0.98]"
            >
              <ArrowRight className="w-5 h-5" />
              <span>去登录</span>
            </Link>

            <Link
              href="/forgot-password"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-secondary-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-soft active:scale-[0.98]"
            >
              <Mail className="w-5 h-5" />
              <span>忘记密码</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
