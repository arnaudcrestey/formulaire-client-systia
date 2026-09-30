import Image from "next/image";
import { PointDeDepartForm } from "@/components/point-de-depart-form";

export default function PointDeDepartPage() {
  return (
    <main>
      <a className="skip-link" href="#parcours">Aller au parcours</a>
      <header className="site-header">
        <a href="https://www.arnaudcrestey.com/" aria-label="Arnaud Crestey, accueil">
          <Image src="/brand/ac.png" alt="AC, Arnaud Crestey" width={1200} height={630} className="header-logo" priority />
        </a>
        <span>COMPRENDRE AVANT D’AGIR</span>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">APRÈS NOTRE RENCONTRE</p>
          <h1>Imaginons votre <em>futur site</em></h1>
          <p className="hero-copy">Ce parcours vous aide à poser vos idées avec vos mots. Il n’y a pas de réponse technique à connaître, ni de choix définitif à faire aujourd’hui.</p>
          <div className="hero-line" />
          <p className="hero-note">Votre activité. Vos visiteurs. L’univers qui vous ressemble.</p>
        </div>
        <div className="hero-signature" aria-hidden="true">
          <Image src="/brand/signature-ac.png" alt="" width={2000} height={2000} priority />
        </div>
      </section>

      <div id="parcours" className="parcours-shell">
        <PointDeDepartForm />
      </div>
      <footer className="site-footer">
        <span>AC · Arnaud Crestey</span>
        <a href="/confidentialite">Confidentialité</a>
        <span>Un site utile aujourd’hui, conçu pour évoluer demain.</span>
      </footer>
    </main>
  );
}
