/**
 * Apply French translations for keys still identical to en.json.
 * Uses path overrides (TRANSLATIONS) + MyMemory for remaining unique strings.
 */
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");
const enPath = path.join(root, "en.json");
const frPath = path.join(root, "fr.json");
const mapPath = path.join(import.meta.dirname, "fr-translations-map.json");

const EXACT_OK = new Set([
  "Herbal Kapıda",
  "PayTR",
  "WhatsApp",
  "Google",
  "Herbal Kapıda",
  "KVKK",
  "IBAN",
  "DHL",
  "Formula 1",
  "HBL",
  "Instagram",
  "Blog",
  "FAQ",
  "SSL",
]);

const KEEP = [
  "Herbal Kapıda",
  "Herbal Kapıda Nutrition",
  "PayTR",
  "KVKK",
  "WhatsApp",
  "Google",
  "Google Analytics",
  "Google Ads",
  "Google Business",
  "Formula 1",
  "Herbal Kapıda",
  "HBL",
  "IBAN",
  "Instagram",
  "FAQ",
  "Blog",
  "SSL",
  "Meta",
  "DHL",
  "TRY",
  "EFT",
  "OFFRE",
  "Min",
  "Sec",
];

/** Path-specific curated French (priority namespaces). */
export const TRANSLATIONS = {
  "common.previous": "Précédent",
  "common.next": "Suivant",
  "nav.home": "Accueil",
  "nav.mobileMenu": "Menu mobile",
  "nav.orders": "Mes commandes",
  "nav.nutritionTracking": "Suivi nutrition",
  "nav.measurements": "Mes mensurations",
  "nav.progressReport": "Rapport de progrès",
  "nav.cargoTracking": "Suivi de livraison",
  "nav.googleReview": "Avis Google",
  "nav.contact": "Nous contacter",
  "nav.coaching": "Accompagnement",
  "header.pages": "Pages",
  "cart.viewCart": "Voir le panier",
  "home.blog.eyebrow": "Publications",
  "home.productCount": "{count} produits",
  "home.productsComingSoon": "Produits bientôt disponibles.",
  "home.categoryHub.kilo-kontrolu.name": "Gestion du poids",
  "home.categoryHub.kilo-kontrolu.blurb": "Produits Formule et programmes",
  "home.categoryHub.icecekler.name": "Boissons",
  "home.categoryHub.icecekler.blurb": "Aloès, thé et boissons fibres",
  "home.categoryHub.avantajli-setler.name": "Packs cadeaux",
  "home.categoryHub.avantajli-setler.blurb": "Packs avec shaker offert",
  "home.categoryHub.takviye-edici.name": "Compléments",
  "home.categoryHub.takviye-edici.blurb": "Vitamines et minéraux",
  "home.categoryHub.sporcu-urunleri.name": "Nutrition sportive",
  "home.categoryHub.sporcu-urunleri.blurb": "Protéines et performance",
  "home.categoryHub.atistirmalik.name": "Collations",
  "home.categoryHub.atistirmalik.blurb": "Barres protéinées et snacks",
  "home.fallbackFaqItems[0].question": "Les produits sont-ils authentiques ?",
  "home.fallbackFaqItems[0].answer":
    "Oui. Les produits vendus sont des produits Herbal Kapıda Nutrition originaux. Ce site appartient à un distributeur indépendant ; ce n’est pas le site officiel Herbal Kapıda.",
  "home.fallbackFaqItems[1].question": "Quel est le délai de livraison ?",
  "home.fallbackFaqItems[1].answer":
    "Après confirmation du paiement, les commandes partent en général sous 1 à 3 jours ouvrés. Nous partageons le code de suivi dans votre notification.",
  "home.fallbackFaqItems[2].question": "Comment puis-je payer ?",
  "home.fallbackFaqItems[2].answer":
    "Les paiements par carte passent par l’infrastructure sécurisée PayTR. Pas de paiement à la livraison. Appliquez un code promo au paiement si vous en avez un.",
  "home.fallbackFaqItems[3].question": "Ai-je un droit de rétractation ?",
  "home.fallbackFaqItems[3].answer":
    "La vente à distance inclut un droit de rétractation de 14 jours. Voir Annulation et retours ; demandez avec votre numéro de commande.",
  "home.fallbackFaqItems[4].question": "Qu’est-ce que le suivi nutrition ?",
  "home.fallbackFaqItems[4].answer":
    "Enregistrez eau, repas et mesures dans votre compte ; votre coach peut valider et vous accompagner.",
  "home.fallbackFaqItems[5].question": "Quel pack choisir ?",
  "home.fallbackFaqItems[5].answer":
    "Nous proposons des packs cadeaux selon votre objectif. Conseil produit sur WhatsApp — réponse habituelle en moins d’une heure.",
  "checkout.defaultShippingTitle": "Livraison",
  "checkout.defaultBillingTitle": "Facturation",
  "checkout.defaultHomeTitle": "Domicile",
  "checkout.errLegalRequired": "Vous devez accepter les confirmations légales.",
  "checkout.errSelectSavedAddress":
    "Sélectionnez une adresse de livraison enregistrée ou saisissez-en une nouvelle.",
  "checkout.errSelectShippingProvider": "Sélectionnez un transporteur.",
  "checkout.errDefaultAddress": "Impossible de définir l’adresse par défaut.",
  "checkout.errPaymentRedirect": "Redirection de paiement non reçue.",
  "checkout.errPaymentStart": "Impossible de démarrer le paiement. Vérifiez votre connexion.",
  "checkout.pickupSubline": "Gratuit · Retrait quand prêt",
  "checkout.storeAddress": "Adresse du magasin",
  "checkout.storeHours": "Horaires",
  "checkout.storePhone": "Téléphone",
  "checkout.shippingAddressHeading": "Adresse de livraison",
  "checkout.billingAddressHeading": "Adresse de facturation",
  "checkout.defaultBadge": " · par défaut",
  "checkout.makeDefaultShipping": "Définir comme livraison par défaut",
  "checkout.addNewAddress": "+ Nouvelle adresse",
  "checkout.saveToAddressBook": "Enregistrer cette adresse dans mon carnet",
  "checkout.setDefaultShippingAddress": "Définir comme adresse de livraison par défaut",
  "checkout.billingSamePickup": "Je n’ai pas besoin d’adresse de facturation séparée",
  "checkout.billingSameDelivery": "Identique à la livraison",
  "checkout.defaultBillingBadge": " · facturation par défaut",
  "checkout.makeDefaultBilling": "Définir comme facturation par défaut",
  "checkout.addNewBillingAddress": "+ Nouvelle adresse de facturation",
  "checkout.billingNoSeparatePickup": "Aucune adresse de facturation séparée ne sera demandée.",
  "checkout.billingSameAsShipping": "La facturation correspondra à l’adresse de livraison.",
  "checkout.corporateBilling": "Facture professionnelle (e-facture / e-archive)",
  "checkout.summaryHeading": "Récapitulatif",
  "checkout.couponLabel": "Code promo",
  "checkout.removeCoupon": "Retirer",
  "checkout.applyCoupon": "Appliquer",
  "checkout.invalidCoupon": "Code promo invalide",
  "checkout.couponApplied": "{title} appliqué",
  "checkout.subtotal": "Sous-total",
  "checkout.discount": "Remise ({code})",
  "checkout.pickupFree": "Magasin · Gratuit",
  "checkout.vatLine": "TVA ({rate}%{included})",
  "checkout.vatIncluded": " incl.",
  "checkout.total": "Total",
  "checkout.legalApprovals": "Confirmations légales",
  "checkout.legalMesafeli": "J’ai lu et j’accepte",
  "checkout.legalMesafeliLink": "le contrat de vente à distance",
  "checkout.legalOnBilgi": "J’ai lu",
  "checkout.legalOnBilgiLink": "le formulaire d’information précontractuelle",
  "checkout.legalKvkk": "J’accepte",
  "checkout.legalKvkkLink": "KVKK",
  "checkout.legalKvkkRest": "le texte.",
  "checkout.legalSecure": "Achats sécurisés",
  "checkout.legalReturns": "politique de retours",
  "checkout.legalRead": "J’ai lu",
  "checkout.legalInform": "les informations.",
  "checkout.paySecure": "Paiement sécurisé PayTR",
  "checkout.ssl256": "SSL 256 bits",
  "checkout.originalGuarantee": "Garantie produit authentique",
  "checkout.payWithPaytr": "Payer en toute sécurité avec PayTR",
  "checkout.redirecting": "Redirection…",
  "checkout.mobilePay": "Payer en sécurité",
  "checkout.selectedDefaultShipping": " · livraison par défaut",
  "checkout.selectedDefaultBilling": " · facturation par défaut",
  "checkout.stepCart": "Panier",
  "checkout.stepDelivery": "Livraison",
  "checkout.stepPayment": "Paiement sécurisé",
  "checkout.preparing": "Préparation du paiement…",
  "checkout.emptyCart": "Votre panier est vide.",
  "checkout.backToShop": "Retour à la boutique",
  "checkout.breadcrumbDelivery": "Livraison",
  "checkout.titleDeliveryPayment": "Livraison et paiement",
  "checkout.savedAddressHint": "Choisissez une adresse enregistrée ou ajoutez-en une.",
  "checkout.loginForAddressBook": "Pour votre carnet d’adresses,",
  "checkout.signInLink": "connectez-vous",
  "checkout.contactHeading": "Coordonnées",
  "checkout.collapse": "Replier",
  "checkout.edit": "Modifier",
  "checkout.deliveryMethodHeading": "Mode de livraison",
  "product.adding": "Ajout…",
  "product.addedCheck": "Ajouté au panier ✓",
  "product.addError": "Impossible d’ajouter au panier. Vérifiez votre connexion.",
  "product.campaign": "Promotion",
  "product.discount": "de réduction",
  "product.variantOut": " · Épuisé",
  "product.flavorNotes": "Note de saveur (info)",
  "product.shakerColor": "Couleur du shaker",
  "product.price": "Prix",
  "product.vatIncluded": "(TVA incluse)",
  "product.stock": "Stock",
  "product.stockNone": "aucun",
  "product.lowStock": "Plus que {count} — stock limité",
  "product.trustOriginal": "Produit authentique",
  "product.trustPaytr": "Paiement sécurisé (PayTR)",
  "product.trustReturn": "Rétractation 14 jours",
  "product.whatsappConsult": "Question sur WhatsApp — réponse en moins d’1 h",
  "product.notFound": "Produit introuvable",
  "product.reviewsCount": "{count} avis",
  "product.usageGuide": "Conseils d’utilisation",
  "product.usage": "Utilisation",
  "product.ratio": "Dosage",
  "product.storage": "Conservation",
  "product.categoryLink": "Catégorie {name} →",
  "product.relatedEyebrow": "Souvent achetés ensemble",
  "product.relatedWithCategory": "Compléter avec {name}",
  "product.relatedDefault": "Souvent achetés ensemble",
  "product.specCategory": "Catégorie",
  "product.specHerbal KapıdaId": "Herbal Kapıda ID",
  "product.specKind": "Type",
  "product.specForm": "Forme / type",
  "product.specHighlight": "Ingrédients clés",
  "product.specOrigin": "Origine",
  "product.specRegion": "Région cible",
  "product.specServing": "Portion",
  "product.specLot": "N° lot",
  "product.specPackage": "Conditionnement",
  "product.specFlavors": "Parfums",
  "product.shakerGreen": "Vert vif",
  "product.shakerPink": "Rose",
  "product.shakerBlack": "Noir",
  "product.shakerWhite": "Blanc",
  "benefits.sameDayTitle": "Commandez avant {cutoff} — expédition le jour même",
  "benefits.sameDaySubtitle": "Envoi rapide les jours ouvrés",
  "benefits.freeShippingTitle": "Livraison gratuite dès {amount}",
  "benefits.freeShippingSubtitle": "Partout en France",
  "benefits.fastShippingTitle": "Livraison rapide",
  "benefits.fastShippingSubtitle": "Expédition sous 1 à 3 jours ouvrés",
  "benefits.securePayTitle": "Paiement PayTR sécurisé",
  "benefits.securePaySubtitle": "SSL 256 bits",
  "benefits.returnTitle": "Retours {days} jours",
  "benefits.returnSubtitle": "Droit de rétractation",
  "benefits.originalTitle": "Produits authentiques",
  "benefits.originalSubtitle": "Distributeur indépendant",
  "benefits.coachingTitle": "Accompagnement gratuit",
  "benefits.coachingSubtitle": "Suivi via WhatsApp",
  "catalog.title": "Produits",
  "catalog.categorySubtitle": "Produits dans {name}",
  "catalog.defaultSubtitle": "Rechercher, filtrer et trier le catalogue",
  "catalog.filterToggle": "Filtrer / Rechercher",
  "catalog.clear": "Effacer",
  "catalog.clearFilters": "Effacer les filtres",
  "catalog.searchLabel": "Rechercher",
  "catalog.categoryLabel": "Catégorie",
  "catalog.originLabel": "Origine",
  "catalog.sortLabel": "Tri",
  "catalog.summaryLoading": "Chargement…",
  "catalog.summary": "{total} produits · Page {page}/{totalPages}",
  "catalog.emptyFilteredTitle": "Produit introuvable",
  "catalog.emptyCatalogTitle": "Aucun produit au catalogue",
  "catalog.emptyQuery": "Aucun résultat pour « {q} ». Effacez les filtres et réessayez.",
  "catalog.emptyFilters": "Aucun produit ne correspond aux filtres.",
  "catalog.emptyDefault": "Aucun produit à afficher pour le moment.",
  "catalog.suggestionsTitle": "Vous pourriez aimer",
  "catalog.sortNameAsc": "Nom A→Z",
  "catalog.sortNameDesc": "Nom Z→A",
  "catalog.sortPriceAsc": "Prix croissant",
  "catalog.sortPriceDesc": "Prix décroissant",
  "catalog.sortNewest": "Plus récents",
  "catalog.sortStock": "Stock",
  "catalog.previous": "Précédent",
  "catalog.next": "Suivant",
  "blog.homeCrumb": "Accueil",
  "blog.postsCrumb": "Publications",
  "blog.heroBody": "Routines nutrition, conseils packs et notes bien-être.",
  "blog.tagsNav": "Étiquettes",
  "blog.emptyTitle": "Pas encore d’articles",
  "blog.emptyTag": "Aucun contenu avec l’étiquette « {tag} ».",
  "blog.emptyDefault": "Nouveaux articles bientôt.",
  "blog.allPosts": "Tous les articles",
  "blog.exploreProducts": "Découvrir les produits",
  "blog.featuredTag": "À la une",
  "blog.readPost": "Lire l’article",
  "blog.readMinutes": "{minutes} min",
  "blog.readMinutesLong": "{minutes} min de lecture",
  "blog.pagination": "Pages",
  "blog.previous": "Précédent",
  "blog.next": "Suivant",
  "blog.notFound": "Article introuvable",
  "blog.relatedCategories": "Catégories liées",
  "blog.relatedProducts": "Produits liés",
  "blog.relatedProductsBody": "Souvent consultés avec cet article",
  "blog.ctaTitle": "Poursuivez votre routine avec des produits",
  "blog.ctaBody": "Parcourez les packs ou revenez aux articles.",
  "blog.ctaSets": "Voir les packs",
  "blog.ctaAllPosts": "Tous les articles",
  "auth.loginEyebrow": "Connexion",
  "auth.registerEyebrow": "Créer un compte",
  "auth.loginTitle": "Connexion",
  "auth.registerTitle": "Inscription",
  "auth.subtitle": "Continuez avec e-mail ou connectez Google.",
  "auth.noAccount": "Pas encore de compte ?",
  "auth.registerLink": "S’inscrire",
  "auth.hasAccount": "Déjà membre ?",
  "auth.loginLink": "Se connecter",
  "auth.socialLogin": "Connexion sociale",
  "auth.googleContinue": "Continuer avec Google",
  "auth.emailLabel": "E-mail",
  "auth.passwordLabel": "Mot de passe",
  "auth.forgotPassword": "Mot de passe oublié",
  "auth.submitLogin": "Se connecter",
  "auth.verifying": "Vérification…",
  "auth.loginFailed": "Échec de connexion. Vérifiez vos informations.",
  "auth.creating": "Création…",
  "auth.createAccount": "Créer un compte",
  "auth.registerFailed": "Inscription impossible.",
  "account.loading": "Chargement du compte…",
  "account.sessionInvalid": "Session non vérifiée. Reconnectez-vous.",
  "account.unauthorized": "Non autorisé",
  "account.breadcrumb": "Compte / {tab}",
  "account.tabOrders": "Commandes",
  "account.tabAddresses": "Adresses",
  "account.tabAccount": "Compte",
  "account.noOrders": "Aucune commande pour le moment.",
  "account.browseCatalog": "Parcourir le catalogue",
  "account.trackShipment": "Suivre la livraison",
  "account.detail": "Détails",
  "account.addressesHint": "Adresses de livraison et facturation pour le paiement.",
  "account.addAddress": "Ajouter une adresse",
  "account.editAddress": "Modifier l’adresse",
  "account.newAddress": "Nouvelle adresse",
  "account.addressTitle": "Libellé",
  "account.addressTitlePlaceholder": "Domicile, Travail",
  "account.city": "Ville",
  "account.district": "Quartier",
  "account.neighborhood": "Secteur",
  "account.addressLine": "Adresse",
  "account.postalCode": "Code postal",
  "account.billingOptional": "Facturation (facultatif)",
  "account.companyTitle": "Raison sociale",
  "account.taxNumber": "N° fiscal",
  "account.taxOffice": "Centre des impôts",
  "account.defaultShipping": "Adresse de livraison par défaut",
  "account.defaultBilling": "Adresse de facturation par défaut",
  "account.save": "Enregistrer",
  "account.cancel": "Annuler",
  "account.noAddresses": "Aucune adresse enregistrée.",
  "account.defaultShippingBadge": "Livraison par défaut",
  "account.defaultBillingBadge": "Facturation par défaut",
  "account.makeDefaultShipping": "Définir livraison par défaut",
  "account.makeDefaultBilling": "Définir facturation par défaut",
  "account.edit": "Modifier",
  "account.delete": "Supprimer",
  "account.changePassword": "Changer le mot de passe",
  "account.setPassword": "Définir un mot de passe",
  "account.googlePasswordHint":
    "Vous vous êtes connecté avec Google. Définissez un mot de passe ici pour vous connecter aussi par e-mail. Le lien Google reste actif.",
  "account.currentPassword": "Mot de passe actuel",
  "account.newPassword": "Nouveau mot de passe",
  "account.newPasswordRepeat": "Nouveau mot de passe (confirmation)",
  "account.passwordMismatch": "Les nouveaux mots de passe ne correspondent pas.",
  "account.currentPasswordRequired": "Saisissez votre mot de passe actuel.",
  "account.passwordUpdated": "Mot de passe mis à jour.",
  "account.passwordSet": "Mot de passe défini. Vous pouvez aussi vous connecter par e-mail.",
  "account.passwordUpdateFailed": "Impossible de mettre à jour le mot de passe",
  "account.updatePassword": "Mettre à jour le mot de passe",
  "account.setPasswordAction": "Définir le mot de passe",
  "account.closeAccount": "Fermer le compte",
  "account.closeAccountLead":
    "Supprime définitivement votre compte et vos données personnelles conformément à notre politique de confidentialité.",
  "account.closeAccountFailed": "Impossible de fermer le compte",
  "account.deleteAccount": "Supprimer le compte",
  "account.closingAccount": "Fermeture…",
  "account.deleteAddressTitle": "Supprimer l’adresse ?",
  "account.deleteAddressBody": "Cette adresse sera supprimée définitivement.",
  "account.deleteAddressConfirm": "Supprimer",
  "account.deleting": "Suppression…",
  "account.deleteAccountTitle": "Supprimer le compte ?",
  "account.deleteAccountBody":
    "Action irréversible. Les commandes déjà passées restent archivées.",
  "account.addressSaveFailed": "Impossible d’enregistrer l’adresse",
  "account.defaultFailed": "Impossible de définir par défaut",
  "account.deleteFailed": "Impossible de supprimer",
  "account.closeDialog": "Fermer",
  "account.corporateBillingOptional": "Facture entreprise (facultatif)",
  "account.noAddressesHint": "Aucune adresse. Ajoutez-en une pour livraison et facturation.",
  "account.confirmLabel": "Confirmer",
  "account.dismiss": "Annuler",
  "account.deleteAddressNamed": "« {title} » sera supprimée définitivement.",
  "account.shippingBadge": "Livraison",
  "account.billingBadge": "Facturation",
  "account.closeAccountDetail":
    "Votre compte est désactivé et vos données anonymisées. Les commandes passées restent pour obligation légale. Irréversible.",
  "account.closeAccountConfirmDetail":
    "Vous ne pourrez plus vous connecter. L’historique reste enregistré pour la durée légale.",
  "account.deleteMyAccount": "Supprimer mon compte",
  "orderStatus.pending_payment": "Paiement en attente",
  "orderStatus.paid": "Paiement reçu",
  "orderStatus.processing": "Préparation",
  "orderStatus.shipped": "Expédié",
  "orderStatus.delivered": "Livré",
  "orderStatus.cancelled": "Annulé",
  "orderStatus.refunded": "Remboursé",
  "orderStatus.shipment_pending": "En attente",
  "orderStatus.shipment_label_created": "Étiquette créée",
  "orderStatus.shipment_in_transit": "En transit",
  "orderStatus.shipment_delivered": "Livré",
  "orderStatus.shipment_failed": "Échec",
  "orderStatus.shipment_returned": "Retour expédition",
  "orderStatus.step_pending_payment": "Paiement",
  "orderStatus.step_paid": "Confirmé",
  "orderStatus.step_processing": "Prép.",
  "orderStatus.step_shipped": "Expédition",
  "orderStatus.step_delivered": "Livré",
  "orderStatus.hint_pending_payment":
    "Paiement non finalisé. Terminez si vous avez été redirigé vers le paiement.",
  "orderStatus.hint_paid": "Paiement reçu. Commande en file de préparation.",
  "orderStatus.hint_processing": "Commande en préparation. E-mail à l’expédition.",
  "orderStatus.hint_shipped": "Le transporteur a pris le colis. Suivez avec votre code.",
  "orderStatus.hint_delivered": "Livré. Laissez un avis sur la fiche produit si vous le souhaitez.",
  "orderStatus.hint_cancelled": "Cette commande a été annulée.",
  "orderStatus.hint_refunded": "Un remboursement a été traité pour cette commande.",
  "contactPage.kicker": "Nous contacter",
  "contactPage.phone": "Téléphone",
  "contactPage.email": "E-mail",
  "contactPage.writeNow": "Écrire maintenant",
  "contactPage.hours": "Horaires d’ouverture",
  "contactPage.writeWhatsapp": "Écrire sur WhatsApp",
  "contactPage.sendMessage": "Envoyer un message",
  "contactPage.reachUs": "Nous joindre",
  "contactPage.subject": "Objet",
  "contactPage.message": "Message",
  "contactPage.subjectGeneral": "Général",
  "contactPage.subjectCoaching": "Coaching nutrition",
  "contactPage.subjectLogistics": "Commande / livraison",
  "contactPage.subjectTechnical": "Technique",
  "contactPage.sending": "Envoi…",
  "contactPage.send": "Envoyer",
  "contactPage.success": "Message reçu. Nous répondrons dès que possible.",
  "contactPage.error": "Envoi impossible. Réessayez plus tard.",
  "contactPage.waPrefill": "Bonjour, j’écris depuis la page contact {brand}.",
  "contactPage.metaTitle": "Nous contacter",
  "contactPage.metaDescription":
    "Écrivez-nous pour conseils produits, commandes et suivi nutrition. {brand} — distributeur indépendant.",
  "contactPage.metaDescriptionLocation":
    "Contacter {brand} — atelier {location} et questions commandes.",
  "trustMarquee.item0": "Produits 100 % authentiques",
  "trustMarquee.item2": "Accompagnement personnalisé",
  "trustMarquee.item3": "Paiement sécurisé",
  "trustMarquee.item5": "Assistance WhatsApp",
  "trustMarquee.item6": "Packs avantageux",
  "trustMarquee.item7": "Shaker offert",
  "trustMarquee.srOnly":
    "Produits authentiques, livraison gratuite, suivi coaching et paiement sécurisé.",
  "footer.map": "Carte",
  "footer.googleReview": "Avis Google",
  "footer.whatsappPrefill": "Bonjour, j’écris au sujet de {brand}.",
  "footer.legalDisclaimerFallback":
    "Ce site appartient à un distributeur Herbal Kapıda Nutrition indépendant. Produits 100 % originaux.",
  "forms.fullName": "Nom complet",
  "forms.city": "Ville",
  "forms.district": "Quartier",
  "forms.neighborhood": "Secteur",
  "forms.postalCode": "Code postal",
  "forms.addressLine": "Adresse",
  "forms.addressTitle": "Libellé d’adresse",
  "forms.companyTitle": "Raison sociale",
  "forms.taxNumber": "N° fiscal",
  "forms.taxOffice": "Centre des impôts",
  "forms.firstName": "Prénom",
  "forms.lastName": "Nom",
  "forms.noteOptional": "Note (facultatif)",
  "forms.orderNumber": "N° commande",
  "forms.amountTry": "Montant (TRY)",
  "forms.senderName": "Nom complet de l’émetteur",
  "forms.phone": "Téléphone",
  "forms.email": "E-mail",
  "forms.password": "Mot de passe",
  "forms.searchProducts": "Nom produit, pack…",
  "forms.customMessage": "Saisissez votre message…",
  "forms.emailExample": "vous@exemple.fr",
  "whatsapp.defaultGreeting": "Bonjour — comment pouvons-nous vous aider ?",
  "whatsapp.presetOrderStatusLabel": "Statut commande",
  "whatsapp.presetOrderStatusMessage": "Bonjour, je souhaite un point sur ma commande.",
  "whatsapp.presetProductLabel": "Conseil produit",
  "whatsapp.presetProductMessage":
    "Bonjour, pouvez-vous me suggérer des produits / packs pour mes objectifs ?",
  "whatsapp.presetTrackingLabel": "Suivi nutrition",
  "whatsapp.presetTrackingMessage": "Bonjour, j’ai une question sur le suivi nutrition.",
  "whatsapp.presetShippingLabel": "Livraison",
  "whatsapp.presetShippingMessage":
    "Bonjour, j’ai une question sur les délais et options de livraison.",
  "whatsapp.presetOtherLabel": "Autre sujet",
  "whatsapp.presetOtherMessage": "Bonjour, je vous écris.",
  "whatsapp.popup0": "Bonjour ! Écrivez-nous pour des idées produits et packs.",
  "whatsapp.popup1": "Suivi nutrition et coach ici.",
  "whatsapp.popup2": "Délai de livraison ? Demandez-nous.",
  "whatsapp.popup3": "Découvrez les packs spéciaux.",
  "whatsapp.popup4": "Herbal Kapıda — ligne WhatsApp ouverte.",
  "whatsapp.title0": "Herbal Kapıda · Assistance WhatsApp",
  "whatsapp.title1": "Produits authentiques · Livraison à domicile",
  "whatsapp.title2": "Coaching nutrition · WhatsApp",
  "whatsapp.title3": "Formula 1 et packs · Demandez-nous",
  "whatsapp.title4": "Herbal Kapıda — Nous sommes là pour vous",
  "whatsapp.dialogLabel": "Discussion WhatsApp",
  "whatsapp.channelEyebrow": "Canal WhatsApp",
  "whatsapp.liveSupport": "Assistance en direct",
  "whatsapp.presetHint": "Question rapide ou saisie libre · {phone}",
  "whatsapp.closeChat": "Fermer la discussion",
  "whatsapp.close": "Fermer",
  "whatsapp.customMessageLabel": "Votre message",
  "whatsapp.sendOnWhatsapp": "Envoyer sur WhatsApp",
  "whatsapp.openFab": "Ouvrir WhatsApp",
  "whatsapp.closeFab": "Fermer WhatsApp",
  "whatsapp.defaultCustomMessage": "Bonjour, j’écris au sujet de {brand}.",
  "aboutPage.breadcrumbHome": "Accueil",
  "aboutPage.address": "Adresse",
  "aboutPage.hours": "Horaires",
  "aboutPage.phone": "Téléphone",
  "aboutPage.email": "E-mail",
  "aboutPage.waWrite": "Écrire sur WhatsApp",
  "aboutPage.fallbackHeroTitle": "À propos de nous",
  "aboutPage.fallbackHeroSeo":
    "Produits originaux, packs cadeaux et accompagnement nutrition avec un distributeur Herbal Kapıda indépendant.",
  "aboutPage.fallbackBodyLine1": "Vie saine",
  "aboutPage.fallbackBodyLine2": "avec vous",
  "aboutPage.fallbackBodyP1":
    "Nous réunissons produits Herbal Kapıda originaux, packs avantageux et conseil nutrition personnalisé.",
  "aboutPage.fallbackBodyP2":
    "Notre objectif : le bon programme, des habitudes durables et un accès de confiance — pas des produits au hasard.",
  "aboutPage.fallbackBodyP3":
    "Contactez-nous sur WhatsApp pour choix produits, conseils packs ou suivi bien-être.",
  "aboutPage.ctaProducts": "Voir les produits",
  "aboutPage.ctaContact": "Nous contacter",
  "aboutPage.fallbackEthosEyebrow": "Notre approche nutrition",
  "aboutPage.fallbackEthosQuote":
    "Des résultats durables viennent des bons produits, d’un suivi régulier et d’un accompagnement personnel.",
  "aboutPage.fallbackEthosLink": "Lire les articles",
  "aboutPage.pillarOriginalTitle": "Produits authentiques",
  "aboutPage.pillarOriginalBody":
    "Produits Herbal Kapıda 100 % originaux avec garantie distributeur indépendant.",
  "aboutPage.pillarProgramTitle": "Programme personnel",
  "aboutPage.pillarProgramBody":
    "Recommandations de packs selon votre objectif et coaching WhatsApp individuel.",
  "aboutPage.pillarTrackingTitle": "Suivi santé",
  "aboutPage.pillarTrackingBody":
    "Eau, repas et mesures dans votre compte ; progrès validés par le coach.",
  "aboutPage.waPrefillAbout": "Bonjour {brand}, je souhaite en savoir plus sur vous.",
  "aboutPage.jsonLdDescription": "{brand} — distributeur Herbal Kapıda indépendant.",
  "seo.products": "Produits",
  "seo.productsDescription":
    "Packs nutrition, sets et produits Formule. Garantie distributeur indépendant.",
  "seo.blog": "Publications",
  "seo.blogDescription": "Conseils nutrition, guides packs et articles bien-être.",
  "seo.searchTitle": "Recherche : {query}",
  "seo.searchDescription": "Résultats produits pour « {query} » — {brand}.",
  "seo.categoryDescription": "Produits dans {categoryName} — {brand}.",
  "seo.blogTagTitle": "Publications · {tag}",
  "seo.blogTagDescription": "Articles étiquetés « {tag} » — {brand}.",
  "seo.pageSuffix": " · Page {page}",
  "seo.categoryNotFound": "Catégorie introuvable",
  "seo.catalogLoading": "Chargement du catalogue…",
  "seo.aboutJsonLdDescription": "{brand} — distributeur Herbal Kapıda indépendant.",
  "seo.keywordsCatalogDefault.0": "catalogue",
  "seo.keywordsCatalogDefault.1": "produits",
  "seo.keywordsCatalogDefault.2": "packs",
  "seo.keywordsCatalogDefault.3": "sets",
  "seo.keywordsCategoryExtra.0": "produit",
  "seo.keywordsCategoryExtra.1": "pack",
  "seo.keywordsBlog.0": "articles",
  "seo.keywordsBlog.1": "nutrition",
  "coachingPage.breadcrumbCoaching": "Accompagnement",
  "aria.notifications": "Alertes",
  "siteSearch.quickBlog": "Publications",
  "siteSearch.sectionBlog": "Publications",
  "notificationsPage.breadcrumb": "Compte / Alertes",
  "notificationsPage.subtitle": "Alertes",
  "accountTabs.ariaLabel": "Sections du compte",
};

