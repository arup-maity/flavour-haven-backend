import { Router } from "express";
import { adminAuthentication, validate } from "@/middleware";
import { dishesUpload } from "@/config/fileUpload";
import * as AdminDishService from "./dish.service";
import { createDishSchema, updateDishSchema, getDishByIdSchema, deleteDishSchema, getAllDishesSchema, uploadThumbnailSchema } from "./dto/dish.dto";

const adminDishesRoutingV2 = Router();
adminDishesRoutingV2.use(adminAuthentication());

adminDishesRoutingV2.post("/create-dish", validate(createDishSchema), AdminDishService.createDish);
adminDishesRoutingV2.put("/update-dish/:id", validate(updateDishSchema), AdminDishService.updateDish);
adminDishesRoutingV2.get("/read-dish/:id", validate(getDishByIdSchema), AdminDishService.getDishById);
adminDishesRoutingV2.delete("/delete-dish/:id", validate(deleteDishSchema), AdminDishService.deleteDish);
adminDishesRoutingV2.get("/all-dishes", validate(getAllDishesSchema), AdminDishService.getAllDishes);
adminDishesRoutingV2.post(
   "/thumbnail-upload",
   adminAuthentication(),
   dishesUpload.single("image"),
   validate(uploadThumbnailSchema),
   AdminDishService.uploadThumbnail,
);

export default adminDishesRoutingV2;
