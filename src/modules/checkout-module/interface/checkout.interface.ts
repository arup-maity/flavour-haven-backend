export interface CheckoutItem {
   dishId: number;
   quantity: number;
   price: number;
}

export interface CreateCheckoutBody {
   items: CheckoutItem[];
}

export interface CreatePaymentBody {
   checkoutId: string;
   amount: number;
}

export interface CheckoutResponse {
   success: boolean;
   message?: string;
   checkoutId?: string;
   secret?: any;
   checkout?: any;
   error?: any;
}