const EN_FR_FIX = {
  Contact: "Nous contacter",
  Coaching: "Accompagnement",
  Articles: "Publications",
  Notifications: "Alertes",
  Pagination: "Pages",
  Media: "Médias",
  Client: "Client·e",
  Map: "Carte",
  Coupon: "Code promo",
  Email: "E-mail",
  Tip: "Astuce",
  Transfer: "Virement",
  Confirmation: "Confirmation",
  Support: "Assistance",
  Feedback: "Retours",
  Community: "Communauté",
  Legal: "Juridique",
  Products: "Produits",
  Shipment: "Expédition",
  Shipping: "Livraison",
  Discount: "Remise",
  Subtotal: "Sous-total",
  Total: "Total",
  Cancel: "Annuler",
  Approved: "Approuvé",
  Rejected: "Refusé",
  Completed: "Terminé",
  Details: "Détails",
  Preferences: "Préférences",
  Inbox: "Boîte de réception",
  Version: "Version",
  Tags: "Étiquettes",
  Featured: "À la une",
  General: "Général",
  Technical: "Technique",
  Subject: "Objet",
  Message: "Message",
  Phone: "Téléphone",
  Address: "Adresse",
  Hours: "Horaires",
  Stock: "Stock",
  Price: "Prix",
  Note: "Note",
  Order: "Commande",
  Code: "Code",
  Status: "Statut",
  Live: "En direct",
  Finish: "Terminer",
  Skip: "Ignorer",
  Cart: "Panier",
  Search: "Rechercher",
  Close: "Fermer",
  Edit: "Modifier",
  Delete: "Supprimer",
  Save: "Enregistrer",
  Loading: "Chargement…",
  Redirecting: "Redirection…",
  Sending: "Envoi…",
  Looking: "Recherche…",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parsePath(pathStr) {
  const parts = [];
  const re = /([^.[\]]+)|\[(\d+)\]/g;
  let m;
  while ((m = re.exec(pathStr)) !== null) {
    if (m[1]) parts.push(m[1]);
    else if (m[2] !== undefined) parts.push(Number(m[2]));
  }
  return parts;
}

function setPath(obj, dotPath, value) {
  const parts = parsePath(dotPath);
  let c = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    c = c[parts[i]];
  }
  c[parts[parts.length - 1]] = value;
}

