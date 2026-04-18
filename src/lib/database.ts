const localDatabaseUrl = 'file:./blog-nerd.db'

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || localDatabaseUrl
}

export function getDatabaseAuthToken() {
  return process.env.TURSO_AUTH_TOKEN || undefined
}

export function getDatabaseClientConfig() {
  const url = getDatabaseUrl()
  const authToken = getDatabaseAuthToken()

  return {
    authToken,
    url,
  }
}
