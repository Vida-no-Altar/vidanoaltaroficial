import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage } from "@/components/editorial-page";
import { createHead, siteMeta } from "@/lib/vna-content";
import matheusImage from "@/assets/matheus-sobre-vna.webp";

export const Route = createFileRoute("/sobre")({ head: () => createHead(siteMeta.about), component: AboutPage });

function AboutPage() {
  return (
    <EditorialPage eyebrow="Nossa essência" title="Sobre o Vida no Altar" intro="O Vida no Altar nasceu para ajudar uma geração a viver uma fé cristã real, bíblica e prática.">
      <section className="site-container py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <img
              src={matheusImage}
              alt="Matheus, criador do Vida no Altar, segurando uma Bíblia"
              loading="lazy"
              className="aspect-[4/5] w-full border border-border object-cover"
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow">Criador</p>
            <h2 className="mt-5 font-display text-4xl">Uma missão antes de uma plataforma.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Por trás do projeto está Matheus, criador do Vida no Altar, estudante de teologia e produtor de conteúdo cristão, com o desejo de comunicar a Palavra de Deus com simplicidade, profundidade e excelência.
            </p>
            <blockquote className="my-12 border-l border-primary pl-7 font-display text-4xl leading-tight">“Não é sobre aparência. É sobre presença.”</blockquote>
            <p className="text-lg leading-8">O objetivo é simples: apontar pessoas para uma vida com Deus no centro.</p>
          </div>
        </div>
      </section>
    </EditorialPage>
  );
}
