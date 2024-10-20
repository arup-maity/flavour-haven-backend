"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// main file
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_controllers_1 = __importDefault(require("./controllers/auth-controllers"));
const adminUser_1 = __importDefault(require("./controllers/user-controllers/adminUser"));
const adminTaxonomy_1 = __importDefault(require("./controllers/taxonomy-controllers/adminTaxonomy"));
const adminDishes_1 = __importDefault(require("./controllers/dishes-controllers/adminDishes"));
const publicDishes_1 = __importDefault(require("./controllers/dishes-controllers/publicDishes"));
const taxonomy_1 = __importDefault(require("./controllers/taxonomy-controllers/taxonomy"));
const checkout_1 = __importDefault(require("./controllers/checkout-controllers/checkout"));
const demo_controller_1 = __importDefault(require("./controllers/demo-controller"));
// const { Server } = require("socket.io");
const app = (0, express_1.default)();
dotenv_1.default.config();
// handle Uncaught Exception
process.on("uncaughtException", err => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});
// cors origin define
app.use((0, cors_1.default)({ credentials: true, origin: 'http://localhost:3001' }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(body_parser_1.default.json()); // parse application/json
const server = http_1.default.createServer(app);
// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/auth', auth_controllers_1.default);
app.use('/api/admin/user', adminUser_1.default);
app.use('/api/admin/taxonomy', adminTaxonomy_1.default);
app.use('/api/taxonomy', taxonomy_1.default);
app.use('/api/admin/dishes', adminDishes_1.default);
app.use('/api/dishes', publicDishes_1.default);
app.use("/api/checkout", checkout_1.default);
// demo
app.use("/api/demo", demo_controller_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
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
let users = {};
console.log('total user', users);
// Socket.IO event listeners
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Store the username of connected users
    socket.on('join', ({ username }) => {
        users[username] = socket.id;
        console.log(username);
        io.emit('updateUserList', Object.keys(users));
        console.log('Updated user list:', Object.keys(users));
    });
    // Handle private messaging
    socket.on('privateMessage', ({ recipientId, message }) => {
        // console.log('Private message', recipientId, message,users[socket.id]);
        // io.to(recipientId).emit('receiveMessage', { message, from: users[socket.id] });
        const recipientSocketId = users[recipientId]; // Get recipient's socket ID
        if (recipientSocketId) {
            // Emit the message only to the recipient's socket
            io.to(recipientSocketId).emit('receiveMessage', {
                message,
                from: recipientId
            });
            console.log(`Private message sent to ${recipientSocketId}`);
        }
        else {
            console.log(`User ${recipientSocketId} is not online.`);
        }
    });
    // Handle group messaging
    socket.on('groupMessage', (message) => {
        console.log('Received group message:', message);
        io.emit('receiveGroupMessage', { message, from: users[socket.id] });
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // delete users[socket.id];
        // io.emit('updateUserList', Object.values(users));
    });
});
server.listen(process.env.PORT || 8081, () => {
    console.log(`Port ${process.env.PORT}`);
});
