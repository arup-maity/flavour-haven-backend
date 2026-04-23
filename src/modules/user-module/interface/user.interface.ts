export interface CreateUserBody {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   role: string;
}

export interface UpdateUserBody {
   firstName?: string;
   lastName?: string;
   email?: string;
   role?: string;
}

export interface UserListQuery {
   page?: string;
   limit?: string;
   search?: string;
   role?: string;
   column?: string;
   sortOrder?: "asc" | "desc";
}

export interface AddAddressBody {
   userId: number;
   addressLine1: string;
   addressLine2?: string;
   city: string;
   state: string;
   postalCode: string;
   country: string;
   isDefault?: boolean;
}

export interface UpdateAddressBody extends Partial<AddAddressBody> {}

export interface OrderListQuery {
   page?: string;
   limit?: string;
   search?: string;
   column?: string;
   sortOrder?: "asc" | "desc";
}

export interface UserResponse {
   success: boolean;
   message: string;
   user?: any;
   users?: any[];
   data?: any;
   pagination?: {
      page: number;
      limit: number;
      total: number;
   };
   error?: any;
}
