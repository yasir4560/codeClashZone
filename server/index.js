const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connection');
const authRoute = require('./routes/user');
const problemRoute = require('./routes/problems');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);

dotenv.config();

connectDB(process.env.MongoDB_URI);

app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use('/api/auth',authRoute);
app.use('/api/problems', problemRoute);

server.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));