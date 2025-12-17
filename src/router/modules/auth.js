const AuthRoutes = {
  path: '/auth',
  component: () => import('@/pages/auth/AuthLayout.vue'),
  children: [
    {
      path: 'login',
      name: 'auth-login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { requiresAuth: false, language: 'Auth' }
    }
  ]
}

export default AuthRoutes
