const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connection');
const path = require('path');

const authRoute = require('./routes/user');
const problemRoute = require('./routes/problems');
const submissionRoute = require('./routes/submissions');
const dsaProblemRoute = require('./routes/dsaProblems');
const communityRoutes = require('./routes/communityRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');


const { Server } = require('socket.io');
const setupSocket = require('./socket');


const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();



connectDB(process.env.MongoDB_URI);


app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/auth', authRoute);
app.use('/api/problems', problemRoute);
app.use('/api/frontend', problemRoute);
app.use('/api/', submissionRoute);
app.use('/api/users/', submissionRoute);
app.use('/api/dsa', dsaProblemRoute);
app.use('/api/community',communityRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//socket setup
const server = http.createServer(app);
const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

setupSocket(io);





const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server and socket is run on port ${PORT}`));
