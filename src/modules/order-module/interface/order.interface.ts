export interface OrderListQuery {
   search?: string;
   column?: string;
   sortOrder?: "asc" | "desc";
   page?: string;
   limit?: string;
}

export interface UpdateOrderStatusBody {
   status: string;
}

export interface OrderResponse {
   success: boolean;
   message?: string;
   orders?: any[];
   order?: any;
   updatedOrder?: any;
   error?: any;
}
