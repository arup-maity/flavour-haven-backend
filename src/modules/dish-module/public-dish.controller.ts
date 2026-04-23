import { Router } from "express";
import { validate } from "@/middleware";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { z } from "zod";

type AsyncRequestHandler = (req: any, res: any, next: any) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: any, res: any, next: any) => {
      fn(req, res, next).catch(next);
   };
};

const deliveryDishesSchema = z.object({
   query: z.object({
      search: z.string().max(255, "Search term must be less than 255 characters").optional(),
      sortColumn: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc", "gth", "lth"]).optional().default("desc"),
      veg: z.enum(["all", "veg", "non-veg"]).optional().default("all"),
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(15),
   }),
});

const allDishesSchema = z.object({
   query: z.object({
      sortOrder: z.string().optional(),
      veg: z.enum(["all", "veg", "non-veg"]).optional().default("all"),
      page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).optional().default(1),
      limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).optional().default(15),
   }),
});

const dishDetailsSchema = z.object({
   params: z.object({
      slug: z.string().min(1, "Slug is required"),
   }),
});

const dishesByCategorySchema = z.object({
   params: z.object({
      categorySlug: z.string().min(1, "Category slug is required"),
   }),
});

const publicDishesRouting = Router();

const getDeliveryDishes = asyncHandler(async (req: any, res: any): Promise<void> => {
   const { search = "", sortColumn = "createdAt", sortOrder = "desc", veg = "all", page = 1, limit = 15 } = req.query;

   const conditions: any = {};
   if (search) {
      conditions.title = {
         contains: search,
         mode: "insensitive",
      };
   }
   if (veg !== "all") {
      conditions.nonVeg = veg !== "veg";
   }

   const query: any = {};
   if (sortOrder === "gth") {
      query.orderBy = { price: "desc" };
   } else if (sortOrder === "lth") {
      query.orderBy = { price: "asc" };
   } else {
      query.orderBy = { [sortColumn]: sortOrder };
   }

   const [err, dishes] = await catchAsync(
      prisma.dishes.findMany({
         where: conditions,
         include: {
            categories: {
               include: {
                  taxonomy: true,
               },
            },
         },
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      }),
   );

   if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
   }

   const [countErr, count] = await catchAsync(prisma.dishes.count({ where: conditions }));

   if (countErr) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
   }

   res.status(200).send({ success: true, dishes, total: count });
});

const getAllDishes = asyncHandler(async (req: any, res: any): Promise<void> => {
   const { sortOrder = "", veg = "all", page = 1, limit = 15 } = req.query;

   const conditions: any = {};
   if (veg !== "all") {
      conditions.nonVeg = veg !== "veg";
   }

   const query: any = {};

   const [err, dishes] = await catchAsync(
      prisma.dishes.findMany({
         where: conditions,
         include: {
            categories: {
               include: {
                  taxonomy: true,
               },
            },
         },
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query,
      }),
   );

   if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
   }

   const [countErr, count] = await catchAsync(prisma.dishes.count({ where: conditions }));

   if (countErr) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
   }

   res.status(200).send({ success: true, dishes, total: count });
});

const getDishDetails = asyncHandler(async (req: any, res: any): Promise<void> => {
   const slug = req.params.slug;

   const [err, dish] = await catchAsync(
      prisma.dishes.findUnique({
         where: { slug },
         include: {
            categories: true,
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
      return;
   }

   res.status(200).json({ success: true, dish });
});

const getDishesByCategory = asyncHandler(async (req: any, res: any): Promise<void> => {
   const { categorySlug } = req.params;

   const [err, dishes] = await catchAsync(
      prisma.dishes.findMany({
         where: {
            categories: {
               some: {
                  taxonomy: {
                     slug: categorySlug,
                  },
               },
            },
         },
         select: {
            id: true,
            title: true,
            price: true,
            thumbnail: true,
            nonVeg: true,
            slug: true,
         },
         orderBy: {
            createdAt: "desc",
         },
         take: 6,
         skip: 0,
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
      return;
   }

   res.status(200).json({ success: true, dishes });
});

publicDishesRouting.get("/delivery-dishes", validate(deliveryDishesSchema), getDeliveryDishes);
publicDishesRouting.get("/all-dishes", validate(allDishesSchema), getAllDishes);
publicDishesRouting.get("/dish-details/:slug", validate(dishDetailsSchema), getDishDetails);
publicDishesRouting.get("/dishes-by-category/:categorySlug", validate(dishesByCategorySchema), getDishesByCategory);

export default publicDishesRouting;
