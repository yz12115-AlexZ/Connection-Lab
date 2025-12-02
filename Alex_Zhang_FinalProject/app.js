import express from 'express';
import Replicate from 'replicate';
const app = express();
app.use(express.static('public'));
app.use(express.json());
// My API key for Replicate - replace with my own key
const REPLICATE_API_TOKEN = 'r8_PDvvFFUBSHnQfcjuqV3HnsRYMwRvBog0Ga77U';
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
// If already generating, send error response
  if (isGenerating) {
    return res.status(429).json({ error: 'Generating... Please wait...' });
  }
  // If prompt is empty, send error response
  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Enter prompt' });
  }

  // Set flag to true - we're starting to generate now
  isGenerating = true;

  // Try to generate the image - if something goes wrong, catch will handle it
  try {
    // Create a new Replicate client with our API key
    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN
    });
    
    const model = "stability-ai/stable-diffusion-3.5-large";

    // Run the AI model with our settings and get the image URL
    const output = await replicate.run(model, {
    // AI generation parameters for make the texture more like pattern
    input: {
    prompt: prompt,
    cfg: 7,
    aspect_ratio: "1:1",
    output_format: "webp",
    tile: true,
    sharpness: 0.8,
    negative_prompt: "face, human, person, text, letters, watermark, logo, illustration"
  }
      
    });
    console.log("=== OUTPUT FROM REPLICATE ===");
console.log(output);
    const url = output;
    // Update the current design with new prompt and image URL
    currentDesign = {
      prompt: prompt,
      textureUrl: url 
    };
    // Send the design back to the client as JSON
    res.json(currentDesign);
//
  } finally {
    isGenerating = false;
  }
});
app.listen(PORT, () => {
  console.log('http://localhost:3000/');
});
