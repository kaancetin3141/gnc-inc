import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { LiveStatus } from "@/components/site/live-status";
import { Projects, type ProjectData } from "@/components/site/projects";
import { ServicesSection } from "@/components/site/services";
import { TechMarquee } from "@/components/site/tech-marquee";
import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { SiteFooter } from "@/components/site/site-footer";

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
        repoUrl: true,
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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <LiveStatus />
        <Projects projects={projects} />
        <TechMarquee />
        <ServicesSection />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
