"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  briefSections, contentOptions, emptyBrief, livingOptions, moodOptions,
  pageOptions, palettes, steps, type ClientBrief,
} from "@/lib/point-de-depart";

const draftKey = "ac-parcours-client-brouillon-v1";
const draftLife = 7 * 24 * 60 * 60 * 1000;
type Key = keyof ClientBrief;

function Field({ label, value, onChange, textarea = false, type = "text", help, required = false, id }: {
  label: string; value: string; onChange: (value: string) => void; textarea?: boolean;
  type?: string; help?: string; required?: boolean; id: string;
}) {
  return <div>
    <label className="field-label" htmlFor={id}>{label}{required ? " *" : ""}</label>
    {textarea
      ? <textarea id={id} className="textarea" value={value} onChange={(event) => onChange(event.target.value)} rows={3} maxLength={2000} />
      : <input id={id} className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} maxLength={id === "prenom" || id === "nom" ? 80 : id === "email" ? 254 : 300} autoComplete={id === "email" ? "email" : undefined} />}
    {help ? <p className="field-help">{help}</p> : null}
  </div>;
}

function SelectField({ label, value, onChange, choices, id, help }: {
  label: string; value: string; onChange: (value: string) => void; choices: string[];
  id: string; help?: string;
}) {
  return <div>
    <label className="field-label" htmlFor={id}>{label}</label>
    <select id={id} className="select" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Choisissez si vous le savez</option>
      {choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
    </select>
    {help ? <p className="field-help">{help}</p> : null}
  </div>;
}

function MultiChoice({ label, values, choices, onChange }: {
  label: string; values: string[]; choices: readonly string[]; onChange: (values: string[]) => void;
}) {
  return <fieldset className="choice-set">
    <legend>{label}</legend>
    <div className="choices">{choices.map((choice) => <label key={choice} className="choice">
      <input type="checkbox" checked={values.includes(choice)} onChange={() => onChange(values.includes(choice) ? values.filter((item) => item !== choice) : [...values, choice])} />
      {choice}
    </label>)}</div>
  </fieldset>;
}

export function PointDeDepartForm() {
  const [form, setForm] = useState<ClientBrief>(emptyBrief);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [honey, setHoney] = useState("");
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { expires: number; form: Partial<ClientBrief> };
        if (parsed.expires > Date.now() && parsed.form && typeof parsed.form === "object") {
          setForm({ ...emptyBrief, ...parsed.form });
        } else localStorage.removeItem(draftKey);
      }
    } catch { /* Le parcours reste utilisable sans stockage local. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ expires: Date.now() + draftLife, form })); }
    catch { /* Le navigateur peut refuser le stockage local. */ }
  }, [form, ready]);

  const set = <K extends Key>(key: K, value: ClientBrief[K]) => setForm((current) => ({ ...current, [key]: value }));

  const next = () => {
    if (step === 0) {
      if (!form.prenom.trim() || !form.nom.trim() || !form.activite.trim() || !form.clients.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError("Renseignez votre nom, votre e-mail, votre activité et vos clients pour continuer.");
        return;
      }
    }
    if (step === 1 && (!form.objectif.trim() || !form.actionVisiteur.trim())) {
      setError("Indiquez ce que le site doit apporter et ce que le visiteur devrait pouvoir faire.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
    document.getElementById("parcours")?.scrollIntoView({ behavior: "smooth" });
  };

  const back = () => { setError(""); setStep((current) => Math.max(0, current - 1)); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < steps.length - 1) { next(); return; }
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/point-de-depart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: honey, elapsedMs: Date.now() - startedAt }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "L’envoi a échoué. Réessayez dans un instant.");
      try { localStorage.removeItem(draftKey); } catch { /* Aucun brouillon à effacer. */ }
      window.location.assign("/point-de-depart/succes");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impossible d’envoyer vos réponses pour le moment.");
      setSending(false);
    }
  };

  const selected = palettes.find((palette) => palette.id === form.palette) ?? palettes[0];
  return <>
    <div className="intro-row"><h2>Votre point de départ</h2><p>Quelques étapes simples pour préparer notre travail ensemble. Vous pouvez laisser une question ouverte.</p></div>
    <div className="progress-top"><strong>ÉTAPE {step + 1} SUR {steps.length}</strong><span>{steps[step].title}</span></div>
    <div className="progress-track" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label="Progression du parcours"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
    <form className="wizard" onSubmit={submit} noValidate>
      <div className="wizard-main">
        <span className="step-kicker">{String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
        <h2 className="step-title">{steps[step].title}</h2><p className="step-subtitle">{steps[step].subtitle}</p>

        {step === 0 && <div className="form-grid">
          <Field id="prenom" label="Votre prénom" required value={form.prenom} onChange={(v) => set("prenom", v)} />
          <Field id="nom" label="Votre nom" required value={form.nom} onChange={(v) => set("nom", v)} />
          <Field id="email" label="Votre e-mail" type="email" required value={form.email} onChange={(v) => set("email", v)} help="Nous l’utiliserons pour vous envoyer une copie de vos réponses." />
          <Field id="entreprise" label="Nom de votre entreprise" value={form.entreprise} onChange={(v) => set("entreprise", v)} />
          <div className="full"><Field id="activite" label="Que faites-vous aujourd’hui ?" required value={form.activite} onChange={(v) => set("activite", v)} help="Quelques mots suffisent. Décrivez votre métier comme vous le diriez à un client." /></div>
          <div className="full"><Field id="clients" label="À qui vous adressez-vous ?" required value={form.clients} onChange={(v) => set("clients", v)} /></div>
          <div className="full"><Field id="offre" label="Qu’aimeriez-vous surtout mettre en avant ?" value={form.offre} onChange={(v) => set("offre", v)} /></div>
        </div>}

        {step === 1 && <div className="form-grid">
          <div className="full"><Field id="objectif" label="Qu’attendez-vous de ce site ?" required textarea value={form.objectif} onChange={(v) => set("objectif", v)} help="Par exemple : être mieux compris, présenter une offre, recevoir des demandes." /></div>
          <div className="full"><Field id="actionVisiteur" label="Que doit pouvoir faire un visiteur ?" required value={form.actionVisiteur} onChange={(v) => set("actionVisiteur", v)} help="Vous contacter, demander un devis, prendre rendez-vous…" /></div>
          <div className="full"><MultiChoice label="Quelles pages imaginez-vous ?" values={form.pages} choices={pageOptions} onChange={(v) => set("pages", v)} /></div>
          <div className="full"><MultiChoice label="Quels éléments avez-vous déjà ? Aucun envoi de fichier ici." values={form.contenus} choices={contentOptions} onChange={(v) => set("contenus", v)} /></div>
          <div className="full"><Field id="messageEssentiel" label="Quelle idée doit rester en tête après une visite ?" textarea value={form.messageEssentiel} onChange={(v) => set("messageEssentiel", v)} /></div>
        </div>}

        {step === 2 && <div className="form-grid">
          <SelectField id="siteExistant" label="Avez-vous déjà un site ?" value={form.siteExistant} onChange={(v) => setForm((current) => ({ ...current, siteExistant: v, adresseSite: v === "Oui" ? current.adresseSite : "" }))} choices={["Oui", "Non", "Je ne sais pas"]} />
          {form.siteExistant === "Oui" && <Field id="adresseSite" label="Son adresse, si vous la connaissez" value={form.adresseSite} onChange={(v) => set("adresseSite", v)} />}
          <SelectField id="domaine" label="Possédez-vous un nom de domaine ?" value={form.domaine} onChange={(v) => setForm((current) => ({ ...current, domaine: v, nomDomaine: v === "Oui" ? current.nomDomaine : "" }))} choices={["Oui", "Non", "Je ne sais pas"]} help="Il s’agit de l’adresse de votre site, comme monentreprise.fr." />
          {form.domaine === "Oui" && <Field id="nomDomaine" label="Quel est ce nom de domaine ?" value={form.nomDomaine} onChange={(v) => set("nomDomaine", v)} />}
          {(form.siteExistant === "Oui" || form.domaine === "Oui") && <Field id="hebergeur" label="Connaissez-vous votre hébergeur actuel ?" value={form.hebergeur} onChange={(v) => set("hebergeur", v)} help="Ne saisissez aucun identifiant ni mot de passe." />}
          <div className="full"><SelectField id="hebergementSouhaite" label="Pour l’hébergement du futur site, quelle option vous paraît préférable ?" value={form.hebergementSouhaite} onChange={(v) => set("hebergementSouhaite", v)} choices={["Je souhaite en discuter", "Conserver mon hébergement", "Je suis ouvert à une gestion par Arnaud Crestey", "Je ne sais pas"]} help="Ce choix ouvre la discussion ; il n’engage à rien. Votre domaine reste le vôtre." /></div>
        </div>}

        {step === 3 && <div className="form-grid">
          <div className="full"><MultiChoice label="Quel ton vous ressemble ?" values={form.ambiance} choices={moodOptions} onChange={(v) => set("ambiance", v)} /></div>
          <div className="full"><p className="field-label">Essayez une palette de couleurs</p><p className="field-help" style={{ marginBottom: 14 }}>Ce sont des pistes pour discuter du style, pas le design final de votre site.</p>
            <div className="palette-grid">{palettes.map((palette) => <button className="palette-option" type="button" key={palette.id} aria-pressed={form.palette === palette.id} onClick={() => set("palette", palette.id)}>
              <span className="swatches">{palette.colors.map((color, index) => <span key={index} style={{ background: color }} />)}</span><span>{palette.name}</span>
            </button>)}</div>
          </div>
          <div className="full"><p className="field-label">Un aperçu de l’ambiance</p><div className="site-preview" style={{ background: selected.colors[0], color: selected.colors[1] }}>
            <div className="preview-copy"><strong>{form.entreprise || "Votre activité"}</strong><p>{form.offre || "Votre message prend forme ici."}</p><span style={{ background: selected.colors[2], color: selected.colors[1] }}>Découvrir</span></div>
            <div className="preview-art"><div style={{ background: selected.colors[2] }} /></div>
          </div></div>
          <div className="full"><Field id="couleursExistantes" label="Avez-vous déjà des couleurs à conserver ?" value={form.couleursExistantes} onChange={(v) => set("couleursExistantes", v)} /></div>
          <Field id="inspirations" label="Des sites ou univers que vous aimez ?" textarea value={form.inspirations} onChange={(v) => set("inspirations", v)} help="Vous pouvez écrire leurs adresses ou les décrire." />
          <Field id="aEviter" label="Ce que vous ne voulez surtout pas" textarea value={form.aEviter} onChange={(v) => set("aEviter", v)} />
        </div>}

        {step === 4 && <div className="form-grid">
          <div className="full"><MultiChoice label="Qu’est-ce qui pourrait évoluer sur votre site ?" values={form.contenusVivants} choices={livingOptions} onChange={(v) => set("contenusVivants", v)} /></div>
          <SelectField id="rythme" label="À quel rythme ?" value={form.rythme} onChange={(v) => set("rythme", v)} choices={["Plusieurs fois par mois", "Une fois par mois", "Quelques fois par an", "Je ne sais pas encore"]} />
          <SelectField id="miseAJour" label="Qui aimeriez-vous voir faire ces mises à jour ?" value={form.miseAJour} onChange={(v) => set("miseAJour", v)} choices={["Moi ou mon équipe", "Arnaud Crestey", "À décider ensemble", "Je ne sais pas"]} />
          <SelectField id="budget" label="Avez-vous une enveloppe en tête ?" value={form.budget} onChange={(v) => set("budget", v)} choices={["À définir ensemble", "Moins de 1 000 €", "1 000 à 3 000 €", "3 000 à 7 000 €", "Plus de 7 000 €"]} />
          <SelectField id="delai" label="Quel délai imaginez-vous ?" value={form.delai} onChange={(v) => set("delai", v)} choices={["Dès que possible", "Dans les prochains mois", "Pas d’urgence", "À définir"]} />
          <div className="full"><Field id="ideeLibre" label="Une idée, une question ou une inquiétude à ajouter ?" textarea value={form.ideeLibre} onChange={(v) => set("ideeLibre", v)} /></div>
        </div>}

        {step === 5 && <div>
          <p className="field-help" style={{ fontSize: 14, marginBottom: 25 }}>Vous pouvez revenir en arrière pour corriger une réponse. Les points laissés ouverts seront discutés ensemble.</p>
          {briefSections(form).map((section) => <section className="review-section" key={section.title}><h3>{section.title}</h3><dl>{section.rows.map(([label, value]) => <div className="review-row" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>)}
          <div className="privacy-note">Vos réponses servent à préparer votre projet avec Arnaud Crestey. Aucun fichier ni mot de passe n’est demandé. Après l’envoi, vous recevrez une copie par e-mail. <a href="/confidentialite" target="_blank" rel="noopener noreferrer">Lire la notice de confidentialité</a>.</div>
        </div>}

        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}><label htmlFor="website">Ne pas remplir</label><input id="website" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(event) => setHoney(event.target.value)} /></div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
      <div className="wizard-nav">
        {step > 0 ? <button className="button button-secondary" type="button" onClick={back}>Précédent</button> : <span />}
        <span className="save-note">Brouillon conservé 7 jours sur cet appareil.</span>
        {step === steps.length - 1
          ? <button key="send" className="button button-primary" type="submit" disabled={sending}>{sending ? "Envoi en cours…" : "Envoyer mes réponses"}</button>
          : <button key="next" className="button button-primary" type="button" onClick={next}>Continuer</button>}
      </div>
    </form>
  </>;
}
