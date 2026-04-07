require('dotenv').config(); 
const express = require('express'); 
const http = require('http'); 
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth'); 
const codeRoutes = require('./routes/code');
const matchRoutes = require('./routes/match');
const teamsRoutes = require('./routes/teams'); 

const app = express(); 
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
})); 
app.use(express.json({limit : '2mb'})); 
app.use(cookieParser());

//Routers
app.use('/api/auth',authRoutes); 
app.use('/api/code',codeRoutes); 
app.use('/api/match',matchRoutes);
app.use('/api/teams',teamsRoutes);  

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Bağlantı başarılı"))
.catch(err => console.log("MongoDb hatası: ", err));


const server = http.createServer(app);
const io = new Server(server,{
    cors : {origin : '*'}
});

require('./sockets/socketHandler')(io);


app.get("/",(req,res) => {
    res.status(200); 
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor`); 
}); 
