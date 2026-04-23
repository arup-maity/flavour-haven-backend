import { Router } from "express";
import { adminAuthentication, validate } from "@/middleware";
import { taxonomyUpload } from "@/config/fileUpload";
import * as TaxonomyService from "./taxonomy.service";
import { createTaxonomySchema, updateTaxonomySchema, getTaxonomyIdSchema, taxonomyListQuerySchema, uploadThumbnailSchema } from "./dto/taxonomy.dto";

const adminTaxonomyRouting = Router();
adminTaxonomyRouting.use(adminAuthentication());

adminTaxonomyRouting.post("/create-taxonomy", validate(createTaxonomySchema), TaxonomyService.createTaxonomy);
adminTaxonomyRouting.put("/update-taxonomy/:id", validate(updateTaxonomySchema), TaxonomyService.updateTaxonomy);
adminTaxonomyRouting.get("/read-taxonomy/:id", validate(getTaxonomyIdSchema), TaxonomyService.getTaxonomyById);
adminTaxonomyRouting.delete("/delete-taxonomy/:id", validate(getTaxonomyIdSchema), TaxonomyService.deleteTaxonomy);
adminTaxonomyRouting.get("/all-taxonomies", validate(taxonomyListQuerySchema), TaxonomyService.getAllTaxonomies);
adminTaxonomyRouting.get("/dishes-category", TaxonomyService.getDishesCategory);
adminTaxonomyRouting.post("/thumbnail-upload", taxonomyUpload.single("image"), validate(uploadThumbnailSchema), TaxonomyService.uploadThumbnail);

export default adminTaxonomyRouting;
