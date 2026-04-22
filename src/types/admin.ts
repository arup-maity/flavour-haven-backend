import { UserRole } from "@prisma/client";

// Generic Types
export interface PaginatedResponse<T> {
   success: boolean;
   data?: T[] | {
      users: T[];
      pagination: {
         page: number;
         limit: number;
         total: number;
      };
   };
   filterCount?: number;
   totalCount?: number;
   message: string;
   error?: unknown;
}

export interface PaginationQuery {
   page?: string;
   limit?: string;
   search?: string;
   column?: string;
   sortOrder?: "asc" | "desc";
}

// Admin User Types
export interface UserListQuery extends PaginationQuery {
   role?: UserRole;
}

export interface CreateUserInput {
   firstName: string;
   lastName: string;
   email: string;
   password: string;
   role: UserRole;
}

export interface UpdateUserInput {
   firstName?: string;
   lastName?: string;
   email?: string;
   role?: UserRole;
}

export interface ApiResponse {
   success: boolean;
   message: string;
   error?: unknown;
}
