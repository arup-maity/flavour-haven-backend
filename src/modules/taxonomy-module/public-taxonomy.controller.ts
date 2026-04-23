import { Router } from "express";
import { validate } from "@/middleware";
import * as TaxonomyService from "./taxonomy.service";
import { tabMenuSchema, categoryWithDishesSchema } from "./dto/taxonomy.dto";

const publicTaxonomyRouting = Router();

publicTaxonomyRouting.get("/tab-menu", validate(tabMenuSchema), TaxonomyService.getTabMenu);
publicTaxonomyRouting.get("/category-with-dishes/:slug", validate(categoryWithDishesSchema), TaxonomyService.getCategoryWithDishes);

export default publicTaxonomyRouting;
