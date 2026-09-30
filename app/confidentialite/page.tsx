import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confidentialité | Arnaud Crestey", robots: { index: false, follow: false } };

export default function ConfidentialitePage() {
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-12 text-[#19231e]">
    <article className="mx-auto max-w-3xl">
      <a href="/point-de-depart" className="text-sm text-[#806438] underline">Retour au parcours</a>
      <p className="eyebrow mt-12">AC · ARNAUD CRESTEY</p>
      <h1 className="font-[Instrument_AC,Georgia,serif] text-5xl font-normal">Vos données dans ce parcours</h1>
      <div className="mt-10 space-y-6 text-[15px] leading-8">
        <p>Arnaud Crestey recueille les réponses que vous choisissez de transmettre pour préparer avec vous un projet de site web et vous en envoyer une copie. Le parcours ne demande ni photo, ni document, ni identifiant de connexion.</p>
        <p>Seuls Arnaud Crestey et les prestataires techniques nécessaires à l’hébergement du parcours et à l’envoi de l’e-mail peuvent traiter ces informations. Elles ne servent pas à une inscription publicitaire.</p>
        <p>Avant l’envoi, un brouillon reste sept jours uniquement dans le navigateur de cet appareil. Après l’envoi, vos réponses sont adressées par e-mail à vous-même et à Arnaud Crestey ; ce site ne conserve pas de dossier de réponses dans une base de données.</p>
        <p>Si le projet n’est pas poursuivi, les échanges et réponses liés à ce parcours ont vocation à être supprimés au plus tard douze mois après le dernier contact. Si un projet démarre, leur conservation suit celle du dossier client et les obligations applicables.</p>
        <p>Vous pouvez demander l’accès, la rectification ou l’effacement de vos données, ou poser toute question à <a className="underline" href="mailto:demande@arnaudcrestey.com">demande@arnaudcrestey.com</a>. Vous pouvez aussi saisir la CNIL si vous estimez que vos droits ne sont pas respectés.</p>
      </div>
    </article>
  </main>;
}
