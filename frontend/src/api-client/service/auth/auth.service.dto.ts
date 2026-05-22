export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: {
    username: string
    id: number
  }
  token: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  user: {
    username: string
    id: number
  }
  token: string
}
