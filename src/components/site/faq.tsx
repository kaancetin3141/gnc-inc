"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircleQuestion } from "lucide-react";
import { Reveal } from "./reveal";
import { SITE } from "@/lib/site-config";

const FAQS = [
  {
    q: "GNC Inc tam olarak ne yapıyor?",
    a: "Kendi dijital ürünlerimizi geliştiriyor ve hepsini kendi sunucumuzda yaşatıyoruz: ERP/CRM, randevu platformu, AI destekli beslenme asistanı, iki bulut oyunu ve iki mobil uygulama. Bunların yanında dışarıdan özel yazılım ve danışmanlık projeleri de üstleniyoruz — ihtiyacınız ne ise aynı disiplinle yaklaşıyoruz.",
  },
  {
    q: "Ürünlerinizi kendi sunucunuzda mı barındırıyorsunuz?",
    a: "Evet. Tüm web servislerimiz tek bir sunucu üzerinde, her biri kendi PostgreSQL 17 veritabanıyla ayrık çalışacak şekilde kurgulandı. Bu yaklaşım veri izolasyonunu, yedeklemeyi ve olası bir sorunun diğer sistemleri etkilememesini garanti ediyor.",
  },
  {
    q: "Özel yazılım projesi için nasıl teklif alabilirim?",
    a: `Aşağıdaki iletişim formundan veya ${SITE.email} adresinden bize ulaşmanız yeterli. Mesajınız doğrudan veritabanımıza düşüyor; mesai saatlerinde ortalama 2 saat içinde dönüş yapıyoruz. Kapsam netleşene kadar keşif görüşmesi ücretsizdir.`,
  },
  {
    q: "GNC ERP & CRM'yi kendi işletmemde kullanabilir miyim?",
    a: "Evet. ERP'miz KOBİ'ler, kafeler ve marketler için Türkçe ve çok kiracılı olarak tasarlandı. Müşteri yönetimi, stok-faturalama, masa/menü sipariş, POS, randevu ve İK modülleri tek panelde. Kurumunuza özel kurulum ve veri taşıma desteği veriyoruz.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Veri sorumluluğunu ciddiye alıyoruz: her sistem ayrık veritabanında yaşar, iletişim ve bülten kayıtları KVKK kapsamında işlenir, yedekler düzenli olarak alınır. Üçüncü taraf reklam takipçisi kullanmıyoruz.",
  },
  {
    q: "Ürünler ücretli mi?",
    a: "Oyunlarımız (Fruit Storm!, Cubiq, GridPop) ücretsizdir. Kurumsal ürünlerimiz (ERP/CRM, Randevu, KaloriAI) kullanım planına göre fiyatlanır; özel proje teklifleri ise kapsam toplantısından sonra kalemlere ayrılmış olarak sunulur.",
  },
];

/** Meta.com destek dili: ortalanmış başlık + tek kolonlu, ayraç çizgili akordeon */
export function Faq() {
  return (
    <section id="sss" className="scroll-mt-20 bg-muted/40 py-16 sm:py-24">
      <div className="section-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <MessageCircleQuestion className="size-3.5" aria-hidden="true" />
            S.S.S.
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Merak edilenler
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Ürünlerimiz, çalışma modelimiz ve veri yaklaşımımız hakkında en sık
            sorulan sorular — cevabını bulamazsanız bize yazın.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-10 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-border/70"
              >
                <AccordionTrigger className="text-left text-[15px] font-semibold tracking-tight hover:no-underline hover:text-primary sm:text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
