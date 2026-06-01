const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DIR = __dirname;
const ARK_API_KEY = "8d0459d3-6d82-4ce4-aa07-741ff5369ca2";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

function handleInterpret(req, res) {
  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {
    let hexData;
    try { hexData = JSON.parse(body); } catch {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    const prompt = buildImagePrompt(hexData);
    const payload = JSON.stringify({
      model: "doubao-seedream-4-0-250828",
      prompt,
      sequential_image_generation: "disabled",
      response_format: "url",
      size: "2K",
      stream: false,
      watermark: true
    });

    const options = {
      hostname: "ark.cn-beijing.volces.com",
      path: "/api/v3/images/generations",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ARK_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    console.log("[interpret] 发送图片生成请求，prompt:", prompt.slice(0, 80));

    const apiReq = https.request(options, apiRes => {
      console.log("[interpret] 收到响应，状态码:", apiRes.statusCode);
      let data = "";
      apiRes.on("data", chunk => { data += chunk; });
      apiRes.on("end", () => {
        console.log("[interpret] 响应:", data.slice(0, 300));
        try {
          const json = JSON.parse(data);
          const url = json?.data?.[0]?.url;
          if (!url) throw new Error("no url in response: " + data.slice(0, 200));
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ imageUrl: url }));
        } catch (e) {
          console.error("[interpret] 解析失败:", e.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    });

    apiReq.on("error", err => {
      console.error("[interpret] 请求错误:", err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    });

    apiReq.write(payload);
    apiReq.end();
  });
}
function buildImagePrompt(h) {
  const sceneMap = {
    "天": "a vast golden sky with drifting clouds and soft sunlight",
    "地": "quiet earth, warm soil, fields, roots, and a peaceful valley",
    "雷": "distant storm clouds, soft lightning, dark blue atmosphere, dramatic air",
    "山": "ancient mountains, mossy rocks, old pine trees, quiet cliffs",
    "水": "misty river, flowing water, deep reflections, gentle fog",
    "火": "warm lantern glow, small flame, sunrise light, red-orange atmosphere",
    "泽": "quiet lake, marsh reeds, soft ripples, reflective water surface",
    "风": "moving wind, flowing clouds, flying leaves, bending grass"
  };

  const explanationMap = {
    "乾为天": "Move forward with confidence, but keep your direction clear and purposeful.",
    "坤为地": "Stay patient and supportive; steady growth comes through openness and care.",
    "水雷屯": "The beginning may feel difficult, but pressure is creating new growth.",
    "山水蒙": "Do not rush your answer; learning will slowly clear the confusion.",
    "水天需": "Wait for the right timing, and prepare yourself before taking action.",
    "天水讼": "Conflict may appear; speak clearly and avoid forcing your position.",
    "地水师": "Use structure, discipline, and planning to move through the problem.",
    "水地比": "Build trust with supportive people instead of facing everything alone.",
    "风天小畜": "Hold back for now; careful preparation will create future strength.",
    "天泽履": "Move carefully and respectfully; small mistakes may affect the outcome.",
    "地天泰": "Things are opening up; balance and communication can bring harmony.",
    "天地否": "The situation feels blocked; wait, observe, and avoid pushing too hard.",
    "天火同人": "Find people who share your goal, and move forward through cooperation.",
    "火天大有": "You have strong potential now; use your resources wisely and generously.",
    "地山谦": "Stay humble and grounded; quiet strength will help you more than pride.",
    "雷地豫": "Good energy is rising, but keep your rhythm and avoid overexcitement.",
    "泽雷随": "Follow the situation naturally, and adjust your pace with awareness.",
    "山风蛊": "Fix the old problem first; renewal begins after clearing what is stuck.",
    "地泽临": "Approach slowly and sincerely; care and attention will build trust.",
    "风地观": "Observe the whole situation first, then decide the right next step.",
    "火雷噬嗑": "Remove the obstacle directly; clarity and action are needed now.",
    "山火贲": "Beauty can help expression, but truth should remain at the center.",
    "山地剥": "Something old is falling away; accept the change and protect what matters.",
    "地雷复": "A new beginning is returning quietly; give it time to grow.",
    "天雷无妄": "Act with sincerity and honesty; do not force an unnatural result.",
    "山天大畜": "Save your energy and resources; strength grows through patience and restraint.",
    "山雷颐": "Pay attention to what you say, consume, and emotionally feed yourself.",
    "泽风大过": "The pressure is too heavy; rebalance the situation before it breaks.",
    "坎为水": "Move carefully through uncertainty; patience will guide you through danger.",
    "离为火": "See the truth clearly before acting; awareness brings the right direction.",
    "泽山咸": "There is attraction and feeling; respond gently instead of rushing.",
    "雷风恒": "Stay consistent and steady; lasting progress comes from repeated care.",
    "天山遁": "Step back for now; distance can protect what still needs time.",
    "雷天大壮": "You have strong energy, but strength must be guided by restraint.",
    "火地晋": "Progress is possible now; keep moving steadily and stay visible.",
    "地火明夷": "Protect your inner light; this is not the time to expose everything.",
    "风火家人": "Focus on care, order, and emotional warmth in close relationships.",
    "火泽睽": "Differences are clear now; understanding both sides can reduce conflict.",
    "水山蹇": "The path is blocked; slow down and find a wiser route.",
    "雷水解": "Tension can be released soon; let the situation loosen naturally.",
    "山泽损": "Let go of something small to protect something more meaningful.",
    "风雷益": "This is a time for improvement; generous action can create growth.",
    "泽天夬": "Make a clear decision; cut through confusion with honesty and courage.",
    "天风姤": "A sudden encounter may bring opportunity, but also hidden risk.",
    "泽地萃": "Gather support, people, and resources; connection gives the situation strength.",
    "地风升": "Rise slowly through steady effort; progress comes step by step.",
    "泽水困": "You may feel trapped, but patience will reveal hidden strength.",
    "水风井": "Return to the source; rebuild the foundation that supports everyone.",
    "泽火革": "Change is necessary now; the old way no longer fits.",
    "火风鼎": "Refine the situation with care; transformation comes through better structure.",
    "震为雷": "A sudden change may wake things up and push action forward.",
    "艮为山": "Stop for now; stillness will protect your energy and clarity.",
    "风山渐": "Progress will come slowly; trust the process and take careful steps.",
    "雷泽归妹": "Desire is strong, but timing and balance need more attention.",
    "雷火丰": "This is a bright moment; use it well before it fades.",
    "火山旅": "You are in unfamiliar territory; stay alert and carry your light carefully.",
    "巽为风": "Use gentle influence instead of force; small movements can change much.",
    "兑为泽": "Joy and honest communication can soften the situation and open connection.",
    "风水涣": "Let old tension dissolve; release what no longer needs to stay.",
    "水泽节": "Set healthy limits; boundaries can create rhythm and sustainable freedom.",
    "风泽中孚": "Trust your inner truth, and speak with sincerity instead of performance.",
    "雷山小过": "Take small careful steps; avoid big risks and dramatic moves.",
    "水火既济": "Things are nearly complete; protect the balance with careful attention.",
    "火水未济": "The situation is not finished yet; keep adjusting before completion."
  };

  const specialSceneMap = {
    "山风蛊": "an ancient mountain shrine in the wind, old mossy wood, broken pottery, decayed tree roots, fresh green sprouts growing from old wood, quiet mysterious atmosphere, beautiful symbolic renewal",
    "泽雷随": "a quiet lake with reeds, distant thunder in the clouds, ripples spreading across the water, birds following the wind, calm movement and gentle rhythm",
    "雷天大壮": "a dramatic golden sky with powerful thunderclouds, restrained lightning, strong upward energy, majestic but balanced atmosphere",
    "火山旅": "a lonely mountain road at dusk, a small warm lantern, cold rocks, wind, poetic travel atmosphere",
    "风火家人": "a warm wooden house with lantern light, wind moving bamboo leaves outside, peaceful family atmosphere",
    "坎为水": "a deep misty river under moonlight, quiet danger, soft reflections, elegant flowing water",
    "离为火": "warm lanterns and sunrise light, glowing flame, clear bright atmosphere, delicate red-orange tones",
    "艮为山": "a still mountain with mossy stones and silent pine trees, calm meditative atmosphere",
    "巽为风": "soft wind moving through bamboo, floating leaves, pale clouds, gentle invisible movement",
    "兑为泽": "a peaceful lake with reeds, warm reflections, soft ripples, quiet joy"
  };

  const upper = h.upper.nature;
  const lower = h.lower.nature;

  const upperScene = sceneMap[upper] || "poetic natural scenery";
  const lowerScene = sceneMap[lower] || "beautiful symbolic landscape";

  const explanation =
    explanationMap[h.hex.name] ||
    "Pay attention to the situation and move carefully.";

  const mainScene =
    specialSceneMap[h.hex.name] ||
    `${upperScene} blending with ${lowerScene}, forming a poetic and elegant natural landscape`;

  return `
High-end Japanese ema wooden plaque illustration, horizontal wooden prayer tablet, aged warm wood grain, hand-painted ink and watercolor, refined Japanese shrine aesthetic, elegant composition, museum-quality illustration.

The image should be beautiful first, like an art print on an old wooden ema plaque.

Main visual scene:
${mainScene}.

Composition:
A large poetic natural landscape fills most of the wooden plaque.
The Chinese title is placed at the top center.
The English sentence is placed below the title, small and clean.
The rest of the image should focus on atmosphere, nature, texture, and beauty.

Text:
Top center Chinese brush calligraphy: "${h.hex.name}"
Below it, one clear English sentence in small readable serif text: "${explanation}"

Style:
soft ink wash, delicate watercolor, warm wood tone, subtle vermilion red, soft gold details, Japanese traditional patterns in the corners, cloud patterns, wave patterns, shrine rope ornament, small red seal, elegant negative space, calm spiritual feeling, handcrafted texture, refined and poetic.

Important:
No line symbols.
No broken horizontal symbols.
No black symbolic diagrams.
No divination icons.
No modern UI.
No game card style.
No cartoon style.
No plastic texture.
No messy typography.
Only two text elements: "${h.hex.name}" and "${explanation}".
`.trim();
}

http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/interpret") {
    handleInterpret(req, res);
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/download?")) {
    const rawUrl = new URL("http://localhost" + req.url).searchParams.get("url");
    if (!rawUrl) {
      res.writeHead(400);
      res.end("Missing url param");
      return;
    }
    try {
      const target = new URL(rawUrl);
      const proto = target.protocol === "https:" ? https : http;
      proto.get(rawUrl, imgRes => {
        const ct = imgRes.headers["content-type"] || "image/png";
        res.writeHead(200, {
          "Content-Type": ct,
          "Content-Disposition": 'attachment; filename="hexagram.png"',
          "Cache-Control": "no-store"
        });
        imgRes.pipe(res);
      }).on("error", err => {
        res.writeHead(502);
        res.end("Proxy error: " + err.message);
      });
    } catch (e) {
      res.writeHead(400);
      res.end("Invalid url");
    }
    return;
  }

  let filePath = path.join(DIR, req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime[ext] || "text/plain" });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
