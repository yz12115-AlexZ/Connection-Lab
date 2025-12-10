//load environment variables from .env file
import 'dotenv/config';
import express from 'express';
import Replicate from 'replicate';
// Import http and Socket.IO to enable real-time communication
import { createServer } from 'http';
import { Server } from 'socket.io';
// Import lowdb to save all designs to a database file
import { JSONFilePreset } from 'lowdb/node';

// Create database file - it will store all our designs
// The database is a JSON file called db.json, with a "designs" array
const db = await JSONFilePreset('db.json', { designs: [] });
// Initialize Express app
const app = express();
app.use(express.static('public'));
app.use(express.json());
// Create HTTP server and bind Socket.IO to it
const httpServer = createServer(app);
const io = new Server(httpServer);
// My API key for Replicate - loaded from .env file
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const PORT = 3000;
// No design initially
let currentDesign = {
  prompt: 'No design',
  textureUrl: ''
};
//Track if a generation is in progress
let isGenerating = false;
//index.js calls this to get the current design
app.get('/api/current', (req, res) => {
  res.json(currentDesign); 
});
// index.js calls this to start a new generation
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
// If we're already generating, reject new requests
  if (isGenerating) {
    return res.status(429).json({ error: 'Generating... Please wait...' });
  }
  // If prompt is empty, send error response
  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Enter prompt' });
  }
 // Set isGenerating to true to block other requests
  isGenerating = true;
  // Try to generate the image - if something goes wrong, catch will handle it
  try {
    // Create a new Replicate client with our API key
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN
    });
// Settings for the AI model
    const input = {
      cfg: 4.5,
      prompt: prompt
    };
    // Run the AI model with our settings and get the image URL
    const output = await replicate.run("stability-ai/stable-diffusion-3.5-large", { input });
    // Create a new design object with unique id, prompt, image URL, and timestamp
    const newDesign = {
      id: Date.now(), 
      prompt: prompt,
      textureUrl: output,
      timestamp: Date.now() // Save when it was created
    };
    // Save the new design to database
    db.data.designs.push(newDesign);
    await db.write(); // Write to db.json file
    // Update the current design
    currentDesign = newDesign;
    // Send the new design to all connected clients (real-time sync)
    io.emit('newDesign', currentDesign);
    // Send the design back to the client as JSON
    res.json(currentDesign);
    // If there's an error during generation, catch it and send error response
  } finally {
    isGenerating = false;
  }
});
// index.js calls this to get all previous designs
app.get('/api/designs', (req, res) => {
 // Return all designs in reverse order (newest first)
  const allDesigns = db.data.designs.slice().reverse();
  res.json(allDesigns);
});
// When a client connects to Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');
}); 
httpServer.listen(PORT, () => {
  console.log('http://localhost:3000/');
});
