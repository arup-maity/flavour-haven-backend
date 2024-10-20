import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';

const publicDishesRouting = Router()


publicDishesRouting.get('/delivery-dishes', async (req, res) => {
   try {
      const { sort = '', veg = false, page = 1, limit = 15 } = req.query
      const conditions: any = {}
      // if (search) {
      //    conditions.title = {
      //       contains: search,
      //       mode: "insensitive"
      //    }
      // }

      if (veg) {
         conditions.veg = true
      }

      const query: any = {};
      // if (column && sortOrder) {
      //    query.orderBy = { [column]: sortOrder }
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
publicDishesRouting.get('/all-dishes', async (req, res) => {
   try {
      const { sort = '', veg = false, page = 1, limit = 15 } = req.query
      console.log(req.query)
      const conditions: any = {}
      // if (search) {
      //    conditions.title = {
      //       contains: search,
      //       mode: "insensitive"
      //    }
      // }

      if (veg) {
         conditions.veg = true
      }

      const query: any = {};
      // if (column && sortOrder) {
      //    query.orderBy = { [column]: sortOrder }
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

export default publicDishesRouting