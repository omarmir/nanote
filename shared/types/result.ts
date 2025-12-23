import type { H3Error } from 'h3'

export type Result<T> =
  | {
      success: false
      message: string
    }
  | {
      success: true
      data: T
    }

export type APIError = Partial<H3Error<unknown>> & {
  status?: number
  statusText?: string
}

export type ActionStatus = 'idle' | 'success' | 'error' | 'pending'
