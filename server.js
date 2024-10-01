/*
  Spotify Downloader
  Author: SazumiVicky
  Github: https://github.com/sazumivicky/spotify-dl
  Instagram: https://instagram.com/moe.sazumiviki
*/

import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dl', async (req, res) => {
  try {
    const spotifyUrl = req.query.url;
    if (!spotifyUrl) {
      return res.status(400).json({ error: 'URL parameter is missing' });
    }

    const trackId = extractTrackId(spotifyUrl);
    if (!trackId) {
      return res.status(400).json({ error: 'Invalid Spotify URL' });
    }

    const metadataUrl = `https://api.spotifydown.com/metadata/track/${trackId}`;
    const downloadUrl = `https://api.spotifydown.com/download/${trackId}`;
    
    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8,zh-TW;q=0.7,zh;q=0.6,ja;q=0.5',
      'Origin': 'https://spotifydown.com',
      'Referer': 'https://spotifydown.com/',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    };

    const [metadataResponse, downloadResponse] = await Promise.all([
      fetch(metadataUrl, { headers }),
      fetch(downloadUrl, { headers })
    ]);

    if (!metadataResponse.ok || !downloadResponse.ok) {
      throw new Error(`HTTP error! status: ${metadataResponse.status} or ${downloadResponse.status}`);
    }

    const [metadata, downloadData] = await Promise.all([
      metadataResponse.json(),
      downloadResponse.json()
    ]);

    const fileName = `${metadata.artists} - ${metadata.title}.mp3`;
    res.json({
      metadata: metadata,
      downloadLink: `/download?url=${encodeURIComponent(downloadData.link)}`,
      fileName: fileName
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Upps something went wrong' });
  }
});

app.get('/download', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is missing' });
    }

    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8,zh-TW;q=0.7,zh;q=0.6,ja;q=0.5',
      'Origin': 'https://spotifydown.com',
      'Referer': 'https://spotifydown.com/',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    }

    response.body.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Upps something went wrong' });
  }
});

function extractTrackId(url) {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

app.use((req, res) => {
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});