# Parcours client AC

Questionnaire de préparation d’un site web pour Arnaud Crestey. Il accompagne une discussion préalable, puis permet au client de préciser ses idées à son rythme. Il ne crée pas de site et ne vaut pas devis.

## Mise en ligne

Projet Vercel existant : `ac-point-de-depart`. Adresse cible : `formulaire-client.arnaudcrestey.com`. Ne pas remplacer ni supprimer l’ancienne adresse avant d’avoir vérifié la nouvelle adresse, le certificat HTTPS et un envoi de test.

Configurer les variables de `.env.example` dans Vercel, pour les environnements voulus, sans inscrire les secrets dans Git. Vérifier que `MAIL_FROM` est autorisé par le serveur SMTP et que `MAIL_TO` est la boîte de réception d’Arnaud.

## Vérifications avant publication

1. `npm ci` puis `npm run build`.
2. Tester les six étapes sur ordinateur et mobile ; arriver au récapitulatif ne doit déclencher aucun envoi.
3. Faire un envoi de test avec une adresse contrôlée : le client reçoit le message et le PDF, Arnaud reçoit sa copie. Vérifier les accents et les réponses longues.
4. Vérifier le contenu de la notice de confidentialité, les prestataires réellement utilisés et la procédure de suppression des réponses dans la messagerie.
5. Vérifier l’adresse cible en HTTPS et seulement ensuite retirer l’ancienne adresse si elle n’est plus utile.

## Données

Le site n’accepte aucun fichier. Les réponses sont transmises par e-mail à la personne qui les remplit et en copie cachée à Arnaud, avec un PDF récapitulatif. Aucune base de réponses n’est créée par l’application. Le navigateur garde automatiquement un brouillon local pendant au plus sept jours après la dernière modification ; l’application le supprime après un envoi réussi. Les e-mails reçus doivent ensuite être gérés selon la durée annoncée dans la notice de confidentialité. Cette suppression n’est pas automatique dans la messagerie.
