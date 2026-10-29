import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { QuickLinks } from "@/components/site/quick-links";
import { LiveStatus } from "@/components/site/live-status";
import { Projects, type ProjectData } from "@/components/site/projects";
import { ServicesSection } from "@/components/site/services";
import { Process } from "@/components/site/process";
import { TechMarquee } from "@/components/site/tech-marquee";
import { About } from "@/components/site/about";
import { News } from "@/components/site/news";
import { Faq } from "@/components/site/faq";
import { Contact } from "@/components/site/contact";
import { SiteFooter } from "@/components/site/site-footer";
import { BackToTop } from "@/components/site/back-to-top";

export const dynamic = "force-dynamic";

async function getProjects(): Promise<ProjectData[]> {
  try {
    const rows = await db.portfolioProject.findMany({
      orderBy: [{ sortOrder: "asc" }],
      select: {
        slug: true,
        name: true,
        tagline: true,
        description: true,
        category: true,
        port: true,
        prodDomain: true,
        techStack: true,
        image: true,
        status: true,
        featured: true,
      },
    });
    return rows;
  } catch {
    // Veritabanı erişilemezse site yine de render olsun (durum bölümü canlıdır)
    return [];
  }
}

export default async function Home() {
  const projects = await getProjects();

  /*
   * Meta.com akışı: sticky header → tam ekran koyu hero → ürün hızlı-linkleri →
   * dönüşümlü ürün vitrinleri → canlı durum → hizmetler → çalışma süreci →
   * teknoloji şeridi → şirket → haber kartları → S.S.S. → koyu iletişim →
   * bülten + çok kolonlu footer.
   */
  return (
    <div className="flex min-h-screen flex-col">
      {/* SEO — Organization + WebSite yapısal verisi */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "GNC Inc",
            legalName: "GNC Yazılım ve Dijital Ürünler",
            url: "https://www.gncinc.online",
            email: "info@gncinc.online",
            founder: { "@type": "Person", name: "Kaan Çetin" },
            address: {
              "@type": "PostalAddress",
              addressLocality: "İstanbul",
              addressCountry: "TR",
            },
            sameAs: ["https://www.gncinc.online"],
          }),
        }}
      />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <QuickLinks />
        <Projects projects={projects} />
        <LiveStatus />
        <ServicesSection />
        <Process />
        <TechMarquee />
        <About />
        <News />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
