import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';

const publicDishesRouting = Router()


publicDishesRouting.get('/delivery-dishes', async (req, res) => {
   try {
      const { search = "", sortColumn = "createdAt", sortOrder = "desc", veg = "all", page = 1, limit = 15 } = req.query
      const conditions: any = {}
      if (search) {
         conditions.title = {
            contains: search,
            mode: "insensitive"
         }
      }
      if (veg !== "all") {
         conditions.nonVeg = veg !== "veg"
      }
      const query: any = {};
      // if (sortColumn && sortOrder) {
      //    query.orderBy = { [sortColumn as string]: sortOrder }
      // }


      if (sortOrder) {
         if (sortOrder === 'gth') {
            query.orderBy = { price: 'desc' }
         }
         if (sortOrder === 'lth') {
            query.orderBy = { price: 'asc' }
         }
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
      console.error(error)
      res.status(500).json({ message: 'Internal Server Error' })
   }
})
publicDishesRouting.get('/all-dishes', async (req, res) => {
   try {
      const { sortOrder = '', veg = 'all', page = 1, limit = 15 } = req.query
      console.log(req.query)
      const conditions: any = {}
      // if (search) {
      //    conditions.title = {
      //       contains: search,
      //       mode: "insensitive"
      //    }
      // }

      if (veg !== "all") {
         conditions.veg = veg !== 'veg'
      }

      const query: any = {};
      // if (column && sortOrder) {
      //    query.orderBy = { [column]: sortOrder }
      // }

      // if (sortOrder) {
      //    if (sortOrder === 'gth') {
      //       query.orderBy = { price: 'desc' }
      //    }
      //    if (sortOrder === 'lth') {
      //       query.orderBy = { price: 'asc' }
      //    }
      // }

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
      console.error(error)
      res.status(500).json({ message: 'Internal Server Error' })
   }
})
publicDishesRouting.get("/dish-details/:slug", async (req, res) => {
   try {
      const slug = req.params.slug;
      const dish = await prisma.dishes.findUnique({
         where: { slug },
         include: {
            categories: true
         }
      })
      res.status(200).json({ success: true, dish })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: true, message: 'Internal Server Error' })
   }
})
publicDishesRouting.get("/dishes-by-category/:categorySlug", async (req, res): Promise<any> => {
   try {
      const { categorySlug } = req.params
      const dishes = await prisma.dishes.findMany({
         where: {
            categories: {
               some: {
                  taxonomy: {
                     slug: categorySlug
                  }
               }
            }
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
            createdAt: 'desc'
         },
         take: 6,
         skip: 0
      })
      return res.status(200).json({ success: true, dishes })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: true, message: 'Internal Server Error' })
   }
})

export default publicDishesRouting