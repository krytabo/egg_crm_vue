import { createRouter, createWebHistory } from 'vue-router'
import { AuthProfileGet, AuthRefreshTokenPost } from '@/assets/API/Auth'
import { getToken, getRefreshToken, isTokenExpired, logout, setToken, getUserInfo, setUserInfo } from '@/utils/auth'
import AuthRoutes from './modules/auth'
import ApplicationListRouter from './modules/application-list'
import AdditionalFeatureRoutes from './modules/additional'

const unwrapResponseData = (payload) => payload?.data?.data ?? payload?.data ?? payload
const normalizeAuthPayload = (payload) => {
  if (!payload) return {}
  return {
    accessToken: payload.accessToken || payload.token || null,
    refreshToken: payload.refreshToken || null,
    expiresIn: payload.expiresIn
  }
}

let refreshPromise = null
const ensureFreshAccessToken = async () => {
  const currentToken = getToken()
  if (!currentToken) throw new Error('Missing access token')
  if (!isTokenExpired(currentToken)) return currentToken

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) throw new Error('Missing refresh token')
      const response = await AuthRefreshTokenPost({ refreshToken })
      const payload = unwrapResponseData(response)
      const normalized = normalizeAuthPayload(payload)
      if (!normalized.accessToken) throw new Error('Unable to refresh token')
      setToken(normalized)
      if (payload?.user) {
        setUserInfo(payload.user)
      }
      return normalized.accessToken
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

let profilePromise = null
const ensureUserProfile = async () => {
  if (getUserInfo()) return getUserInfo()
  if (!profilePromise) {
    profilePromise = AuthProfileGet()
      .then((response) => {
        const profile = unwrapResponseData(response)
        if (profile) setUserInfo(profile)
        return profile
      })
      .finally(() => {
        profilePromise = null
      })
  }
  return profilePromise
}

const rootRedirect = () => {
  if (typeof window === 'undefined') return '/auth/login'
  return getToken() ? '/ApplicationList' : '/auth/login'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: rootRedirect
    },
    AuthRoutes,
    ApplicationListRouter,
    ...AdditionalFeatureRoutes,
    {
      path: '/:pathMatch(.*)*',
      meta: {
        requiresAuth: true,
        language: 'Auth'
      },
      component: () => import('@/components/auth/ErrorView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const hasToken = Boolean(getToken())

  if (requiresAuth && !hasToken) {
    return next({ name: 'auth-login', query: { redirect: to.fullPath }, replace: true })
  }

  if (to.name === 'auth-login' && hasToken) {
    return next({ name: 'dashboard', replace: true })
  }

  if (hasToken) {
    try {
      await ensureFreshAccessToken()
      await ensureUserProfile()
    } catch (error) {
      console.error('[router] authentication failed', error)
      logout()
      return next({ name: 'auth-login', replace: true })
    }
  }

  return next()
})

export default router
