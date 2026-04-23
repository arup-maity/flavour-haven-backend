export interface CreateAdminUserBody {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
}

export interface DemoResponse {
   success: boolean;
   message: string;
   user?: any;
   dishes?: any[];
   error?: any;
}
