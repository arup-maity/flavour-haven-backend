export interface CreateTaxonomyBody {
   name: string;
   slug: string;
   description?: string;
   thumbnail?: string;
   type: string;
}

export interface UpdateTaxonomyBody extends Partial<CreateTaxonomyBody> {
   oldThumbnail?: string;
}

export interface TaxonomyListQuery {
   page?: string;
   limit?: string;
   search?: string;
   column?: string;
   sortOrder?: "asc" | "desc";
}

export interface CategoryWithDishesQuery {
   slug: string;
   limit?: string;
}

export interface TaxonomyResponse {
   success: boolean;
   message: string;
   taxonomy?: any;
   taxonomies?: any[];
   categories?: any[];
   total?: number;
   error?: any;
}
