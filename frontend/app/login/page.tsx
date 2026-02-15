'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader, Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState({ email: false, password: false })
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid email or password',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        })
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-sky-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-card/90 border-2 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
            <CardHeader className="space-y-3 pb-6">
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-300 via-sky-300 to-orange-300 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-base">
                Sign in to access your dashboard and reports
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <motion.div
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, email: true })}
                      onBlur={() => setIsFocused({ ...isFocused, email: false })}
                      required
                      disabled={isLoading}
                      className={`pl-4 pr-11 h-12 transition-all duration-300 border-2 ${
                        isFocused.email
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                          : 'border-border hover:border-emerald-500/50'
                      }`}
                    />
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      animate={{ scale: isFocused.email ? 1.2 : 1 }}
                    >
                      <Mail className={`w-5 h-5 transition-colors ${
                        isFocused.email ? 'text-emerald-500' : 'text-muted-foreground'
                      }`} />
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, password: true })}
                      onBlur={() => setIsFocused({ ...isFocused, password: false })}
                      required
                      disabled={isLoading}
                      className={`pl-4 pr-11 h-12 transition-all duration-300 border-2 ${
                        isFocused.password
                          ? 'border-sky-500 shadow-lg shadow-sky-500/20'
                          : 'border-border hover:border-sky-500/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-sky-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-sky-500" />
                      )}
                    </button>
                  </div>
                </motion.div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-5 pt-6">
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                        Signing you in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">New here?</span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center"
                >
                  <Link href="/signup">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 group"
                      disabled={isLoading}
                    >
                      Create an Account
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
    </>
  )
}
