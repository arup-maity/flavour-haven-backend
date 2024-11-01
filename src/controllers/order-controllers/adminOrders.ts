import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';
import { deleteFilesFromStore, dishesUpload, taxonomyUpload } from '@/config/fileUpload';

const adminOrdersRouting = Router()
adminOrdersRouting.use(adminAuthentication())

adminOrdersRouting.get("/orders-list", async (req, res) => {
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
      const orders = await prisma.order.findMany({
         where: conditions,
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true
               }
            },
            paymentMethod: true
         },
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query
      })
      res.status(200).json({ success: true, orders })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error })
   }
})
adminOrdersRouting.get("/order-request", async (req, res) => {
   try {
      const orders = await prisma.order.findMany({
         // where: { status: "pending" },
      })
      res.status(200).json({ success: true, orders })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error })
   }
})
adminOrdersRouting.get("/read-order/:id", async (req, res) => {
   try {
      const id = req.params.id
      const order = await prisma.order.findUnique({
         where: { id: +id },
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true
               }
            },
            paymentMethod: true
         }
      })
      if (!order) res.status(409).json({ success: true, message: 'Orders not found' })
      res.status(200).json({ success: true, order })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error })
   }
})
adminOrdersRouting.put("/update-status/:id", async (req, res) => {
   try {
      const id = req.params.id
      const { status } = req.body
      const updatedOrder = await prisma.order.update({
         where: { id: +id },
         data: { status },
         include: {
            user: true,
            orderItems: {
               include: {
                  dishes: true
               }
            },
            paymentMethod: true
         }
      })
      if (!updatedOrder) res.status(409).json({ success: false, message: "Not found" })
      res.status(200).json({ success: true, message: "Order status updated successfully", updatedOrder })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error: error })
   }
})


export default adminOrdersRouting