function flatWithArrays(o, p = "") {
  const r = {};
  for (const k of Object.keys(o)) {
    const key = p ? `${p}.${k}` : k;
    const v = o[k];
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") {
          Object.assign(r, flatWithArrays(item, `${key}[${i}]`));
        } else {
          r[`${key}[${i}]`] = item;
        }
      });
    } else if (v && typeof v === "object") {
      Object.assign(r, flatWithArrays(v, key));
    } else {
      r[key] = v;
    }
  }
  return r;
}

function protect(text) {
  const tokens = [];
  let out = text;
  for (const re of [/\{[a-zA-Z0-9_]+\}/g, /https?:\/\/[^\s]+/g]) {
    out = out.replace(re, (m) => {
      const id = tokens.length;
      tokens.push(m);
      return `__T${id}__`;
    });
  }
  for (const term of KEEP) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(re, (m) => {
      const id = tokens.length;
      tokens.push(m);
      return `__T${id}__`;
    });
  }
  return { out, tokens };
}

function restore(text, tokens) {
  let r = text;
  for (let i = 0; i < tokens.length; i++) {
    r = r.replaceAll(`__T${i}__`, tokens[i]);
  }
  return r;
}

async function myMemory(text) {
  const { out, tokens } = protect(text);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(out)}&langpair=en|fr`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  let translated = data?.responseData?.translatedText;
  if (!translated || /MYMEMORY WARNING/i.test(translated)) {
    throw new Error("quota");
  }
  translated = restore(translated, tokens);
  if (translated === text && EN_FR_FIX[text.trim()]) {
    return EN_FR_FIX[text.trim()];
  }
  return translated;
}

/** Add missing keys from en structure only — never overwrite existing fr leaf values. */
function mergeStructure(target, source) {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv)) {
      if (tv && typeof tv === "object" && !Array.isArray(tv)) {
        mergeStructure(tv, sv);
      } else if (tv === undefined) {
        target[key] = structuredClone(sv);
      }
    } else if (tv === undefined) {
      target[key] = structuredClone(sv);
    }
  }
  return target;
}

async function main() {
  const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
  let fr = JSON.parse(fs.readFileSync(frPath, "utf8"));
  fr = mergeStructure(fr, structuredClone(en));

  let fileMap = {};
  if (fs.existsSync(mapPath)) {
    fileMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  }

  const fe = flatWithArrays(en);
  const ff = flatWithArrays(fr);

  const pending = Object.keys(fe).filter((k) => {
    if (typeof fe[k] !== "string") return false;
    if (ff[k] !== fe[k]) return false;
    if (EXACT_OK.has(fe[k])) return false;
    return true;
  });

  console.log(`Pending: ${pending.length}`);

  for (const k of pending) {
    if (TRANSLATIONS[k]) {
      setPath(fr, k, TRANSLATIONS[k]);
    }
  }

  const still = pending.filter((k) => {
    const parts = parsePath(k);
    let c = fr;
    for (const p of parts) c = c[p];
    return c === fe[k];
  });

  const byEnglish = new Map();
  for (const k of still) {
    const enText = fe[k];
    if (fileMap[enText]) {
      setPath(fr, k, fileMap[enText]);
      continue;
    }
    if (!byEnglish.has(enText)) byEnglish.set(enText, []);
    byEnglish.get(enText).push(k);
  }

  const unique = [...byEnglish.entries()];
  console.log(`Auto-translate ${unique.length} unique strings…`);

  const CONC = 8;
  for (let i = 0; i < unique.length; i += CONC) {
    const chunk = unique.slice(i, i + CONC);
    await Promise.all(
      chunk.map(async ([enText, paths]) => {
        let frText = enText;
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            frText = await myMemory(enText);
            break;
          } catch {
            await sleep(1500 * (attempt + 1));
          }
        }
        if (frText === enText && EN_FR_FIX[enText.trim()]) {
          frText = EN_FR_FIX[enText.trim()];
        }
        fileMap[enText] = frText;
        for (const p of paths) setPath(fr, p, frText);
      }),
    );
    if ((i / CONC) % 5 === 0) {
      fs.writeFileSync(mapPath, `${JSON.stringify(fileMap, null, 2)}\n`, "utf8");
      fs.writeFileSync(frPath, `${JSON.stringify(fr, null, 2)}\n`, "utf8");
      console.log(`  ${Math.min(i + CONC, unique.length)}/${unique.length}`);
    }
    await sleep(400);
  }

  fs.writeFileSync(mapPath, `${JSON.stringify(fileMap, null, 2)}\n`, "utf8");
  fs.writeFileSync(frPath, `${JSON.stringify(fr, null, 2)}\n`, "utf8");
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
