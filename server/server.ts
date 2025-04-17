import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectTestDb } from './config/mongodb';
import bcrRoutes from './routes/bcrRoutes';
import bcrFileRoutes from './routes/bcrFileRoutes';
import fileRoutes from './routes/fileRoutes';
import fileFolderRoutes from './routes/fileFolderRoutes';
import emailRoutes from './routes/emailRoutes';
import folderRoutes from './routes/folderRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reserveRoutes from './routes/reserveRoutes';
import uploadReserveImgRoutes from './routes/uploadReserveImgRoutes';
import userRoutes from './routes/userRoutes';
import cookieParser from 'cookie-parser';

dotenv.config();
connectTestDb();

const app = express();
app.use(
    cors({
      origin: process.env.NEXT_PUBLIC_DOMAIN, // ✅ Only allow your frontend origin
      credentials: true,               // ✅ Allow cookies to be sent
    })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api/bcrs', bcrRoutes);
app.use('/api/bcrs-file', bcrFileRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/files-folders', fileFolderRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reserve', reserveRoutes);
app.use('/api/upload-reserve-img', uploadReserveImgRoutes);
app.use('/api/users', userRoutes);

app.get('/test', (req, res) => {
    console.log("✅ TEST route hit");
    res.send('Test route is working!');
});

const PORT = process.env.PORT || 3299;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// npm install
// npm run build
//THIS WORKS
//pm2 start dist/server/server.js --name bcr-server --cwd /root/bcr-system/server
