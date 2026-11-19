import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as mm from 'music-metadata';
import http from 'http';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: '*',
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']
}));
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const SAMPLE_DIR = path.join(__dirname, 'public', 'sample');
const DATA_FILE = path.join(__dirname, 'data', 'media.json');
const PLAYLISTS_FILE = path.join(__dirname, 'data', 'playlists.json');

[UPLOAD_DIR, SAMPLE_DIR, path.join(__dirname, 'data')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 * 2 } // 2GB limit
});

// Seed Initial Media List if not present
function initializeMediaDb() {
  let media = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      media = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      media = [];
    }
  }

  // Pre-seed default samples if missing
  const sampleItems = [
    {
      id: 'sample-bunny-video',
      title: 'Big Buck Bunny (Animation Preview)',
      filename: 'big-buck-bunny-preview.mp4',
      originalName: 'Big Buck Bunny Preview.mp4',
      path: path.join(SAMPLE_DIR, 'big-buck-bunny-preview.mp4'),
      mimeType: 'video/mp4',
      type: 'video',
      size: fs.existsSync(path.join(SAMPLE_DIR, 'big-buck-bunny-preview.mp4')) 
        ? fs.statSync(path.join(SAMPLE_DIR, 'big-buck-bunny-preview.mp4')).size : 788493,
      duration: 10,
      subtitles: [
        { id: 'sub-en', label: 'English', language: 'en', url: '/api/media/sample-bunny-video/subtitles/sample_en.vtt' }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-synth-audio',
      title: 'Synth Groove & Harmonic Chords (Equalizer Demo)',
      filename: 'synth-groove-demo.wav',
      originalName: 'Synth Groove Demo.wav',
      path: path.join(SAMPLE_DIR, 'synth-groove-demo.wav'),
      mimeType: 'audio/wav',
      type: 'audio',
      size: fs.existsSync(path.join(SAMPLE_DIR, 'synth-groove-demo.wav'))
        ? fs.statSync(path.join(SAMPLE_DIR, 'synth-groove-demo.wav')).size : 2822444,
      duration: 16,
      artist: 'Vidio Player Synth',
      album: 'Vidio Player Master Tracks',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-mux-hls',
      title: 'Big Buck Bunny HLS Multi-Bitrate Stream',
      streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      mimeType: 'application/x-mpegURL',
      type: 'hls',
      isStream: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-blue-moon',
      title: 'View From A Blue Moon (Surf Film 720p)',
      streamUrl: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
      mimeType: 'video/mp4',
      type: 'video',
      isStream: true,
      subtitles: [
        { id: 'sub-blue-en', label: 'English', language: 'en', url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.en.vtt' }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  let changed = false;
  for (const s of sampleItems) {
    if (!media.some(m => m.id === s.id)) {
      media.push(s);
      changed = true;
    }
  }

  if (changed || !fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(media, null, 2));
  }
  return media;
}

let mediaDb = initializeMediaDb();

// Helper to save media DB
function saveMediaDb() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(mediaDb, null, 2));
}

// Automatically prune files from database if they were deleted from the device
function pruneMissingFiles() {
  let changed = false;
  mediaDb = mediaDb.filter(item => {
    if (item.isStream) return true; // Online streams don't live on local disk
    const filePath = item.path || (item.filename ? path.join(UPLOAD_DIR, item.filename) : null);
    if (filePath && !fs.existsSync(filePath)) {
      console.log(`[Vidio Player Auto-Sync] File was deleted from device: ${item.title} (${filePath}). Automatically removing from library.`);
      changed = true;
      return false;
    }
    return true;
  });

  if (changed) {
    saveMediaDb();
  }
  return changed;
}

// Watch uploads directory: when a file is deleted from the device, immediately purge it from player
if (fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.watch(UPLOAD_DIR, (eventType, filename) => {
      pruneMissingFiles();
    });
  } catch (e) {
    console.warn('Directory watcher warning:', e.message);
  }
}

// Media Streaming with HTTP 206 Partial Content (Supports fast scrubbing and seeking)
function streamFile(filePath, req, res, mimeType) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType || 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': mimeType || 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
}

