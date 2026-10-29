// GNC Inc — mobil ürün landing şablonu (Bun.serve, sıfır bağımlılık)
// mini-landing/*.ts dosyaları bun --hot ile :3006/:3007 portlarını servisler.

export type LandingData = {
  port: number;
  name: string;
  tagline: string;
  kind: string; // "Mobil Uygulama" | "Oyun"
  platforms: string[];
  desc: string[];
  features: { title: string; desc: string }[];
  accent: string; // oklch vurgu rengi
};

export function renderLanding(d: LandingData): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${d.name} — GNC Inc</title>
<meta name="description" content="${d.tagline} — ${d.name}, GNC Inc çatısı altında." />
<style>
  :root { --ink:#0b1210; --ink2:#101a17; --txt:#f7faf9; --mut:#a9bdb7; --acc:${d.accent}; --line:rgba(255,255,255,.1); }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--ink); color:var(--txt); font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif; line-height:1.6; }
  a { color:inherit; text-decoration:none; }
  .wrap { max-width:1080px; margin:0 auto; padding:0 24px; }
  header { position:sticky; top:0; z-index:10; backdrop-filter:blur(10px); background:rgba(11,18,16,.85); border-bottom:1px solid var(--line); }
  .hrow { display:flex; align-items:center; justify-content:space-between; height:64px; }
  .logo { display:flex; align-items:center; gap:10px; font-weight:600; }
  .logo .mark { width:36px; height:36px; border-radius:10px; background:var(--acc); color:var(--ink); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; letter-spacing:-.5px; }
  .logo small { display:block; font-size:9px; color:var(--mut); letter-spacing:.12em; font-weight:500; }
  .home { font-size:14px; color:var(--mut); }
  .home:hover { color:var(--txt); }
  .hero { padding:96px 0 72px; text-align:center; position:relative; overflow:hidden; }
  .hero::before { content:""; position:absolute; inset:-40% -20% auto; height:140%; background:radial-gradient(closest-side, ${d.accent}22, transparent); pointer-events:none; }
  .kind { display:inline-block; font-size:12px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--acc); }
  h1 { font-size:clamp(40px,7vw,72px); font-weight:800; letter-spacing:-.03em; line-height:1.05; margin:18px 0 14px; }
  .tag { font-size:clamp(17px,2.4vw,21px); color:var(--mut); max-width:640px; margin:0 auto; }
  .stores { margin-top:36px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .store { display:inline-flex; align-items:center; gap:8px; border:1px solid var(--line); border-radius:999px; padding:12px 22px; font-size:14px; font-weight:600; color:var(--mut); }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:20px; overflow:hidden; margin:64px 0; }
  .cell { background:var(--ink2); padding:28px; }
  .cell h3 { font-size:15px; margin-bottom:8px; }
  .cell p { font-size:14px; color:var(--mut); }
  section.about { padding:24px 0 72px; }
  .about p { color:var(--mut); max-width:720px; margin:0 auto 16px; text-align:center; font-size:16px; }
  footer { border-top:1px solid var(--line); padding:36px 0; text-align:center; color:var(--mut); font-size:13px; }
  footer b { color:var(--txt); font-weight:600; }
  @media (max-width:640px){ .hero{padding:64px 0 48px;} }
</style>
</head>
<body>
<header>
  <div class="wrap hrow">
    <a class="logo" href="https://www.gncinc.online" rel="noreferrer">
      <span class="mark">gnc</span>
      <span>GNC Inc<small>YAZILIM & DİJİTAL ÜRÜNLER</small></span>
    </a>
    <a class="home" href="https://www.gncinc.online" rel="noreferrer">gncinc.online →</a>
  </div>
</header>
<main>
  <div class="hero wrap">
    <span class="kind">${d.kind}</span>
    <h1>${d.name}</h1>
    <p class="tag">${d.tagline}</p>
    <div class="stores">
      ${d.platforms.map((p) => `<span class="store">${p}</span>`).join("\n      ")}
    </div>
  </div>
  <div class="wrap">
    <div class="grid">
      ${d.features.map((f) => `<div class="cell"><h3>${f.title}</h3><p>${f.desc}</p></div>`).join("\n      ")}
    </div>
    <section class="about">
      ${d.desc.map((p) => `<p>${p}</p>`).join("\n      ")}
      <p style="margin-top:28px"><a href="https://www.gncinc.online" rel="noreferrer" style="color:var(--acc);font-weight:600">GNC Inc ekosistemini keşfedin →</a></p>
    </section>
  </div>
</main>
<footer>
  <div class="wrap">© ${year} <b>GNC Yazılım ve Dijital Ürünler</b> · ${d.name}, GNC Inc çatısı altında geliştirilir.</div>
</footer>
</body>
</html>`;
}

export function serveLanding(d: LandingData) {
  const html = renderLanding(d);
  Bun.serve({
    port: d.port,
    async fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/healthz" || url.pathname === "/api/health") {
        return new Response(JSON.stringify({ ok: true, service: d.name }), {
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    },
  });
  console.log(`[${d.name}] landing sayfası :${d.port} portunda`);
}
