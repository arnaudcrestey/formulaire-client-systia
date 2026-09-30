import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createBriefPdf } from "@/lib/brief-pdf";
import {
  briefSections, contentOptions, emptyBrief, livingOptions, moodOptions,
  pageOptions, palettes, type ClientBrief,
} from "@/lib/point-de-depart";

export const runtime = "nodejs";

const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

const choices: Partial<Record<keyof ClientBrief, readonly string[]>> = {
  pages: pageOptions, contenus: contentOptions, ambiance: moodOptions,
  contenusVivants: livingOptions,
  siteExistant: ["Oui", "Non", "Je ne sais pas"],
  domaine: ["Oui", "Non", "Je ne sais pas"],
  hebergementSouhaite: ["Je souhaite en discuter", "Conserver mon hébergement", "Je suis ouvert à une gestion par Arnaud Crestey", "Je ne sais pas"],
  rythme: ["Plusieurs fois par mois", "Une fois par mois", "Quelques fois par an", "Je ne sais pas encore"],
  miseAJour: ["Moi ou mon équipe", "Arnaud Crestey", "À décider ensemble", "Je ne sais pas"],
  budget: ["À définir ensemble", "Moins de 1 000 €", "1 000 à 3 000 €", "3 000 à 7 000 €", "Plus de 7 000 €"],
  delai: ["Dès que possible", "Dans les prochains mois", "Pas d’urgence", "À définir"],
  palette: palettes.map((item) => item.id),
};

function parseBrief(raw: unknown): { brief?: ClientBrief; error?: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "Réponses invalides." };
  const incoming = raw as Record<string, unknown>;
  const brief = { ...emptyBrief };
  for (const key of Object.keys(emptyBrief) as (keyof ClientBrief)[]) {
    const value = incoming[key];
    if (Array.isArray(emptyBrief[key])) {
      if (!Array.isArray(value) || value.length > 15 || value.some((item) => typeof item !== "string" || item.length > 100)) return { error: "Une sélection est invalide." };
      (brief as unknown as Record<string, unknown>)[key] = value;
    } else {
      const maxLength = key === "ideeLibre" || key === "objectif" || key === "messageEssentiel" || key === "inspirations" || key === "aEviter" ? 2000 : key === "prenom" || key === "nom" ? 80 : key === "email" ? 254 : 300;
      if (typeof value !== "string" || value.length > maxLength) return { error: "Une réponse est trop longue ou invalide." };
      (brief as unknown as Record<string, unknown>)[key] = value.trim();
    }
    const allowed = choices[key];
    const checked = (brief as unknown as Record<string, string | string[]>)[key];
    if (allowed && (Array.isArray(checked) ? checked.some((item) => !allowed.includes(item)) : checked && !allowed.includes(checked))) return { error: "Une sélection ne correspond pas aux choix proposés." };
  }
  if (!brief.prenom || !brief.nom || !brief.activite || !brief.clients || !brief.objectif || !brief.actionVisiteur) return { error: "Des réponses essentielles manquent." };
  if (!/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(brief.email) || brief.email.length > 254) return { error: "L’adresse e-mail est invalide." };
  if (brief.siteExistant !== "Oui") brief.adresseSite = "";
  if (brief.domaine !== "Oui") brief.nomDomaine = "";
  return { brief };
}

function emails(data: ClientBrief) {
  const sections = briefSections(data);
  const intro = `Point de départ de ${data.prenom} ${data.nom} (${data.email})`;
  const text = [intro, "Ce document prépare une discussion. Les choix ne valent ni devis ni validation d'un site.", ...sections.map((section) => [section.title, ...section.rows.map(([label, value]) => `${label} : ${value}`)].join("\n"))].join("\n\n");
  const html = `<div style="background:#f7f5ef;padding:28px 12px;color:#19231e;font-family:Arial,sans-serif"><div style="max-width:720px;margin:auto;background:#fffefa;padding:34px;border:1px solid #d9ded3"><div style="color:#806438;font-size:12px;letter-spacing:.2em">AC · ARNAUD CRESTEY</div><h1 style="font-family:Georgia,serif;font-weight:normal;font-size:36px;margin:18px 0">Votre point de départ</h1><p>${esc(intro)}</p><p style="color:#5f6962">Ce récapitulatif prépare notre discussion. Il ne vaut ni devis ni validation d’un site.</p>${sections.map((section) => `<h2 style="font-family:Georgia,serif;font-size:24px;font-weight:normal;border-top:1px solid #d9ded3;padding-top:22px;margin-top:30px">${esc(section.title)}</h2><table style="width:100%;border-collapse:collapse">${section.rows.map(([label, value]) => `<tr><td style="width:34%;padding:7px 10px 7px 0;vertical-align:top;color:#806438;font-size:13px">${esc(label)}</td><td style="padding:7px 0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px">${esc(value)}</td></tr>`).join("")}</table>`).join("")}<p style="margin-top:30px;color:#5f6962;font-size:12px">Une question ou une correction ? Répondez à cet e-mail.</p></div></div>`;
  return { text, html };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let sameOrigin = false;
  try { sameOrigin = !!origin && !!host && new URL(origin).host === host; } catch { /* En-tête invalide. */ }
  if (!sameOrigin) return NextResponse.json({ error: "Origine de l’envoi invalide." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Format non accepté." }, { status: 415 });

  try {
    const rawText = await request.text();
    if (rawText.length > 30_000) return NextResponse.json({ error: "Les réponses sont trop longues." }, { status: 413 });
    const raw = JSON.parse(rawText) as Record<string, unknown>;
    if (raw.website) return NextResponse.json({ ok: true });
    if (typeof raw.elapsedMs !== "number" || raw.elapsedMs < 3_000) return NextResponse.json({ error: "Veuillez vérifier vos réponses avant de les envoyer." }, { status: 429 });
    const { brief, error } = parseBrief(raw);
    if (!brief) return NextResponse.json({ error }, { status: 400 });

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM;
    const mailTo = process.env.MAIL_TO || "demande@arnaudcrestey.com";
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom) return NextResponse.json({ error: "Le service d’envoi est indisponible." }, { status: 503 });

    const pdf = await createBriefPdf(brief);
    const message = emails(brief);
    const transporter = nodemailer.createTransport({
      host: smtpHost, port: smtpPort, secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      auth: { user: smtpUser, pass: smtpPass },
      disableFileAccess: true, disableUrlAccess: true,
    });
    await transporter.sendMail({
      from: mailFrom, to: brief.email, bcc: mailTo, replyTo: mailTo,
      subject: "Votre point de départ pour le site · Arnaud Crestey",
      ...message,
      attachments: [{ filename: "Mon-point-de-depart-AC.pdf", content: Buffer.from(pdf), contentType: "application/pdf" }],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "L’envoi n’a pas pu être confirmé. Veuillez réessayer plus tard." }, { status: 500 });
  }
}
