import { defineStore } from 'pinia'
import type { FetchError } from 'ofetch'
import type { Result } from '~/types/result'

export const useAuthStore = defineStore('auth', () => {
  const isLoggingIn: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const isLoggedIn = ref(false)

  const verify = async (): Promise<Result<boolean>> => {
    try {
      const verify = await $fetch<Result<boolean>>('/api/auth/verify')
      if (verify.success) isLoggedIn.value = verify.data
      return verify
    } catch (err) {
      console.log(err)
      error.value = (err as FetchError).data.message
      return {
        success: false,
        message: error.value ?? ''
      }
    }
  }

  const login = async (secretKey: string | null) => {
    if (!secretKey) {
      error.value = 'Secret key is required'
      return
    }
    isLoggingIn.value = true
    error.value = null // Clear previous errors

    try {
      await $fetch.raw(`/api/auth/login`, {
        method: 'POST',
        body: { key: secretKey }
      })

      isLoggedIn.value = true

      window.location.href = '/'
    } catch (err) {
      error.value = (err as FetchError).data?.message ?? 'Login failed'
      localStorage.setItem('isLoggedIn', 'false')
    } finally {
      isLoggingIn.value = false
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout')
    isLoggedIn.value = false
    navigateTo('/login')
  }

  const checkAuth = async () => {
    try {
      if (isLoggedIn.value) return true

      const verified = await verify()

      if (verified.success) {
        return verified.data
      }
    } catch {
      return false
    }
  }

  watch(isLoggedIn, (newVal) => {
    localStorage.setItem('isLoggedIn', newVal.toString())
  })

  return {
    isLoggingIn,
    error,
    login,
    logout,
    checkAuth
  }
})
