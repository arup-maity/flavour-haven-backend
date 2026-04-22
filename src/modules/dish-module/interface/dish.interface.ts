export interface CreateDishBody {
   title: string;
   slug: string;
   description?: string;
   shortDescription: string;
   price: number;
   costPrice?: number;
   thumbnail?: string;
   nonVeg?: boolean;
   category: number[];
}

export interface UpdateDishBody extends Partial<CreateDishBody> {
   oldThumbnail?: string;
}

export interface DishResponse {
   success: boolean;
   message: string;
   dish?: any;
   dishes?: any[];
   total?: number;
   error?: any;
}

export interface GetAllDishesQuery {
   page?: string;
   limit?: string;
   search?: string;
   column?: string;
   sortOrder?: "asc" | "desc";
}
