const AuthRoutes = {
  path: '/auth',
  component: () => import('@/pages/AuthPage/AuthLayout.vue'),
  children: [
    {
      path: 'login',
      name: 'auth-login',
      component: () => import('@/pages/AuthPage/LoginPage.vue'),
      meta: { requiresAuth: false, language: 'Auth' },
    },
  ],
};

export default AuthRoutes;
