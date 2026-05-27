export interface User {
  id: number;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  // refreshToken is handled via httpOnly cookie by the backend
}
