export interface VerifyTokenResponse {
   success: boolean;
   login: boolean;
   decoded?: {
      id: number;
      name: string;
      role: string;
      accessPurpose: string;
      purpose: string;
      iat: number;
      exp: number;
   };
   message?: string;
}

export interface AdminLoginBody {
   email: string;
   password: string;
}

export interface UserRegisterBody {
   firstName: string;
   lastName: string;
   email: string;
   password: string;
}

export interface UserLoginBody {
   email: string;
   password: string;
}

export interface AuthResponse {
   success: boolean;
   message: string;
   user?: any;
   decoded?: any;
}