// ----------------- API ROUTES -----------------

// 1. Get All Media Items (Auto-prunes any files deleted from device)
app.get('/api/media', (req, res) => {
  pruneMissingFiles();
  res.json(mediaDb);
});

// 2. Stream a media item
app.get('/api/media/:id/stream', (req, res) => {
  const item = mediaDb.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Media not found', code: 'MEDIA_NOT_FOUND' });
  }

  if (item.isStream) {
    return res.redirect(item.streamUrl);
  }

  const filePath = item.path || (item.filename ? path.join(UPLOAD_DIR, item.filename) : null);
  if (!filePath || !fs.existsSync(filePath)) {
    pruneMissingFiles();
    return res.status(404).json({ error: 'Physical media file was deleted from device', code: 'FILE_DELETED' });
  }

  streamFile(filePath, req, res, item.mimeType);
});

// 3. Media Metadata Probe (VLC Media Information Ctrl+I)
app.get('/api/media/:id/metadata', async (req, res) => {
  const item = mediaDb.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Media item not found' });

  const filePath = item.path || (item.filename ? path.join(UPLOAD_DIR, item.filename) : null);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.json({
      title: item.title,
      mimeType: item.mimeType,
      type: item.type,
      isStream: !!item.isStream,
      streamUrl: item.streamUrl
    });
  }

  try {
    const metadata = await mm.parseFile(filePath);
    res.json({
      title: item.title,
      originalName: item.originalName,
      size: item.size,
      mimeType: item.mimeType,
      type: item.type,
      format: metadata.format,
      common: metadata.common,
      audio: {
        bitrate: metadata.format.bitrate,
        sampleRate: metadata.format.sampleRate,
        numberOfChannels: metadata.format.numberOfChannels,
        codec: metadata.format.codec,
        container: metadata.format.container
      }
    });
  } catch (err) {
    res.json({
      title: item.title,
      size: item.size,
      mimeType: item.mimeType,
      type: item.type,
      fallbackError: err.message
    });
  }
});

// 4. Subtitle endpoint for sample or custom
app.get('/api/media/sample-bunny-video/subtitles/sample_en.vtt', (req, res) => {
  const vttPath = path.join(SAMPLE_DIR, 'sample_en.vtt');
  res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
  fs.createReadStream(vttPath).pipe(res);
});

