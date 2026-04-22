import { Router } from "express";
import { adminAuthentication } from "@/middleware";
import { dishesUpload } from "@/config/fileUpload";
import * as AdminDishService from "./dish.service";

const adminDishesRoutingV2 = Router();
adminDishesRoutingV2.use(adminAuthentication());

adminDishesRoutingV2.post("/create-dish", AdminDishService.createDish);
adminDishesRoutingV2.put("/update-dish/:id", AdminDishService.updateDish);
adminDishesRoutingV2.get("/read-dish/:id", AdminDishService.getDishById);
adminDishesRoutingV2.delete("/delete-dish/:id", AdminDishService.deleteDish);
adminDishesRoutingV2.get("/all-dishes", AdminDishService.getAllDishes);
adminDishesRoutingV2.post("/thumbnail-upload", adminAuthentication(), dishesUpload.single("image"), AdminDishService.uploadThumbnail);

export default adminDishesRoutingV2;
