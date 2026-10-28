// GNC Inc — web sitesi görsellerini üretir (z-ai-web-dev-sdk, backend)
// Kullanım: cd /home/z/my-project && bun run generate-images
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "public", "images");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const STYLE =
  "dark premium tech illustration, emerald green and teal glowing gradients on near-black background, subtle fine grid texture, soft cinematic light, minimal elegant composition, high quality, detailed, professional, no text, no letters";

const JOBS: Array<{ file: string; prompt: string; size: string }> = [
  {
    file: "hero.png",
    size: "1440x720",
    prompt: `Abstract digital landscape of flowing emerald data streams and soft geometric waves rising from a dark valley, glowing green horizon line, wide banner composition, ${STYLE}`,
  },
  {
    file: "proj-erp.png",
    size: "1344x768",
    prompt: `Elegant abstract ERP dashboard concept: floating translucent glass panels with charts, kanban cards and invoice shapes arranged in 3D perspective, emerald accent lines connecting modules, ${STYLE}`,
  },
  {
    file: "proj-randevu.png",
    size: "1344x768",
    prompt: `Minimal concept of a smart appointment calendar: floating date cards with clock hands and checkmarks, booking slot grid glowing softly, emerald highlights, ${STYLE}`,
  },
  {
    file: "proj-kaloriai.png",
    size: "1344x768",
    prompt: `A fresh healthy turkish meal bowl on a dark pedestal with a scanning interface ring around it, calorie energy particles glowing emerald, AI food recognition concept, ${STYLE}`,
  },
  {
    file: "proj-fruitstorm.png",
    size: "1344x768",
    prompt: `Explosion of juicy colorful fruits (cherries, lemons, watermelon slices, grapes) bursting in match-3 puzzle grid formation, glossy game art, dynamic splash, emerald green backdrop, ${STYLE}`,
  },
  {
    file: "proj-cubiq.png",
    size: "1344x768",
    prompt: `Minimal 3D glossy cubes and blocks stacking on a dark reflective floor, one glowing emerald cube floating above, premium puzzle game aesthetic, soft studio lighting, ${STYLE}`,
  },
  {
    file: "proj-petguardian.png",
    size: "1344x768",
    prompt: `Warm silhouette of a person walking a happy dog on a hill at night under emerald glowing stars and a soft green aurora, pet care platform concept, ${STYLE}`,
  },
  {
    file: "proj-gridpop.png",
    size: "1344x768",
    prompt: `Abstract puzzle grid of glowing emerald and lime tiles popping out of a dark game board, tetromino-like shapes with soft neon edges, satisfying minimal game art, ${STYLE}`,
  },
  {
    file: "about-workspace.png",
    size: "1344x768",
    prompt: `Modern minimal developer workspace at night: ultrawide monitor with glowing code, mechanical keyboard, a small plant, coffee cup, dark desk with emerald ambient lighting, ${STYLE}`,
  },
];

async function main() {
  const log = (m: string) => {
    const line = `[${new Date().toISOString()}] ${m}`;
    console.log(line);
    fs.appendFileSync(path.join(OUT, "gen.log"), line + "\n");
  };

  const zai = await ZAI.create();
  log(`Görsel üretimi başlıyor: ${JOBS.length} adet`);

  let done = 0;
  for (const job of JOBS) {
    const outPath = path.join(OUT, job.file);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 30000) {
      log(`SKIP (mevcut): ${job.file}`);
      done++;
      continue;
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        log(`Üretiliyor (${attempt}/3): ${job.file}`);
        const res = await zai.images.generations.create({
          prompt: job.prompt,
          size: job.size as never,
        });
        const b64 = res?.data?.[0]?.base64;
        if (!b64) throw new Error("boş yanıt");
        fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
        const kb = Math.round(fs.statSync(outPath).size / 1024);
        log(`OK: ${job.file} (${kb} KB)`);
        done++;
        break;
      } catch (e) {
        log(`HATA ${job.file} deneme ${attempt}: ${(e as Error).message}`);
        if (attempt === 3) log(`BAŞARISIZ: ${job.file}`);
        else await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }
  log(`Bitti: ${done}/${JOBS.length} görsel hazır`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
