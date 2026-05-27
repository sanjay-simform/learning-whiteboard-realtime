import type { AxiosError, AxiosResponse } from "axios"

export interface AxiosErrorResponse {
  status: number
  message: string
  code?: string
  details?: unknown
}

export type AxiosApiResponse<T> =
  | {
      data: T
      error: null
    }
  | { data: null; error: AxiosErrorResponse }
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export async function handleApiRequest<T>(
  axiosPromise: Promise<AxiosResponse<ApiResponse<T>>>,
  errMessage: string = "An error occurred"
): Promise<AxiosApiResponse<T>> {
  try {
    const response = await axiosPromise
    return {
      data: response.data.data,
      error: null,
    }
  } catch (err) {
    const error = err as AxiosError
    return {
      data: null,
      error: {
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || errMessage,
        code: error.code,
        details: error.response?.data,
      },
    }
  }
}
