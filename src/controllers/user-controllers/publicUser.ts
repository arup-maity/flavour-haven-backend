import { Router, Request, Response, response } from 'express';
import prisma from '@/config/prisma';
import { userAuthentication } from '@/middleware';

const publicUserRouting = Router()
publicUserRouting.use(userAuthentication())
publicUserRouting.get('/profile-details', async (req, res) => {
   try {
      const userDetails = req.user;
      const profileDetails = await prisma.users.findUnique({
         where: { id: +userDetails?.id },
      })
      res.status(200).json({ success: true, profileDetails })
   } catch (error) {
      res.status(500).json({ error: error })
   }
})
publicUserRouting.get('/address-details', async (req, res) => {
   try {
      const userDetails = req.user;
      const addressDetails = await prisma.userAddresses.findMany({
         where: { userId: +userDetails.id },
      })
      res.status(200).json({ success: true, addressDetails })
   } catch (error) {
      res.status(500).json({ error: error })
   }
})
publicUserRouting.post('/add-address', async (req, res) => {
   try {
      const userDetails = req.user;
      const body = req.body
      const newAddress = await prisma.userAddresses.create({
         data: {
            userId: +userDetails.id,
            fullName: body.fullName,
            streetAddress: body.streetAddress,
            country: body.country,
            city: body.city,
            state: body.state,
            zipCode: body.zipCode,
            phone: body.phone,
         }
      })
      res.status(200).json({ success: true, newAddress })
   } catch (error) {
      res.status(500).json({ error: error })
   }
})
publicUserRouting.put('/update-address/:id', async (req, res) => {
   try {
      const id = req.params.id;
      const body = req.body
      const updateAddress = await prisma.userAddresses.update({
         where: { id: +id },
         data: {
            fullName: body.fullName,
            streetAddress: body.streetAddress,
            country: body.country,
            city: body.city,
            state: body.state,
            zipCode: body.zipCode,
            phone: body.phone,
         }
      })
      res.status(200).json({ success: true, updateAddress })
   } catch (error) {
      res.status(500).json({ error: error })
   }
})
publicUserRouting.get('/order-list', async (req, res) => {
   try {
      const userDetails = req.user;
      const { search, page = "1", limit = "15", } = req.query as { search?: string; page?: string; limit?: string; };

      const orders = await prisma.order.findMany({
         where: { userId: +userDetails.id },
         include: {
            orderItems: {
               include: {
                  dishes: {
                     select: {
                        thumbnail: true
                     }
                  }
               }
            },
            paymentMethod: true
         },
         orderBy: {
            createdAt: 'desc'
         },
         take: parseInt(limit, 10),
         skip: (parseInt(page, 10) - 1) * parseInt(limit, 10)
      })
      res.status(200).json({ success: true, orders })
   } catch (error) {
      res.status(500).json({ error: error })
   }
})

export default publicUserRouting