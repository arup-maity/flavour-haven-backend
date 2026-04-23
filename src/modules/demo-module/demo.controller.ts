import { Router } from "express";
import { validate } from "@/middleware";
import * as DemoService from "./demo.service";
import { createAdminUserSchema } from "./dto/demo.dto";

const demoRouting = Router();

demoRouting.post("/create-admin-user", validate(createAdminUserSchema), DemoService.createAdminUser);
demoRouting.post("/create-dish", DemoService.createDemoDishes);

export default demoRouting;
