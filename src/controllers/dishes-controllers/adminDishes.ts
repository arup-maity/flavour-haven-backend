import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';
import { deleteFilesFromStore, dishesUpload, taxonomyUpload } from '@/config/fileUpload';

const adminDishesRouting = Router()
adminDishesRouting.use(adminAuthentication())

adminDishesRouting.post('/create-dish', async (req, res) => {
   try {
      const { category, ...rest } = req.body
      const checkSlug = await prisma.dishes.findUnique({
         where: { slug: rest.slug }
      })
      if (checkSlug) res.status(409).json({ success: false, message: "Dish slug already exists" })
      const dish = await prisma.dishes.create({
         data: {
            ...rest,
            categories: {
               create: category.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               })),
            }
         }
      })
      if (!dish) res.status(409).json({ success: false, message: "Dish not created" })
      res.status(200).json({ success: true, message: "Dish created successfully", dish })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: 'Something went wrong', error })
   }
})
adminDishesRouting.put("/update-dish/:id", async (req, res) => {
   try {
      const id = req.params.id
      const { category, oldCategory, oldThumbnail, ...rest } = req.body
      const newCategoryIds = category.filter((id: number) => !oldCategory.includes(id))
      const removedCategoryIds = oldCategory.filter((id: number) => !category.includes(id));
      const checkSlug = await prisma.dishes.findUnique({
         where: {
            slug: rest.slug,
            NOT: { id: +id }
         }
      })
      if (checkSlug) res.status(409).json({ success: false, message: "Slug already exists" })
      const updateDish = await prisma.dishes.update({
         where: { id: +id },
         data: {
            ...rest,
            categories: {
               create: newCategoryIds.map((id: number) => ({
                  taxonomy: { connect: { id: id } },
               }))
            }
         }
      })

      await Promise.all(removedCategoryIds.map((taxonomyId: number) =>
         prisma.dishesTaxonomy.delete({
            where: { dishId_taxonomyId: { dishId: +id, taxonomyId } },
         })
      ));

      if (!updateDish) res.status(409).json({ success: false, message: "Dish not updated" })
      if (oldThumbnail !== '' && oldThumbnail !== rest.thumbnail) {
         // await deleteFile('restaurant', oldThumbnail)
      }
      res.status(200).json({ success: true, message: "Dish updated successfully" })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong', error })
   }
})
adminDishesRouting.get('/read-dish/:id', async (req, res) => {
   try {
      const id = req.params.id
      const dish = await prisma.dishes.findUnique({
         where: { id: +id },
         include: {
            categories: {
               include: {
                  taxonomy: true
               }
            }
         }
      })
      if (!dish) res.status(404).json({ success: false, message: "Dish not found" })
      res.status(200).json({ success: true, dish })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: 'Something went wrong', error })
   }
})
adminDishesRouting.delete("/delete-dish/:id", async (req, res) => {
   try {
      const id = req.params.id
      const thumbnail = req.query.thumbnail
      await prisma.$transaction([
         prisma.dishesTaxonomy.deleteMany({
            where: { dishId: +id }
         }),
         prisma.dishes.delete({
            where: { id: +id }
         })
      ])
      // await deleteFile('restaurant', thumbnail)
      res.status(200).json({ success: true, message: "Dish deleted successfully" })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong', error })
   }
})
interface ManagementsListQuery {
   page?: string;      // Query parameters are typically strings
   limit?: string;     // Using strings for query parameters
   search?: string;
   role?: string;
   column?: string;
   sortOrder?: 'asc' | 'desc'; // Specify possible sort orders
}
adminDishesRouting.get('/all-dishes', async (req: Request<{}, {}, {}, ManagementsListQuery>, res: Response) => {
   try {
      const { search, column = 'createdAt', sortOrder = 'desc', page = 1, limit = 15 } = req.query
      const conditions: any = {}
      if (search) {
         conditions.title = {
            contains: search,
            mode: "insensitive"
         }
      }
      const query: any = {};
      if (column && sortOrder) {
         query.orderBy = { [column]: sortOrder }
      }

      const dishes = await prisma.dishes.findMany({
         where: conditions,
         include: {
            categories: {
               include: {
                  taxonomy: true
               }
            }
         },
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query
      })
      const count = await prisma.dishes.count({ where: conditions, })
      res.status(200).send({ success: true, dishes, total: count })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Error', error })
   }
})
adminDishesRouting.post('/thumbnail-upload', adminAuthentication(), dishesUpload.single('image'), async (req, res) => {
   try {
      const file = req.file
      res.status(200).json({ success: true, message: 'Successfully uploaded', file })
   } catch (error) {
      res.status(500).json({ success: false })
   }
})

export default adminDishesRouting