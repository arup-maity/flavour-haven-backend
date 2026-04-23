import { Router } from "express";
import { userAuthentication, validate } from "@/middleware";
import * as UserService from "./user.service";
import { addAddressSchema, updateAddressSchema, getAddressIdSchema, orderListQuerySchema } from "./dto/user.dto";

const publicUserRouting = Router();
publicUserRouting.use(userAuthentication());

publicUserRouting.get("/profile-details", UserService.getProfileDetails);
publicUserRouting.get("/address-details", UserService.getAddressDetails);
publicUserRouting.post("/add-address", validate(addAddressSchema), UserService.addAddress);
publicUserRouting.put("/update-address/:id", validate(updateAddressSchema), UserService.updateAddress);
publicUserRouting.get("/order-list", validate(orderListQuerySchema), UserService.getUserOrderList);

export default publicUserRouting;
