/** Generate de-value-map.json (EN string -> DE string) */
import fs from "fs";

const M = {};
const t = (en, de) => {
  M[en] = de;
};

// --- batch 1 ---
t(" incl.", " inkl.");
t(" · Out", " · Ausverkauft");
t(" · Page {page}", " · Seite {page}");
t(" · default", " · Standard");
t(" · default billing", " · Standard-Rechnung");
t(" · default delivery", " · Standard-Lieferung");
t("(VAT included)", "(inkl. MwSt.)");
t("+ Add new address", "+ Neue Adresse hinzufügen");
t("+ New billing address", "+ Neue Rechnungsadresse");
t(
  "100% original Herbalife products with independent distributor assurance.",
  "100 % original Herbalife-Produkte mit unabhängiger Vertriebspartner-Garantie.",
);
t("14-day withdrawal right", "14-tägiges Widerrufsrecht");
t("256-bit SSL", "256-Bit-SSL");
t("30 seconds", "30 Sekunden");
t("A healthy routine in 3 steps", "Eine gesunde Routine in 3 Schritten");
t(
  "A quick star rating and sentence on Google makes a big difference for local visibility.",
  "Eine kurze Sternebewertung und ein Satz auf Google verbessern die lokale Sichtbarkeit deutlich.",
);
t(
  "A short Google review helps local visibility. Scan the QR code or use the link below.",
  "Eine kurze Google-Bewertung stärkt die lokale Sichtbarkeit. Scannen Sie den QR-Code oder nutzen Sie den Link unten.",
);
t("About", "Über uns");
t("About us", "Über uns");
t("Account", "Konto");
t("Account / {tab}", "Konto / {tab}");
t(
  "Active stories from the last 24 hours — tap for full view.",
  "Aktive Stories der letzten 24 Stunden — tippen für Vollansicht.",
);
t("Add", "Hinzufügen");
t("Add address", "Adresse hinzufügen");
t("Add to cart", "In den Warenkorb");
t("Added to cart", "In den Warenkorb gelegt");
t("Added to cart ✓", "In den Warenkorb gelegt ✓");
t("Adding…", "Wird hinzugefügt…");
t("Address", "Adresse");
t("Address label", "Adressbezeichnung");
t("Addresses", "Adressen");
t("All", "Alle");
t("All articles", "Alle Artikel");
t("All products", "Alle Produkte");
t("All products →", "Alle Produkte →");
t("All rights reserved.", "Alle Rechte vorbehalten.");
t("Aloe, tea, and fiber drinks", "Aloe-, Tee- und Ballaststoffgetränke");
t("Already a member?", "Bereits registriert?");
t("Amount (TRY)", "Betrag (TRY)");
t("Apply", "Anwenden");
t("Article", "Artikel");
t("Articles", "Artikel");
t("Articles · {tag}", "Artikel · {tag}");
t("Ask on WhatsApp", "Auf WhatsApp fragen");
t(
  "Ask on WhatsApp — typical reply under 1 hour",
  "Auf WhatsApp fragen — Antwort meist innerhalb einer Stunde",
);
t(
  "At least 2 characters · arrow keys and Enter",
  "Mindestens 2 Zeichen · Pfeiltasten und Eingabe",
);
t("Back to my account", "Zurück zu meinem Konto");
t("Back to shop", "Zurück zum Shop");
t("Back to sign in", "Zurück zur Anmeldung");
t("Bank accounts", "Bankkonten");
t("Best price in the last 30 days", "Bester Preis der letzten 30 Tage");
t("Billing", "Rechnung");
t("Billing (optional)", "Rechnung (optional)");
t("Billing address", "Rechnungsadresse");
t(
  "Billing details will match the delivery address.",
  "Rechnungsdaten entsprechen der Lieferadresse.",
);
t("Black", "Schwarz");
t("Blog", "Blog");
t("Bright green", "Leuchtgrün");
t("Browse bundles", "Sets durchstöbern");
t(
  "Browse bundles or return to all articles.",
  "Sets durchstöbern oder zu allen Artikeln zurück.",
);
t("Browse catalog", "Katalog durchstöbern");
t("Browse products", "Produkte durchstöbern");
t(
  "Bundle recommendations for your goal and one-to-one WhatsApp coaching.",
  "Set-Empfehlungen für Ihr Ziel und persönliches WhatsApp-Coaching.",
);
t(
  "Business invoice (e-invoice / e-archive)",
  "Geschäftsrechnung (E-Rechnung / E-Archiv)",
);
t("Buy now", "Jetzt kaufen");
t("Call", "Anrufen");
t("Campaign", "Aktion");
t("Cancel", "Abbrechen");
t("Carrier", "Versanddienstleister");
t("Carrier page", "Seite des Versanddienstleisters");
t("Cart", "Warenkorb");
t("Catalog", "Katalog");
t("Categories", "Kategorien");
t("Category", "Kategorie");
t("Category not found", "Kategorie nicht gefunden");
t("Change password", "Passwort ändern");
t("Checkout", "Kasse");
t(
  "Choose a saved address or add a new one.",
  "Gespeicherte Adresse wählen oder neue hinzufügen.",
);
t("City", "Stadt");
t("Clear", "Zurücksetzen");
t("Clear filters", "Filter zurücksetzen");
t("Close", "Schließen");
t("Close WhatsApp", "WhatsApp schließen");
t("Close account", "Konto schließen");
t("Close chat", "Chat schließen");
t("Close menu", "Menü schließen");
t("Close search", "Suche schließen");
t("Closing…", "Wird geschlossen…");
t("Code pending", "Code ausstehend");
t("Collapse", "Einklappen");
t(
  "Common questions about products, orders, shipping, and nutrition tracking.",
  "Häufige Fragen zu Produkten, Bestellungen, Versand und Ernährungstracking.",
);
t("Community", "Community");
t("Company name", "Firmenname");
t("Complete with {name}", "Ergänzen mit {name}");
t("Confirm", "Bestätigen");
t("Contact", "Kontakt");
t("Contact form", "Kontaktformular");
t("Continue", "Weiter");
t("Continue shopping", "Weiter einkaufen");
t("Continue with Google", "Mit Google fortfahren");
t(
  "Continue with email or connect with Google.",
  "Mit E-Mail fortfahren oder mit Google verbinden.",
);
t("Continue your routine with products", "Setzen Sie Ihre Routine mit Produkten fort");
t("Corporate invoice (optional)", "Firmenrechnung (optional)");
t(
  "Could not add to cart. Check your connection.",
  "Konnte nicht in den Warenkorb gelegt werden. Bitte Verbindung prüfen.",
);
t("Could not close account", "Konto konnte nicht geschlossen werden");
t("Could not delete", "Löschen fehlgeschlagen");
t(
  "Could not load cart. Check your connection and try again.",
  "Warenkorb konnte nicht geladen werden. Verbindung prüfen und erneut versuchen.",
);
t(
  "Could not look up order. Check your details.",
  "Bestellung konnte nicht abgerufen werden. Angaben prüfen.",
);
t("Could not move to favorites.", "Verschieben zu Favoriten fehlgeschlagen.");
t("Could not remove item.", "Artikel konnte nicht entfernt werden.");
t("Could not save address", "Adresse konnte nicht gespeichert werden");
t("Could not save email.", "E-Mail konnte nicht gespeichert werden.");
t("Could not send request. Try again later.", "Anfrage konnte nicht gesendet werden. Später erneut versuchen.");
t("Could not set default", "Standard konnte nicht gesetzt werden");
t("Could not set default address.", "Standardadresse konnte nicht gesetzt werden.");
t(
  "Could not start payment. Check your connection.",
  "Zahlung konnte nicht gestartet werden. Verbindung prüfen.",
);
t("Could not update password", "Passwort konnte nicht aktualisiert werden");
t(
  "Could not update password. The link may have expired.",
  "Passwort konnte nicht aktualisiert werden. Der Link ist möglicherweise abgelaufen.",
);
t("Could not update quantity.", "Menge konnte nicht aktualisiert werden.");
t("Coupon code", "Gutscheincode");
t("Create account", "Konto erstellen");
t("Creating…", "Wird erstellt…");
t("Current password", "Aktuelles Passwort");
t("Deal", "Angebot");
t("Default billing", "Standard-Rechnung");
t("Default billing address", "Standard-Rechnungsadresse");
t("Default delivery", "Standard-Lieferung");
t("Default delivery address", "Standard-Lieferadresse");
t("Delete", "Löschen");
t("Delete account", "Konto löschen");
t("Delete account?", "Konto löschen?");
t("Delete address?", "Adresse löschen?");
t("Delete my account", "Mein Konto löschen");
t("Deleting…", "Wird gelöscht…");
t("Delivery", "Lieferung");
t("Delivery address", "Lieferadresse");
t(
  "Delivery and billing addresses for checkout.",
  "Liefer- und Rechnungsadressen für den Checkout.",
);
t("Delivery and payment", "Lieferung und Zahlung");
t("Delivery method", "Lieferart");
t("Discount", "Rabatt");
t("Discount ({code})", "Rabatt ({code})");
t("Distributor pick", "Empfehlung des Vertriebspartners");
t(
  "Distributor {name} can give you personalized answers.",
  "Vertriebspartner {name} kann Ihnen persönliche Antworten geben.",
);
t("District", "Bezirk");
t("Don't have an account?", "Noch kein Konto?");
t("Edit", "Bearbeiten");
t("Edit address", "Adresse bearbeiten");
t("Email (optional)", "E-Mail (optional)");
t("Email saved.", "E-Mail gespeichert.");
t(
  "Enter the email on your account. For Google accounts you can set a password; otherwise we send a reset link valid for 1 hour.",
  "Geben Sie die E-Mail Ihres Kontos ein. Bei Google-Konten können Sie ein Passwort setzen; sonst senden wir einen Link (1 Stunde gültig).",
);
t(
  "Enter the tracking code from your order email or account.",
  "Geben Sie den Sendungscode aus Ihrer Bestell-E-Mail oder Ihrem Konto ein.",
);
t("Enter your current password.", "Geben Sie Ihr aktuelles Passwort ein.");
t("Explore products", "Produkte entdecken");
t("FAQ", "FAQ");
t("Fast dispatch on business days", "Schneller Versand an Werktagen");
t("Fast shipping", "Schneller Versand");
t("Fast shipping · Secure PayTR checkout", "Schneller Versand · Sicherer PayTR-Checkout");
t("Favorites", "Favoriten");
t("Featured", "Empfohlen");
t("Filter / Search", "Filter / Suche");
t("Finish", "Fertig");
t("First name", "Vorname");
t("Flavor note (info)", "Geschmackshinweis (Info)");
t("Flavor options", "Geschmacksoptionen");
t("Follow on Instagram", "Auf Instagram folgen");
t("Follow-up via WhatsApp", "Betreuung per WhatsApp");
t("For your address book,", "Für Ihr Adressbuch");
t("Forgot password", "Passwort vergessen");
t("Form / type", "Form / Art");
t("Formula 1 and bundles · Ask us", "Formula 1 und Sets · Fragen Sie uns");
t("Formula and program products", "Formula- und Programmprodukte");
t("Free coaching support", "Kostenlose Coaching-Betreuung");
t("Free shipping over {amount}", "Kostenloser Versand ab {amount}");
t(
  "Free shipping over {amount} · Secure PayTR checkout",
  "Kostenloser Versand ab {amount} · Sicherer PayTR-Checkout",
);
t("Free · Collect when ready", "Kostenlos · Abholung wenn bereit");
t("Frequently asked questions", "Häufig gestellte Fragen");
t(
  "Frequently asked questions about {brand}: products, bundles, shipping, and nutrition tracking.",
  "Häufige Fragen zu {brand}: Produkte, Sets, Versand und Ernährungstracking.",
);
t("Frequently bought together", "Häufig zusammen gekauft");
t(
  "From shopping to tracking — simple process, ongoing support.",
  "Vom Einkauf bis zum Tracking — einfacher Ablauf, dauerhafte Betreuung.",
);
t("Full name", "Vollständiger Name");
t("Gallery picks", "Galerie-Auswahl");
t("Genuine product", "Originalprodukt");
t("Genuine product guarantee", "Originalprodukt-Garantie");
t("Genuine products", "Originalprodukte");
t("Genuine products · Door delivery", "Originalprodukte · Lieferung an die Tür");
t("Gift bundles", "Geschenk-Sets");
t(
  "Gift bundles and Formula products — we choose a program that fits your needs.",
  "Geschenk-Sets und Formula-Produkte — wir wählen ein passendes Programm für Sie.",
);
t("Gift included", "Geschenk inklusive");
t("Go to catalog", "Zum Katalog");
t("Go to products", "Zu den Produkten");
t("Google Business", "Google Business");
t("Google review", "Google-Bewertung");
t("Google review QR code", "QR-Code für Google-Bewertung");
t("HBL-…", "HBL-…");
t("Have a tracking code?", "Sendungscode vorhanden?");
t("Health tracking", "Gesundheitstracking");
t("Healthy living", "Gesundes Leben");
t(
  "Hello {brand}, I would like to learn more about you.",
  "Hallo {brand}, ich möchte mehr über Sie erfahren.",
);
t("Hello — how can we help you today?", "Hallo — wie können wir Ihnen heute helfen?");
t(
  "Hello, I have a question about nutrition tracking.",
  "Hallo, ich habe eine Frage zum Ernährungstracking.",
);
t(
  "Hello, I have a question about shipping times and delivery options.",
  "Hallo, ich habe eine Frage zu Lieferzeiten und Versandoptionen.",
);
t("Hello, I have a question beyond the FAQ.", "Hallo, ich habe eine Frage über die FAQ hinaus.");
t(
  "Hello, I would like an update on my order status.",
  "Hallo, ich möchte eine Aktualisierung zu meinem Bestellstatus.",
);
t("Hello, I'm writing about {brand}.", "Hallo, ich schreibe wegen {brand}.");
t("Hello, I'm writing to you.", "Hallo, ich schreibe Ihnen.");
t("Hello, I’d like the Google review link.", "Hallo, ich hätte gern den Google-Bewertungslink.");
t(
  "Hello, can you suggest products / bundles for my goals?",
  "Hallo, können Sie Produkte / Sets für meine Ziele empfehlen?",
);
t("Herbal Kapıda · WhatsApp support", "Herbal Kapıda · WhatsApp-Support");
t("Herbal Kapıda — We're here for you", "Herbal Kapıda — Wir sind für Sie da");
t("Herbal Kapıda — WhatsApp line is open.", "Herbal Kapıda — WhatsApp-Leitung ist geöffnet.");
t("Herbalife ID", "Herbalife ID");
t("Hi! Message us for product and bundle suggestions.", "Hi! Schreiben Sie uns für Produkt- und Set-Vorschläge.");
t("Home", "Startseite");
t("Home, Work", "Zuhause, Arbeit");
t(
  "Honest feedback on product quality, shipping, and coaching support matters.",
  "Ehrliches Feedback zu Produktqualität, Versand und Coaching zählt.",
);
t("Hours", "Öffnungszeiten");
t("How we work", "So arbeiten wir");
t("I accept the", "Ich akzeptiere den");
t("I do not need a separate billing address", "Ich benötige keine separate Rechnungsadresse");
t("I have read and accept the", "Ich habe gelesen und akzeptiere die");
t("I have read the", "Ich habe gelesen:");
t(
  "If the email is registered, we sent a link. Check inbox and spam. Google sign-up users can also set a password with this link.",
  "Wenn die E-Mail registriert ist, haben wir einen Link gesendet. Posteingang und Spam prüfen. Google-Nutzer können damit auch ein Passwort setzen.",
);
t("Independent distributor", "Unabhängiger Vertriebspartner");
t("Instagram feed coming soon.", "Instagram-Feed demnächst.");
t("Instagram posts", "Instagram-Beiträge");
t("Instagram posts not synced yet.", "Instagram-Beiträge noch nicht synchronisiert.");
t(
  "Instagram posts, stories, and selected images from {brand}.",
  "Instagram-Beiträge, Stories und ausgewählte Bilder von {brand}.",
);
t("Instagram stories", "Instagram-Stories");
t("Instagram stories will appear here soon.", "Instagram-Stories erscheinen hier demnächst.");
t("Invalid coupon", "Ungültiger Gutschein");
t("Invalid reset link.", "Ungültiger Reset-Link.");
t("Items in your cart", "Artikel in Ihrem Warenkorb");
t("KVKK", "KVKK");
t("Key ingredients", "Wichtige Inhaltsstoffe");
t("Label", "Bezeichnung");
t("Last name", "Nachname");
t("Last sync:", "Letzte Synchronisation:");
t("Learn about special bundles.", "Erfahren Sie mehr über spezielle Sets.");
t("Legal", "Rechtliches");
t("Legal confirmations", "Rechtliche Bestätigungen");
t(
  "Live WhatsApp for nutrition and product questions.",
  "Live-WhatsApp für Ernährungs- und Produktfragen.",
);
t("Live support", "Live-Support");
t("Live tracking", "Live-Verfolgung");
t("Loading account…", "Konto wird geladen…");
t("Loading catalog…", "Katalog wird geladen…");
t("Loading…", "Wird geladen…");
t("Logistics / Tracking", "Logistik / Sendungsverfolgung");
t("Look up", "Abfragen");
t("Looking up…", "Wird abgefragt…");
t("Lot / batch no.", "Charge / Los-Nr.");
t("Marketing (Google Ads / Meta)", "Marketing (Google Ads / Meta)");
t("Media", "Medien");
t(
  "Media content coming soon. Instagram or gallery uploads can be added from the admin panel.",
  "Medieninhalte demnächst. Instagram- oder Galerie-Uploads können im Admin-Bereich hinzugefügt werden.",
);
t("Message on WhatsApp", "Auf WhatsApp schreiben");
t("Mobile menu", "Mobiles Menü");
t("Move to favorites", "Zu Favoriten verschieben");
t("My account", "Mein Konto");
t("My measurements", "Meine Messungen");
t("My orders", "Meine Bestellungen");
t("Name A→Z", "Name A→Z");
t("Name Z→A", "Name Z→A");
t("Nationwide", "Deutschlandweit");
t("Neighborhood", "Stadtteil");
t("New address", "Neue Adresse");
t("New password", "Neues Passwort");
t("New password (again)", "Neues Passwort (wiederholen)");
t("New passwords do not match.", "Neue Passwörter stimmen nicht überein.");
t("New posts coming soon.", "Neue Beiträge demnächst.");
t("Newest", "Neueste");
t("Next", "Weiter");
t("No active Instagram stories right now.", "Derzeit keine aktiven Instagram-Stories.");
t("No content with tag “{tag}”.", "Keine Inhalte mit Tag „{tag}“.");
t("No gallery images yet.", "Noch keine Galeriebilder.");
t("No orders yet.", "Noch keine Bestellungen.");
t("No posts yet", "Noch keine Beiträge");
t("No products in catalog", "Keine Produkte im Katalog");
t("No products match the selected filters.", "Keine Produkte entsprechen den Filtern.");
t("No products to list right now.", "Derzeit keine Produkte aufgelistet.");
t("No questions added yet.", "Noch keine Fragen hinzugefügt.");
t("No results", "Keine Ergebnisse");
t(
  "No results for \"{q}\". Clear filters and try again.",
  "Keine Ergebnisse für „{q}“. Filter zurücksetzen und erneut versuchen.",
);
t("No saved addresses.", "Keine gespeicherten Adressen.");
t(
  "No saved addresses. Add one for delivery and billing.",
  "Keine gespeicherten Adressen. Fügen Sie eine für Lieferung und Rechnung hinzu.",
);
t(
  "No separate billing address will be requested.",
  "Es wird keine separate Rechnungsadresse abgefragt.",
);
t(
  "No token in link. Use the link from your email.",
  "Kein Token im Link. Nutzen Sie den Link aus Ihrer E-Mail.",
);
t("Note (optional)", "Notiz (optional)");
t("Notifications", "Benachrichtigungen");
t(
  "Nutrition bundles, sets, and Formula products. Independent distributor assurance.",
  "Ernährungssets und Formula-Produkte. Garantie unabhängiger Vertriebspartner.",
);
t("Nutrition coaching · WhatsApp", "Ernährungscoaching · WhatsApp");
t("Nutrition notes", "Ernährungstipps");
t(
  "Nutrition routines, bundle tips, and wellness notes.",
  "Ernährungsroutinen, Set-Tipps und Wellness-Notizen.",
);
t(
  "Nutrition tips, bundle guides, and wellness articles.",
  "Ernährungstipps, Set-Ratgeber und Wellness-Artikel.",
);
t("Nutrition tracking", "Ernährungstracking");
t("Nutrition tracking and coach support here.", "Ernährungstracking und Coach-Support hier.");
t("Official distributor assurance", "Offizielle Vertriebspartner-Garantie");
t("Often bought together", "Oft zusammen gekauft");
t("Often viewed with this article", "Oft zusammen mit diesem Artikel angesehen");
t("Only {count} left — limited stock", "Nur noch {count} — begrenzter Bestand");
t("Open WhatsApp", "WhatsApp öffnen");
t("Open menu", "Menü öffnen");
t("Opening hours", "Öffnungszeiten");
t("Order", "Bestellung");
t("Order / Lookup", "Bestellung / Abfrage");
t("Order by {cutoff} — same-day shipping", "Bestellen bis {cutoff} — Versand am selben Tag");
t("Order details", "Bestelldetails");
t("Order no.", "Bestellnr.");
t("Order status", "Bestellstatus");
t("Order summary", "Bestellübersicht");
t("Orders", "Bestellungen");
t(
  "Orders, addresses, and wellness tracking in your account.",
  "Bestellungen, Adressen und Wellness-Tracking in Ihrem Konto.",
);
t("Origin", "Herkunft");
t(
  "Original products, gift bundles, and personalized nutrition support with an independent Herbalife distributor.",
  "Originalprodukte, Geschenk-Sets und persönliche Ernährungsbetreuung bei einem unabhängigen Herbalife-Vertriebspartner.",
);
t(
  "Our goal is not random shelf products — but the right program, sustainable habits, and trusted access.",
  "Unser Ziel sind keine zufälligen Regalprodukte — sondern das richtige Programm, nachhaltige Gewohnheiten und vertrauensvoller Zugang.",
);
t("Our nutrition approach", "Unser Ernährungsansatz");
t("Out of stock", "Nicht auf Lager");
t("Package", "Verpackung");
t("Packages with shaker gift", "Pakete mit Shaker-Geschenk");
t("Page not found", "Seite nicht gefunden");
t("Pages", "Seiten");
t("Pagination", "Seitennummerierung");
t("Password", "Passwort");
t(
  "Password saved. You can sign in with email/password or Google.",
  "Passwort gespeichert. Sie können sich mit E-Mail/Passwort oder Google anmelden.",
);
t(
  "Password set. You can now sign in with email too.",
  "Passwort gesetzt. Sie können sich jetzt auch per E-Mail anmelden.",
);
t("Password updated.", "Passwort aktualisiert.");
t("Passwords do not match.", "Passwörter stimmen nicht überein.");
t("Pay securely", "Sicher bezahlen");
t("Pay securely with PayTR", "Sicher mit PayTR bezahlen");
t("PayTR secure payment", "Sichere PayTR-Zahlung");
t("Payment notice", "Zahlungshinweis");
t("Payment notification", "Zahlungsmitteilung");
t("Payment redirect was not received.", "Zahlungsweiterleitung wurde nicht empfangen.");
t(
  "Permanently deletes your account and personal data per our privacy policy.",
  "Löscht Ihr Konto und personenbezogene Daten gemäß Datenschutzerklärung dauerhaft.",
);
t("Personal program", "Persönliches Programm");
t("Phone", "Telefon");
t("Pick a quick question or type · {phone}", "Schnellfrage wählen oder tippen · {phone}");
t("Pick the right set", "Das passende Set wählen");
t("Pink", "Rosa");
t("Post not found", "Beitrag nicht gefunden");
t("Postal code", "Postleitzahl");
t("Posts tagged “{tag}” — {brand}.", "Beiträge mit Tag „{tag}“ — {brand}.");
t("Preparing checkout…", "Checkout wird vorbereitet…");
t("Previous", "Zurück");
t("Price", "Preis");
t("Price high to low", "Preis absteigend");
t("Price low to high", "Preis aufsteigend");
t("Proceed to checkout", "Zur Kasse");
t("Product", "Produkt");
t("Product advice", "Produktberatung");
t("Product details", "Produktdetails");
t("Product name, bundle…", "Produktname, Set…");
t("Product not found", "Produkt nicht gefunden");
t("Product results for “{query}” — {brand}.", "Produktergebnisse für „{query}“ — {brand}.");
t("Products", "Produkte");
t("Products ({count})", "Produkte ({count})");
t("Products coming soon.", "Produkte demnächst.");
t("Products in {categoryName} — {brand}.", "Produkte in {categoryName} — {brand}.");
t("Products in {name}", "Produkte in {name}");
t("Products, articles, pages…", "Produkte, Artikel, Seiten…");
t(
  "Products, bundles, and healthy living moments. Instagram posts and selected images.",
  "Produkte, Sets und Momente gesunden Lebens. Instagram-Beiträge und ausgewählte Bilder.",
);
t(
  "Products, bundles, and lifestyle moments — tap for full view.",
  "Produkte, Sets und Lifestyle-Momente — tippen für Vollansicht.",
);
t("Progress report", "Fortschrittsbericht");
t("Protein and performance", "Protein und Leistung");
t("Protein bars and snacks", "Proteinriegel und Snacks");
t(
  "Quick search across Formula 1, bundles, and categories.",
  "Schnellsuche in Formula 1, Sets und Kategorien.",
);
t(
  "Reach us on WhatsApp or contact channels for product choice, bundle advice, or wellness tracking.",
  "Erreichen Sie uns per WhatsApp oder Kontaktwege für Produktwahl, Set-Beratung oder Wellness-Tracking.",
);
t("Read", "Weiterlesen");
t("Read article", "Artikel lesen");
t("Read articles", "Artikel lesen");
t("Real experience", "Echte Erfahrung");
t("Redirecting…", "Weiterleitung…");
t("Register", "Registrieren");
t("Registration could not be completed.", "Registrierung konnte nicht abgeschlossen werden.");
t("Related categories", "Verwandte Kategorien");
t("Related products", "Verwandte Produkte");
t("Remove", "Entfernen");
t("Review on Google", "Auf Google bewerten");
t("Review on Google — scan QR code", "Auf Google bewerten — QR-Code scannen");
t("Reviews", "Bewertungen");
t("Reviews help new visitors start with confidence.", "Bewertungen helfen neuen Besuchern, vertrauensvoll zu starten.");
t("Right of withdrawal", "Widerrufsrecht");
t("Same as delivery", "Wie Lieferadresse");
t("Save", "Speichern");
t("Save email", "E-Mail speichern");
t("Save password", "Passwort speichern");
t("Save this address to my address book", "Diese Adresse in meinem Adressbuch speichern");
t("Saving…", "Wird gespeichert…");
t("Scan QR code", "QR-Code scannen");
t("Search", "Suche");
t("Search products", "Produkte suchen");
t("Search “{q}” in catalog →", "„{q}“ im Katalog suchen →");
t("Search, filter, and sort the catalog", "Katalog durchsuchen, filtern und sortieren");
t("Search: {query}", "Suche: {query}");
t("Searching…", "Suche…");
t("Search…", "Suchen…");
t("Secure PayTR payment", "Sichere PayTR-Zahlung");
t("Secure payment", "Sichere Zahlung");
t("Secure payment (PayTR)", "Sichere Zahlung (PayTR)");
t("Secure shopping", "Sicher einkaufen");
t("See all", "Alle anzeigen");
t(
  "Select a saved delivery address or enter a new one.",
  "Gespeicherte Lieferadresse wählen oder neue eingeben.",
);
t("Select a shipping carrier.", "Versanddienstleister wählen.");
t("Send on WhatsApp", "Per WhatsApp senden");
t("Send reset link", "Reset-Link senden");
t("Sender full name", "Vollständiger Name des Absenders");
t("Sending…", "Wird gesendet…");
t("Serving size", "Portionsgröße");
t(
  "Session could not be verified. Please sign in again.",
  "Sitzung konnte nicht bestätigt werden. Bitte melden Sie sich erneut an.",
);
t("Set as billing default", "Als Rechnungs-Standard setzen");
t("Set as default billing", "Als Standard-Rechnung setzen");
t("Set as default delivery", "Als Standard-Lieferung setzen");
t("Set as default delivery address", "Als Standard-Lieferadresse setzen");
t("Set as delivery default", "Als Liefer-Standard setzen");
t("Set password", "Passwort setzen");
t("Shaker color", "Shaker-Farbe");
t("Share your experience", "Teilen Sie Ihre Erfahrung");
t("Share your goal", "Teilen Sie Ihr Ziel");
t(
  "Share your {brand} experience on Google Business Profile.",
  "Teilen Sie Ihre {brand}-Erfahrung im Google Business Profil.",
);
t("Shipment", "Sendung");
t("Shipment record not found.", "Sendungsdatensatz nicht gefunden.");
t("Shipment tracking", "Sendungsverfolgung");
t("Shipping", "Versand");
t("Shipping & delivery", "Versand & Lieferung");
t("Ships in 1–3 business days", "Versand in 1–3 Werktagen");
t("Sign in", "Anmelden");
t("Sign out", "Abmelden");
t("Sign-in failed. Check your details.", "Anmeldung fehlgeschlagen. Angaben prüfen.");
t("Site search", "Seitensuche");
t("Site tour · {current}/{total}", "Seiten-Tour · {current}/{total}");
t("Skip", "Überspringen");
t("Social sign-in", "Social Login");
t("Something else", "Etwas anderes");
t("Sort", "Sortieren");
t("Sports nutrition", "Sportnahrung");
t("Start on WhatsApp", "Per WhatsApp starten");
t("Start with your goal", "Starten Sie mit Ihrem Ziel");
t("Still have a question?", "Noch eine Frage?");
t("Stock", "Bestand");
t("Storage", "Lagerung");
t("Store address", "Adresse des Shops");
t("Store · Free", "Shop · Kostenlos");
t("Subtotal", "Zwischensumme");
t("Summary", "Zusammenfassung");
t("Supplements", "Nahrungsergänzung");
t(
  "Sustainable results come from the right products, consistent tracking, and personal guidance.",
  "Nachhaltige Ergebnisse entstehen durch die richtigen Produkte, konsequentes Tracking und persönliche Begleitung.",
);
t("Tags", "Tags");
t("Target region", "Zielregion");
t("Tax ID", "Steuernummer");
t("Tax office", "Finanzamt");
t(
  "The page you’re looking for may have moved or been removed. Return to the catalog to find what you need.",
  "Die gesuchte Seite wurde verschoben oder entfernt. Kehren Sie zum Katalog zurück.",
);
t(
  "This action cannot be undone. Orders already placed remain on record.",
  "Diese Aktion kann nicht rückgängig gemacht werden. Bereits aufgegebene Bestellungen bleiben gespeichert.",
);
t("This address will be permanently removed.", "Diese Adresse wird dauerhaft entfernt.");
t("Total", "Gesamt");
t("Track order", "Bestellung verfolgen");
t("Track shipment", "Sendung verfolgen");
t("Track your progress", "Fortschritt verfolgen");
t("Tracking code", "Sendungscode");
t("Type", "Typ");
t("Type your message…", "Nachricht eingeben…");
t("Unauthorized", "Nicht autorisiert");
t("Update password", "Passwort aktualisieren");
t("Usage", "Anwendung");
t("Usage tips", "Anwendungstipps");
t(
  "Use your order number and the email from checkout to see status and shipment info.",
  "Mit Bestellnummer und E-Mail aus dem Checkout sehen Sie Status und Sendungsinfo.",
);
t("Verifying…", "Wird überprüft…");
t("Version {version}", "Version {version}");
t("View cart", "Warenkorb ansehen");
t("Vitamins and minerals", "Vitamine und Mineralstoffe");
t(
  "Water, meals, and measurements in your account; progress with coach approval.",
  "Wasser, Mahlzeiten und Messungen in Ihrem Konto; Fortschritt mit Coach-Freigabe.",
);
t(
  "Water, meals, and measurements in your account; your coach reviews and motivates you.",
  "Wasser, Mahlzeiten und Messungen in Ihrem Konto; Ihr Coach prüft und motiviert Sie.",
);
t(
  "We bring original Herbalife products, value bundles, and one-to-one nutrition guidance together.",
  "Wir verbinden original Herbalife-Produkte, Vorteilssets und persönliche Ernährungsberatung.",
);
t("We couldn't find that product", "Produkt nicht gefunden");
t("Weight management", "Gewichtsmanagement");
t(
  "Weight, energy, or sport — we clarify your starting point in a short WhatsApp chat.",
  "Gewicht, Energie oder Sport — wir klären Ihren Startpunkt in einem kurzen WhatsApp-Chat.",
);
t("WhatsApp", "WhatsApp");
t("WhatsApp channel", "WhatsApp-Kanal");
t("WhatsApp chat", "WhatsApp-Chat");
t("WhatsApp support", "WhatsApp-Support");
t("White", "Weiß");
t("Wondering about delivery time? Ask us.", "Fragen zur Lieferzeit? Fragen Sie uns.");
t("You might also like", "Das könnte Ihnen auch gefallen");
t("You must accept the legal confirmations.", "Sie müssen die rechtlichen Bestätigungen akzeptieren.");
t(
  "You signed in with Google. You can set a password here and then sign in with email too. Your Google link stays active.",
  "Sie haben sich mit Google angemeldet. Hier können Sie ein Passwort setzen und sich auch per E-Mail anmelden. Die Google-Verknüpfung bleibt aktiv.",
);
t(
  "You will not be able to sign in. Order history remains in store records for the legal retention period.",
  "Sie können sich nicht mehr anmelden. Bestellhistorie bleibt für die gesetzliche Aufbewahrungsfrist gespeichert.",
);
t(
  "Your account is deactivated and personal data is anonymized. Past order records remain for legal retention. This cannot be undone.",
  "Ihr Konto wird deaktiviert und personenbezogene Daten anonymisiert. Frühere Bestellungen bleiben aus rechtlichen Gründen erhalten. Nicht rückgängig zu machen.",
);
t("Your cart is empty.", "Ihr Warenkorb ist leer.");
t(
  "Your items live here — proceed to checkout when ready.",
  "Ihre Artikel sind hier — zur Kasse, wenn Sie bereit sind.",
);
t("Your message", "Ihre Nachricht");
t("Your shopping cart", "Ihr Warenkorb");
t("distance sales agreement", "Fernabsatzvertrag");
t("information.", "Informationen.");
t("none", "keine");
t("off", "Rabatt");
t("pre-contract information form", "Formular mit vorvertraglichen Informationen");
t("returns policy", "Widerrufs- und Rückgaberichtlinie");
t("sign in", "anmelden");
t("text.", "Text.");
t("with you", "mit Ihnen");
t("{brand} — independent Herbalife distributor.", "{brand} — unabhängiger Herbalife-Vertriebspartner.");
t("{count} items", "{count} Artikel");
t("{count} products", "{count} Produkte");
t("{count} reviews", "{count} Bewertungen");
t("{days}-day returns", "{days}-Tage-Rückgabe");
t(
  "{distributor} · independent Herbalife distributor. This is not the official Herbalife website.",
  "{distributor} · unabhängiger Herbalife-Vertriebspartner. Dies ist nicht die offizielle Herbalife-Website.",
);
t("{minutes} min read", "{minutes} Min. Lesezeit");
t("{name} category →", "Kategorie {name} →");
t("{title} applied", "{title} angewendet");
t("{total} products · Page {page}/{totalPages}", "{total} Produkte · Seite {page}/{totalPages}");
t("“{title}” will be permanently removed.", "„{title}“ wird dauerhaft entfernt.");
t("← Continue shopping", "← Weiter einkaufen");
t("✓ 14-day withdrawal / return right", "✓ 14-tägiges Widerrufs- / Rückgaberecht");
t("✓ Original Herbalife products", "✓ Original Herbalife-Produkte");
t("✓ PayTR 256-bit secure payment", "✓ PayTR 256-Bit sichere Zahlung");

fs.writeFileSync(
  new URL("./de-value-map.json", import.meta.url),
  `${JSON.stringify(M, null, 2)}\n`,
);
console.log("entries", Object.keys(M).length);
