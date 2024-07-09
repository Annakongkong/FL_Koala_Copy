export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    scripts: '/dashboard/scripts',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    execution: '/dashboard/execution',
    newScript: '/dashboard/scripts/new-script',
    guide: '/dashboard/guide',
    editScript: (id: string) => `/dashboard/scripts/${id}/edit`,
    executeScript: (id: string) => `/dashboard/scripts/${id}/execution`,
  },
  errors: { notFound: '/errors/not-found' },
} as const;
