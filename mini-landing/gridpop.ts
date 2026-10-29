// GridPop landing — :3007 (Flutter oyununun web vitrini)
import { serveLanding } from "./landing";

serveLanding({
  port: 3007,
  name: "GridPop",
  tagline: "Özgün mekanikli blok yerleştirme bulmacası — klasik, zamana karşı ve günlük görev modları.",
  kind: "Oyun",
  platforms: ["Android", "iOS"],
  desc: [
    "GridPop, alıştığınız blok bulmacalara özgün mekanikler katar: her hamleniz ekonomiyi besler, başarımlar yeni temalar açar.",
    "Flutter ile geliştirildi; akıcı animasyonlar ve günlük görev döngüsüyle her gün geri dönmeniz için tasarlandı.",
  ],
  features: [
    { title: "3 oyun modu", desc: "Klasik, zamana karşı ve günlük görev — her modda ayrı liderlik." },
    { title: "Coin ekonomisi", desc: "Kazandığın coinlerle tema ve güçlendirici aç." },
    { title: "Başarımlar", desc: "50+ başarım; koleksiyonunu tamamla, ödülünü kap." },
    { title: "Kesintisiz ilerleme", desc: "Bulut kayıtla cihazlar arası geçiş saniyeler sürer." },
  ],
  accent: "oklch(0.75 0.12 150)",
});
