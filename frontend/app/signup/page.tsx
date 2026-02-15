'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader, Mail, Lock, User, Sparkles, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isFocused, setIsFocused] = useState({ name: false, email: false, password: false, confirm: false })
  const router = useRouter()
  const { toast } = useToast()

  // Password strength checker
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-500' }
    if (strength <= 3) return { strength, label: 'Fair', color: 'text-orange-500' }
    if (strength <= 4) return { strength, label: 'Good', color: 'text-yellow-500' }
    return { strength, label: 'Strong', color: 'text-green-500' }
  }

  const passwordStrength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!name.trim() || name.trim().length < 2) {
      toast({
        variant: 'destructive',
        title: 'Invalid name',
        description: 'Please enter your full name (at least 2 characters)',
      })
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid email',
        description: 'Please enter a valid email address',
      })
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak password',
        description: 'Password must be at least 6 characters',
      })
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      toast({
        title: 'Success',
        description: 'Account created successfully! Please log in.',
      })

      router.push('/login')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: message,
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
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [-90, 0, -90],
          }}
          transition={{
            duration: 25,
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
          <Card className="backdrop-blur-xl bg-card/90 border-2 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
            <CardHeader className="space-y-3 pb-6">
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-center text-base">
                Join us and start generating amazing reports
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
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    Full Name
                  </Label>
                  <div className="relative group">
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, name: true })}
                      onBlur={() => setIsFocused({ ...isFocused, name: false })}
                      required
                      disabled={isLoading}
                      className={`pl-4 pr-11 h-12 transition-all duration-300 border-2 ${
                        isFocused.name
                          ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                          : 'border-border hover:border-orange-500/50'
                      }`}
                    />
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      animate={{ scale: isFocused.name ? 1.2 : 1 }}
                    >
                      <User className={`w-5 h-5 transition-colors ${
                        isFocused.name ? 'text-orange-500' : 'text-muted-foreground'
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
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
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
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mt-2"
                    >
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            passwordStrength.strength <= 2
                              ? 'bg-red-500'
                              : passwordStrength.strength <= 3
                              ? 'bg-orange-500'
                              : passwordStrength.strength <= 4
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-500" />
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, confirm: true })}
                      onBlur={() => setIsFocused({ ...isFocused, confirm: false })}
                      required
                      disabled={isLoading}
                      className={`pl-4 pr-11 h-12 transition-all duration-300 border-2 ${
                        isFocused.confirm
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'border-border hover:border-purple-500/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground hover:text-purple-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground hover:text-purple-500" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm mt-2"
                    >
                      {password === confirmPassword ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">Passwords don't match</span>
                        </>
                      )}
                    </motion.div>
                  )}
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
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        Create Account
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
                    <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center"
                >
                  <Link href="/login">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 hover:border-sky-500 hover:bg-sky-500/10 transition-all duration-300 group"
                      disabled={isLoading}
                    >
                      Sign In Instead
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
