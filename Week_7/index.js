const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ foods: [] }).write();

app.use(express.json());
app.use(express.static('public'));

// Route 1 - Serve static HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route 2 - Store new data
app.post('/new-data', (req, res) => {
  const food = req.body;
  food.timestamp = Date.now();

  db.get('foods')
    .push(food)
    .write();

  res.json({ status: 'success', message: 'Food saved' });
});

// Route 3 - Serve stored data
app.get('/data', (req, res) => {
  const foods = db.get('foods').value();
  res.json(foods);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

