export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}
