export type ClientBrief = {
  prenom: string;
  nom: string;
  email: string;
  entreprise: string;
  activite: string;
  clients: string;
  offre: string;
  messageEssentiel: string;
  objectif: string;
  actionVisiteur: string;
  pages: string[];
  siteExistant: string;
  adresseSite: string;
  domaine: string;
  nomDomaine: string;
  hebergeur: string;
  hebergementSouhaite: string;
  contenus: string[];
  ambiance: string[];
  palette: string;
  couleursExistantes: string;
  inspirations: string;
  aEviter: string;
  contenusVivants: string[];
  rythme: string;
  miseAJour: string;
  budget: string;
  delai: string;
  ideeLibre: string;
};

export const emptyBrief: ClientBrief = {
  prenom: "", nom: "", email: "", entreprise: "", activite: "", clients: "",
  offre: "", messageEssentiel: "", objectif: "", actionVisiteur: "", pages: [],
  siteExistant: "", adresseSite: "", domaine: "", nomDomaine: "",
  hebergeur: "", hebergementSouhaite: "", contenus: [], ambiance: [],
  palette: "", couleursExistantes: "", inspirations: "", aEviter: "",
  contenusVivants: [], rythme: "", miseAJour: "", budget: "", delai: "",
  ideeLibre: "",
};

export const pageOptions = ["Accueil", "Présentation", "Services ou offres", "Réalisations", "Actualités", "Contact", "Autre / à définir"] as const;
export const contentOptions = ["Textes", "Logo", "Photos", "Avis clients", "Réalisations", "Rien pour le moment"] as const;
export const moodOptions = ["Épuré", "Chaleureux", "Élégant", "Coloré", "Naturel", "Audacieux"] as const;
export const livingOptions = ["Actualités", "Nouvelles offres", "Réalisations", "Événements", "Conseils", "Pas encore défini"] as const;

export const palettes = [
  { id: "sable", name: "Sable & encre", colors: ["#f6f1e7", "#202c29", "#c4a676", "#ffffff"] },
  { id: "foret", name: "Forêt & crème", colors: ["#f5f2e9", "#1f3b32", "#a9bc9b", "#ffffff"] },
  { id: "marine", name: "Marine & ivoire", colors: ["#f8f5eb", "#182a3d", "#c8a66d", "#ffffff"] },
  { id: "terre", name: "Terre & lin", colors: ["#f5ede3", "#4d302b", "#c17858", "#fffaf5"] },
  { id: "sauge", name: "Sauge & pierre", colors: ["#f4f3ec", "#394840", "#a7b6a2", "#ffffff"] },
  { id: "prune", name: "Prune & rose", colors: ["#faf2f0", "#493443", "#c7a2aa", "#ffffff"] },
  { id: "noir", name: "Noir & champagne", colors: ["#f7f4ec", "#131715", "#d6bd8b", "#ffffff"] },
  { id: "bleu", name: "Bleu & sable", colors: ["#f7f2e8", "#254259", "#d9b990", "#ffffff"] },
  { id: "olive", name: "Olive & argile", colors: ["#f7f4eb", "#404b31", "#c6a47f", "#ffffff"] },
  { id: "corail", name: "Corail & graphite", colors: ["#fff7f2", "#2f3335", "#e19075", "#ffffff"] },
  { id: "lilas", name: "Lilas & nuit", colors: ["#f8f5fa", "#303045", "#b7a5ca", "#ffffff"] },
  { id: "clair", name: "Blanc & bronze", colors: ["#ffffff", "#2a2a26", "#a48659", "#f5f1e7"] },
] as const;

export const steps = [
  { title: "Votre activité", subtitle: "Vos mots, votre métier" },
  { title: "Le site que vous imaginez", subtitle: "Ce que vos visiteurs doivent comprendre et faire" },
  { title: "Votre point de départ", subtitle: "Domaine, site et hébergement" },
  { title: "Votre univers", subtitle: "Des couleurs à essayer, sans choix définitif" },
  { title: "Un site qui vit", subtitle: "Ce qui pourra évoluer avec votre activité" },
  { title: "Votre récapitulatif", subtitle: "Relire avant de transmettre" },
] as const;

const readable = (value: string | string[]) => Array.isArray(value)
  ? value.length ? value.join(", ") : "À définir"
  : value.trim() || "À définir";

export function briefSections(data: ClientBrief) {
  const palette = palettes.find((item) => item.id === data.palette);
  return [
    { title: "Votre activité", rows: [
      ["Entreprise", data.entreprise], ["Activité", data.activite],
      ["Clients", data.clients], ["Offre", data.offre],
      ["Message essentiel", data.messageEssentiel],
    ] },
    { title: "Le futur site", rows: [
      ["Objectif", data.objectif], ["Action souhaitée", data.actionVisiteur],
      ["Pages envisagées", data.pages], ["Contenus disponibles", data.contenus],
    ] },
    { title: "Point de départ technique", rows: [
      ["Site actuel", data.siteExistant], ["Adresse actuelle", data.adresseSite],
      ["Nom de domaine", data.domaine], ["Domaine actuel", data.nomDomaine],
      ["Hébergeur actuel", data.hebergeur], ["Gestion de l’hébergement", data.hebergementSouhaite],
    ] },
    { title: "Univers souhaité", rows: [
      ["Ambiance", data.ambiance], ["Palette essayée", palette?.name ?? "À définir"],
      ["Couleurs existantes", data.couleursExistantes], ["Inspirations", data.inspirations],
      ["À éviter", data.aEviter],
    ] },
    { title: "Faire vivre le site", rows: [
      ["Contenus qui évolueront", data.contenusVivants], ["Rythme", data.rythme],
      ["Mise à jour", data.miseAJour], ["Budget envisagé", data.budget],
      ["Délai souhaité", data.delai], ["Autres idées", data.ideeLibre],
    ] },
  ].map((section) => ({
    title: section.title,
    rows: section.rows.map(([label, value]) => [label, readable(value)] as [string, string]),
  }));
}
