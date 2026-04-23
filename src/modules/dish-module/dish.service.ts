import { Request, Response, NextFunction } from "express";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { CreateDishBody, UpdateDishBody, DishResponse, GetAllDishesQuery } from "./interface/dish.interface";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};

export const createDish = asyncHandler(async (req: Request<{}, {}, CreateDishBody>, res: Response): Promise<void> => {
   const { category, ...rest } = req.body;

   const [checkErr, checkSlug] = await catchAsync(
      prisma.dishes.findUnique({
         where: { slug: rest.slug },
      }),
   );

   if (checkErr) {
      res.status(500).json({ success: false, message: "Database error", error: checkErr });
      return;
   }

   if (checkSlug) {
      res.status(409).json({ success: false, message: "Dish slug already exists" });
      return;
   }

   const [createErr, dish] = await catchAsync(
      prisma.dishes.create({
         data: {
            ...rest,
            categories: {
               create: category.map((id: number) => ({
                  taxonomy: { connect: { id } },
               })),
            },
         },
      }),
   );

   if (createErr) {
      res.status(500).json({ success: false, message: "Failed to create dish", error: createErr });
      return;
   }

   if (!dish) {
      res.status(409).json({ success: false, message: "Dish not created" });
      return;
   }

   res.status(200).json({ success: true, message: "Dish created successfully", dish });
});

export const updateDish = asyncHandler(async (req: Request<{ id: string }, {}, UpdateDishBody>, res: Response): Promise<void> => {
   const id = parseInt(req.params.id);
   const { category, oldThumbnail, ...rest } = req.body;

   const [findErr, dish] = await catchAsync(
      prisma.dishes.findUnique({
         where: { id },
         include: {
            categories: true,
         },
      }),
   );

   if (findErr) {
      res.status(500).json({ success: false, message: "Database error", error: findErr });
      return;
   }

   if (!dish) {
      res.status(404).json({ success: false, message: "Dish not found" });
      return;
   }

   const oldCategory = dish?.categories.map((item: any) => item.taxonomyId) || [];
   const newCategoryIds = category.filter((id: number) => !oldCategory.includes(id));
   const removedCategoryIds = oldCategory.filter((id: number) => !category.includes(id));

   const [slugErr, checkSlug] = await catchAsync(
      prisma.dishes.findUnique({
         where: {
            slug: rest.slug!,
            NOT: { id },
         },
      }),
   );

   if (slugErr) {
      res.status(500).json({ success: false, message: "Database error", error: slugErr });
      return;
   }

   if (checkSlug) {
      res.status(409).json({ success: false, message: "Slug already exists" });
      return;
   }

   const [updateErr, updateDish] = await catchAsync(
      prisma.dishes.update({
         where: { id },
         data: {
            ...rest,
            categories: {
               create: newCategoryIds.map((id: number) => ({
                  taxonomy: { connect: { id } },
               })),
            },
         },
      }),
   );

   if (updateErr) {
      res.status(500).json({ success: false, message: "Failed to update dish", error: updateErr });
      return;
   }

   const [deleteErr] = await catchAsync(
      Promise.all(
         removedCategoryIds.map((taxonomyId: number) =>
            prisma.dishesTaxonomy.delete({
               where: { dishId_taxonomyId: { dishId: id, taxonomyId } },
            }),
         ),
      ),
   );

   if (deleteErr) {
      res.status(500).json({ success: false, message: "Failed to update categories", error: deleteErr });
      return;
   }

   if (!updateDish) {
      res.status(409).json({ success: false, message: "Dish not updated" });
      return;
   }

   res.status(200).json({ success: true, message: "Dish updated successfully" });
});

export const getDishById = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const id = parseInt(req.params.id);

   const [err, dish] = await catchAsync(
      prisma.dishes.findUnique({
         where: { id },
         include: {
            categories: {
               include: {
                  taxonomy: true,
               },
            },
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Database error", error: err });
      return;
   }

   if (!dish) {
      res.status(404).json({ success: false, message: "Dish not found" });
      return;
   }

   res.status(200).json({ success: true, dish });
});

export const deleteDish = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const id = parseInt(req.params.id);
   const thumbnail = req.query.thumbnail as string | undefined;

   const [err] = await catchAsync(
      prisma.$transaction([
         prisma.dishesTaxonomy.deleteMany({
            where: { dishId: id },
         }),
         prisma.dishes.delete({
            where: { id },
         }),
      ]),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Failed to delete dish", error: err });
      return;
   }

   res.status(200).json({ success: true, message: "Dish deleted successfully" });
});

export const getAllDishes = asyncHandler(async (req: Request<{}, {}, {}, GetAllDishesQuery>, res: Response): Promise<void> => {
   const { search, column = "createdAt", sortOrder = "desc", page = "1", limit = "15" } = req.query;

   const conditions: any = {};
   if (search) {
      conditions.title = {
         contains: search,
         mode: "insensitive",
      };
   }

   const query: any = {};
   if (column && sortOrder) {
      query.orderBy = { [column]: sortOrder };
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
         take: parseInt(limit),
         skip: (parseInt(page) - 1) * parseInt(limit),
         ...query,
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Database error", error: err });
      return;
   }

   const [countErr, count] = await catchAsync(prisma.dishes.count({ where: conditions }));

   if (countErr) {
      res.status(500).json({ success: false, message: "Database error", error: countErr });
      return;
   }

   res.status(200).send({ success: true, data: dishes, pagination: { total: count } });
});

export const uploadThumbnail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const file = req.file;
   res.status(200).json({ success: true, message: "Successfully uploaded", file });
});