// 5. Upload Media / Subtitles
app.post('/api/media/upload', upload.fields([
  { name: 'media', maxCount: 5 },
  { name: 'subtitles', maxCount: 5 }
]), async (req, res) => {
  try {
    const uploadedMediaFiles = req.files['media'] || [];
    const uploadedSubFiles = req.files['subtitles'] || [];
    const results = [];

    for (const file of uploadedMediaFiles) {
      let duration = 0;
      let metaCommon = {};
      let mimeType = file.mimetype || 'video/mp4';
      let type = mimeType.startsWith('audio/') ? 'audio' : 'video';

      try {
        // Fast metadata probe with 400ms timeout to avoid hanging large files
        const metaPromise = mm.parseFile(file.path, { duration: true, skipCovers: true });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 400));
        const metadata = await Promise.race([metaPromise, timeoutPromise]);
        if (metadata) {
          duration = metadata.format.duration || 0;
          metaCommon = metadata.common || {};
        }
      } catch (e) {
        // Non-blocking fallback
      }

      // Check if subtitle uploaded alongside
      const subs = [];
      for (const subFile of uploadedSubFiles) {
        subs.push({
          id: 'sub-' + Date.now(),
          label: subFile.originalname,
          language: 'und',
          url: `/uploads/${subFile.filename}`
        });
      }

      const newItem = {
        id: 'media-' + Date.now() + '-' + Math.round(Math.random() * 1000),
        title: metaCommon.title || path.parse(file.originalname).name,
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimeType: mimeType,
        type: type,
        size: file.size,
        duration: duration,
        artist: metaCommon.artist || 'Unknown Artist',
        album: metaCommon.album || 'Unknown Album',
        subtitles: subs,
        createdAt: new Date().toISOString()
      };

      mediaDb.unshift(newItem);
      results.push(newItem);
    }

    saveMediaDb();
    res.json({ success: true, items: results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// 6. Delete Media
app.delete('/api/media/:id', (req, res) => {
  const index = mediaDb.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Media not found' });

  const [removed] = mediaDb.splice(index, 1);
  if (removed.filename && !removed.id.startsWith('sample-')) {
    const filePath = path.join(UPLOAD_DIR, removed.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }

  saveMediaDb();
  res.json({ success: true, removedId: req.params.id });
});

// 7. Add Network Stream URL (VLC Open Network Stream Ctrl+N)
app.post('/api/media/stream', (req, res) => {
  const { url, title } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const isHls = url.includes('.m3u8');
  const isAudio = url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.aac') || url.endsWith('.ogg');
  const itemType = isHls ? 'hls' : (isAudio ? 'audio' : 'video');

  const newStream = {
    id: 'stream-' + Date.now(),
    title: title || (isHls ? 'Network HLS Stream' : 'Network Stream: ' + url.slice(-30)),
    streamUrl: url,
    mimeType: isHls ? 'application/x-mpegURL' : (isAudio ? 'audio/mpeg' : 'video/mp4'),
    type: itemType,
    isStream: true,
    createdAt: new Date().toISOString()
  };

  mediaDb.unshift(newStream);
  saveMediaDb();
  res.json({ success: true, item: newStream });
});

// 8. CORS Network Proxy for remote streams/files that block browser CORS
app.get('/api/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url param');

  try {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VLC/3.0.20 LibVLC/3.0.20'
      }
    };

    if (req.headers.range) {
      options.headers['Range'] = req.headers.range;
    }

    const proxyReq = client.get(targetUrl, options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (key.toLowerCase() !== 'content-security-policy') {
          res.setHeader(key, value);
        }
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.status(502).send('Proxy error: ' + err.message);
    });
  } catch (err) {
    res.status(400).send('Invalid URL');
  }
});

// 9. Playlist Save & Export / Import (M3U format support!)
app.get('/api/playlists', (req, res) => {
  let playlists = [];
  if (fs.existsSync(PLAYLISTS_FILE)) {
    try {
      playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf-8'));
    } catch (e) {
      playlists = [];
    }
  }
  res.json(playlists);
});

app.post('/api/playlists', (req, res) => {
  const { name, items } = req.body;
  let playlists = [];
  if (fs.existsSync(PLAYLISTS_FILE)) {
    try { playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf-8')); } catch (e) {}
  }

  const newPlaylist = {
    id: 'pl-' + Date.now(),
    name: name || `Playlist ${new Date().toLocaleDateString()}`,
    items: items || [],
    createdAt: new Date().toISOString()
  };

  playlists.unshift(newPlaylist);
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
  res.json({ success: true, playlist: newPlaylist });
});

// Export Playlist as M3U
app.get('/api/playlists/:id/export.m3u', (req, res) => {
  let playlists = [];
  if (fs.existsSync(PLAYLISTS_FILE)) {
    try { playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf-8')); } catch (e) {}
  }
  const pl = playlists.find(p => p.id === req.params.id);
  if (!pl) return res.status(404).send('Playlist not found');

  let m3uContent = '#EXTM3U\n';
  for (const item of pl.items) {
    const duration = Math.round(item.duration || 0);
    m3uContent += `#EXTINF:${duration},${item.title || 'Unknown'}\n`;
    const url = item.streamUrl || `http://localhost:${PORT}/api/media/${item.id}/stream`;
    m3uContent += `${url}\n`;
  }

  res.setHeader('Content-Type', 'audio/x-mpegurl');
  res.setHeader('Content-Disposition', `attachment; filename="${pl.name.replace(/[^a-z0-9]/gi, '_')}.m3u"`);
  res.send(m3uContent);
});

// Serve static uploads and samples
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/sample', express.static(SAMPLE_DIR));

// Serve Client Production Build if available
const CLIENT_DIST = path.join(__dirname, '../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/sample')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Vidio Player Server] Running on http://localhost:${PORT}`);
});
