// PetGuardian landing — :3006 (Flutter uygulamasının web vitrini)
import { serveLanding } from "./landing";

serveLanding({
  port: 3006,
  name: "PetGuardian",
  tagline: "Evcil dostlar için eksiksiz platform — sahiplenme, bakım ve mağaza tek uygulamada.",
  kind: "Mobil Uygulama",
  platforms: ["Android", "iOS", "Web"],
  desc: [
    "PetGuardian, evcil hayvan sahiplenmeyi harita üzerinden keşfetmenizi, bakıcı ağına ulaşmanızı ve tüm bakım ihtiyaçlarınızı tek yerden yönetmenizi sağlar.",
    "Flutter ile tek kod tabanından üç platforma derlenir; Firebase altyapısı sayesinde ilanlar, mesajlar ve bildirimler gerçek zamanlıdır.",
  ],
  features: [
    { title: "Haritalı sahiplenme", desc: "Konumunuza en yakın sahiplendirme ilanlarını harita üzerinde keşfedin." },
    { title: "Bakıcı ağı", desc: "Seyahat halindeyken dostunuz için güvenilir bakıcı bulun." },
    { title: "Bakım takvimi", desc: "Aşı, veteriner ve beslenme hatırlatıcıları — hiçbir şey unutulmaz." },
    { title: "Mağaza & kiralama", desc: "Aksesuar ve ekipman ihtiyaçları uygulamada, tek hesapla." },
  ],
  accent: "oklch(0.72 0.14 168)",
});
