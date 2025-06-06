// main file
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import http from 'http'
import { Server } from 'socket.io'
import authRouting from "./controllers/auth-controllers"
import adminUserRouting from "./controllers/user-controllers/adminUser"
import adminTaxonomyRouting from "./controllers/taxonomy-controllers/adminTaxonomy"
import adminDishesRouting from "./controllers/dishes-controllers/adminDishes"
import publicDishesRouting from "./controllers/dishes-controllers/publicDishes"
import publicTaxonomyRouting from "./controllers/taxonomy-controllers/taxonomy"
import checkoutRouting from "./controllers/checkout-controllers/checkout"
import demoRouting from "./controllers/demo-controller"
import publicUserRouting from "./controllers/user-controllers/publicUser"
import adminOrdersRouting from "./controllers/order-controllers/adminOrders"
// const { Server } = require("socket.io");


const app = express()
dotenv.config()

// handle Uncaught Exception
process.on("uncaughtException", err => {
   console.log(`Error: ${err.message}`)
   process.exit(1)
})

app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json

// cors origin define
app.use(cors({
   origin: [`${process.env.ALLOWED_ORIGIN_WEB}`, "https://flavourhaven.vercel.app/", "https://flavour-haven.arupmaity.in/"],
   credentials: true,
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept', 'X-Access-Token', 'X-Refresh-Token'],
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

const server = http.createServer(app);

// Routes
app.get('/', (req, res) => {
   res.status(200).json({ success: true, allow_origin: process.env.ALLOWED_ORIGIN_WEB });
});

app.use('/api/auth', authRouting)
app.use('/api/admin/user', adminUserRouting)
app.use('/api/user', publicUserRouting)
app.use('/api/admin/taxonomy', adminTaxonomyRouting)
app.use('/api/taxonomy', publicTaxonomyRouting)
app.use('/api/admin/dishes', adminDishesRouting)
app.use('/api/dishes', publicDishesRouting)
// order
app.use('/api/admin/order', adminOrdersRouting)
//
app.use("/api/checkout", checkoutRouting)

// demo
app.use("/api/demo", demoRouting)

// const io = new Server(server, {
//    cors: {
//       origin: [`${process.env.ALLOWED_ORIGIN_WEB}`, 'http://localhost:3001'],
//       methods: ["GET", "POST"]
//    }
// });


// io.on('connection', (socket) => {
//    console.log('New user connected');
//    console.log(socket.id)
//    socket.on('sendMessage', (message) => {
//       console.log(message)
//       io.emit(message.userId, message);
//    });

//    socket.on('disconnect', () => {
//       console.log('User disconnected');
//    });
// });

let users: { [key: string]: any } = {};

// Socket.IO event listeners
// io.on('connection', (socket) => {
//    console.log('A user connected:', socket.id);

//    // Store the username of connected users
//    socket.on('join', ({ username }) => {
//       users[username] = socket.id;
//       console.log(username)
//       io.emit('updateUserList', Object.keys(users));
//       console.log('Updated user list:', Object.keys(users));
//    });

//    // Handle private messaging
//    socket.on('privateMessage', ({ recipientId, message }) => {
//       // console.log('Private message', recipientId, message,users[socket.id]);
//       // io.to(recipientId).emit('receiveMessage', { message, from: users[socket.id] });
//       const recipientSocketId = users[recipientId];  // Get recipient's socket ID
//       if (recipientSocketId) {
//          // Emit the message only to the recipient's socket
//          io.to(recipientSocketId).emit('receiveMessage', {
//             message,
//             from: recipientId
//          });
//          console.log(`Private message sent to ${recipientSocketId}`);
//       } else {
//          console.log(`User ${recipientSocketId} is not online.`);
//       }
//    });

//    // Handle group messaging
//    socket.on('groupMessage', (message) => {
//       console.log('Received group message:', message)
//       io.emit('receiveGroupMessage', { message, from: users[socket.id] });
//    });

//    socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//       // delete users[socket.id];
//       // io.emit('updateUserList', Object.values(users));
//    });
// });


server.listen(process.env.PORT || 8050, () => {
   console.log(`Port ${process.env.PORT}`);
});