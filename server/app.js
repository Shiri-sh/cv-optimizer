import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { DownloadAdvancedCV, AnalyzeCV } from './controllers.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();
app.use('/api',router);

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = "CV before Changes" + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

router.get('/download/:filename', DownloadAdvancedCV);
router.post('/analyze', upload.single("file"), AnalyzeCV);
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});