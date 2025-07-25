const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const cron = require('node-cron');
const downloadAllCloudinaryImages = require('./src/utils/downloadAllCloudinaryImages');
const path = require('path');
const fs = require('fs');
const { getSession } = require('./src/lib/session');
const os = require('os');
const desktopPath = path.join(os.homedir(), 'Desktop', 'SnapeekImages');
const pdfsRoot = desktopPath; // PDFs will be stored in user folders under SnapeekImages

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
app.use(express.json());
app.use(cookieParser());

// Serve images statically

// Serve images statically
app.use('/images', express.static(desktopPath));

// Serve PDFs statically
app.use('/pdfs', express.static(desktopPath));
// API endpoint to list local PDFs by folder (supports user folders)
app.get('/pdfs/api/folders', (req, res) => {
  try {
    if (!fs.existsSync(pdfsRoot)) return res.json({});
    let userFolders = fs.readdirSync(pdfsRoot).filter(f => fs.statSync(path.join(pdfsRoot, f)).isDirectory());
    // If user is logged in, only show their folder
    const session = getSession(req);
    if (session && session.email) {
      const safeUser = session.email.replace(/[@.]/g, '_');
      userFolders = userFolders.filter(f => f === safeUser);
    }
    let result = {};
    userFolders.forEach(userFolder => {
      const notesPath = path.join(pdfsRoot, userFolder, 'Notes');
      if (!fs.existsSync(notesPath)) return;
      const files = fs.readdirSync(notesPath);
      const pdfs = files.filter(f => /\.pdf$/i.test(f));
      if (pdfs.length > 0) {
        result[userFolder] = pdfs.map(f => ({
          url: `/pdfs/${userFolder}/Notes/${f}`,
          filename: f
        }));
      }
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /pdfs/api/folders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to download a PDF
app.get('/download/pdf/:user/:filename', (req, res) => {
  const { user, filename } = req.params;
  const filePath = path.join(pdfsRoot, user, 'Notes', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  res.download(filePath, filename);
});

// Serve login.html and download.html as static files
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
app.get('/download.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'download.html'));
});
app.get('/notes.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'notes.html'));
});

// Serve the gallery.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'gallery.html'));
});

// API endpoint to list local images by folder (supports user folders)
app.get('/images/api/folders', (req, res) => {
  try {
    const imagesRoot = desktopPath;
    if (!fs.existsSync(imagesRoot)) return res.json({});
    let userFolders = fs.readdirSync(imagesRoot).filter(f => fs.statSync(path.join(imagesRoot, f)).isDirectory());
    // If user is logged in, only show their folder
    const session = getSession(req);
    if (session && session.email) {
      const safeUser = session.email.replace(/[@.]/g, '_');
      userFolders = userFolders.filter(f => f === safeUser);
    }
    let result = {};
    userFolders.forEach(userFolder => {
      const userPath = path.join(imagesRoot, userFolder);
      const categoryFolders = fs.readdirSync(userPath).filter(f => fs.statSync(path.join(userPath, f)).isDirectory());
      result[userFolder] = {};
      categoryFolders.forEach(category => {
        const categoryPath = path.join(userPath, category);
        const files = fs.readdirSync(categoryPath);
        const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
        if (images.length > 0) {
          result[userFolder][category] = images.map(f => {
            const base = f.replace(/\.[^/.]+$/, '');
            const txtFile = base + '.txt';
            let description = '';
            if (files.includes(txtFile)) {
              try {
                description = fs.readFileSync(path.join(categoryPath, txtFile), 'utf8');
              } catch {}
            }
            return {
              url: `/images/${userFolder}/${category}/${f}`,
              description
            };
          });
        }
      });
      if (Object.keys(result[userFolder]).length === 0) delete result[userFolder];
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /images/api/folders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB
// connectDB(); // REMOVE this line so server starts without DB

// Middleware
app.use(express.json());

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/images', require('./src/routes/images'));



// Schedule: every day at 12am (midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Scheduled image download started...');
  try {
    const result = await downloadAllCloudinaryImages();
    console.log('Scheduled download summary:', result);
  } catch (err) {
    console.error('Scheduled download failed:', err);
  }
});

app.listen(PORT, () => {


  console.log(`
  ══════════════════════════════ 📸 Snapeek 📸 ══════════════════════════════
  
  ✨ Welcome to Snapeek – Your Personal Image & Screenshot Gallery!
  
  🌐 Local Gallery Access:        http://localhost:${PORT}
  📤 Upload Screenshots/Images:   https://snapeek.vercel.app
  ❗ Keep Terminal Open:          Minimize with [ - ], avoid closing [ X ]
  
  🛠️ If the server stops running:
  👉 Double-click Snapeek.exe again to restart the server.
  👉 Or, if set up, it will auto-start with your computer.
  
  🔍 To View Your Gallery:
  1️⃣  Open your web browser (Chrome, Edge, Firefox, etc.).
  2️⃣  Paste the local URL: http://localhost:${PORT}
  3️⃣  Browse your screenshots and images by folders or categories.
  4️⃣  Use the Download button to sync new images (login required).
  
  💡 Tips:
  - You can bookmark the gallery page for quick access.
  - Images and descriptions are stored on your Desktop in the "SnapeekImages" folder.
  - The app works offline! You only need internet for cloud sync or login.
  
  🔒 Privacy Note:
  Your data stays local by default. You can choose to sync with the cloud for remote access.
  
  📦 Snapeek runs silently in the background. Enjoy uninterrupted access!
  
  ❓ Need help?
  - Visit the Snapeek website or contact support for assistance.
  
  ═══════════════════════════════════════════════════════════════════════════
  `);
  
  
});
