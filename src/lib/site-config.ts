// GNC Inc — sistem haritası ve yardımcılar

export type SystemService = {
  id: string;
  name: string;
  port: number;
  desc: string;
  kind: "web" | "game" | "mobile";
  prodDomain: string;
  /** Sağlık kontrolü ucunun yolu — Next servislerde ana sayfa derlemesini tetiklememek için hafif uç kullanılır */
  healthPath: string;
};

/** 8 canlı sistem — sıralı port haritası (3000-3007) */
export const SERVICES: SystemService[] = [
  { id: "gnc-inc", name: "GNC Inc", port: 3000, desc: "Kurumsal web platformu", kind: "web", prodDomain: "www.gncinc.online", healthPath: "/" },
  { id: "gnc-erp", name: "GNC ERP & CRM", port: 3001, desc: "Çok modüllü işletme süperapp'i", kind: "web", prodDomain: "crm.gncinc.online", healthPath: "/api/health" },
  { id: "randevu", name: "Randevu", port: 3002, desc: "Müşteri randevu platformu", kind: "web", prodDomain: "randevu.gncinc.online", healthPath: "/healthz" },
  { id: "kaloriai", name: "KaloriAI", port: 3003, desc: "AI beslenme asistanı", kind: "web", prodDomain: "kaloriai.gncinc.online", healthPath: "/api/health" },
  { id: "fruitstorm", name: "Fruit Storm!", port: 3004, desc: "Match-3 bulut oyun", kind: "game", prodDomain: "fruitstorm.gncinc.online", healthPath: "/api/health" },
  { id: "cubiq", name: "Cubiq", port: 3005, desc: "Premium blok bulmaca", kind: "game", prodDomain: "cubiq.gncinc.online", healthPath: "/api/health" },
  { id: "petguardian", name: "PetGuardian", port: 3006, desc: "Evcil hayvan platformu", kind: "mobile", prodDomain: "petguardian.gncinc.online", healthPath: "/" },
  { id: "gridpop", name: "GridPop", port: 3007, desc: "Blok yerleştirme oyunu", kind: "game", prodDomain: "gridpop.gncinc.online", healthPath: "/" },
];

export const SITE = {
  name: "GNC Inc",
  legal: "GNC Yazılım ve Dijital Ürünler",
  domain: "gncinc.online",
  email: "info@gncinc.online",
  github: "https://github.com/kaancetin3141",
  founder: "Kaan Çetin",
  year: new Date().getFullYear(),
};

/**
 * Bir servisin canlı linkini üretir.
 * Sandbox/preview ortamında gateway üzerinden ?XTransformPort={port} ile,
 * üretimde alt alan adıyla (https://{sub}.gncinc.online) erişilir.
 */
export function serviceUrl(s: { port: number; prodDomain: string }): string {
  const mode = process.env.NEXT_PUBLIC_SERVICES_MODE ?? "sandbox";
  if (mode === "production") return `https://${s.prodDomain}`;
  return `/?XTransformPort=${s.port}`;
}
