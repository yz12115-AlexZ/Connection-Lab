const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const fabricData = [
  { id: 1,  name: "Cotton Poplin",      composition: "100% Cotton",              usage: "Shirts, dresses" },
  { id: 2,  name: "Wool Twill",         composition: "100% Wool",                usage: "Suits, trousers" },
  { id: 3,  name: "Denim Stretch",      composition: "98% Cotton, 2% Spandex",   usage: "Jeans, jackets" },
  { id: 4,  name: "Silk Charmeuse",     composition: "100% Silk",                usage: "Blouses, evening wear" },
  { id: 5,  name: "Linen Blend",        composition: "60% Linen, 40% Cotton",    usage: "Summer shirts" },
  { id: 6,  name: "Polyester Satin",    composition: "100% Polyester",           usage: "Linings, dresses" },
  { id: 7,  name: "Nylon Ripstop",      composition: "100% Nylon",               usage: "Outerwear" },
  { id: 8,  name: "Viscose Jersey",     composition: "95% Viscose, 5% Elastane", usage: "T-shirts, dresses" },
  { id: 9,  name: "Cashmere Knit",      composition: "100% Cashmere",            usage: "Sweaters, scarves" },
  { id: 10, name: "Recycled Polyester", composition: "100% Recycled Polyester",  usage: "Activewear" }
];

app.use(express.static(path.join(__dirname, 'public')));
app.get('/data', (req, res) => {
  res.json({ fabrics: fabricData });
});
app.get('/data/id/:id', (req, res) => {
  const id = Number(req.params.id);
  const found = fabricData.find(item => item.id === id);
  if (!found) return res.status(404).json({ error: `No fabric with id=${id}` });
  res.json({ data: found });
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
