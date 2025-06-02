import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import bcrypt from 'bcrypt';
import { dishesList, taxonomyList } from './data';

const demoRouting = Router()

demoRouting.post("/create-admin-user", async (req, res): Promise<any> => {
   try {
      const body = req.body
      const user = await prisma.users.findUnique({
         where: { email: body.email }
      })
      if (user) return res.status(409).json({ success: false, message: "User already exists" })
      const hashPassword = bcrypt.hashSync(body.password, 16)
      const newUser = await prisma.users.create({
         data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            role: 'administrator',
            isActive: true,
            userAuth: {
               create: {
                  method: "password",
                  password: hashPassword
               }
            }
         }
      })
      if (!newUser) return res.status(409).json({ success: false, message: "Not create user" })

      return res.status(200).json({ success: true, newUser })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})

demoRouting.post("/create-dish", async (req, res) => {
   try {
      const createMany = await prisma.dishes.createMany({
         data: [...dishesList],
         skipDuplicates: true,
      })
      res.status(200).json({ success: true, createMany })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error })
   }
})
demoRouting.post("/create-category", async (req, res) => {
   try {
      const createMany = await prisma.taxonomy.createMany({
         data: [...taxonomyList],
         skipDuplicates: true,
      })
      res.status(200).json({ success: true, createMany })
   } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error })
   }
})

export default demoRouting