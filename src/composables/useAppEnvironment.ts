export const useAppEnvironment = () => {
  const config = useRuntimeConfig()

  return {
    appName: config.public.appName as string,
    apiBaseUrl: config.public.apiBaseUrl as string
  }
}