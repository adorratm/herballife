import type { LegalSeller } from "@/lib/legal-content";

/** English fallback legal copy when CMS content is missing or placeholder. */
export function buildLegalFallbackEn(
  seller: LegalSeller,
): Record<string, { title: string; content: string }> {
  return {
    kvkk: {
      title: "KVKK Privacy Notice",
      content: `${seller.name} processes personal data under Turkish Law No. 6698 on the Protection of Personal Data (KVKK). Data is used only as needed for orders, delivery, customer support, payments, and legal obligations.

Data controller: ${seller.name}
Address: ${seller.address}
Contact: ${seller.email} · ${seller.phone}

Your rights: Under KVKK Art. 11 you may request access, correction, deletion, restriction, objection, and lodge a complaint. Send requests to ${seller.email}.`,
    },
    "cerez-politikasi": {
      title: "Cookie Policy",
      content: `This Cookie Policy explains how ${seller.name} (“we”) uses cookies on ${seller.website}, in line with KVKK and applicable rules.

1. What are cookies?
Small text files stored by your browser to keep sessions, carts, security, and measure performance.

2. Types we use
a) Strictly necessary: core site functions (session, cart, security, language).
b) Functional: remember preferences.
c) Analytics / performance: anonymous or pseudonymous usage stats; no marketing profiling without consent.
d) Payment / security: PayTR and similar providers may set their own security cookies for 3D Secure and fraud prevention.

3. Managing cookies
You can delete or block cookies in browser settings. Blocking required cookies may break cart, login, and checkout. Update optional choices in the consent panel.

4. Retention
Session cookies expire when you close the browser. Persistent cookies are kept for reasonable periods then deleted or anonymized.

5. Third parties
Carriers, PayTR, email/SMS, analytics, and hosting partners may use cookies only as needed to provide the service.

6. Contact
Cookie and KVKK requests: ${seller.email}

Last updated: ${new Date().getFullYear()}`,
    },
    "mesafeli-satis": {
      title: "Distance Sales Agreement",
      content: `This Distance Sales Agreement is concluded under Turkish Consumer Protection Law No. 6502 and the Distance Contracts Regulation between the seller below and the buyer placing an order online.

1.1 Seller
Name: ${seller.name}
Address: ${seller.address}
Phone: ${seller.phone}
Email: ${seller.email}
Web: ${seller.website}
Tax office / No: ${seller.taxOffice} / ${seller.taxNumber}
MERSİS: ${seller.mersis}

1.2 Buyer
The natural or legal person identified in the order form.

Subject: Sale and delivery of products/services ordered on the seller’s website at the price shown in the order summary.

Formation: The buyer confirms the pre-contract information and this agreement, then completes payment. The contract is formed when payment is approved.

Price & delivery: Details, VAT, shipping, and total are shown at checkout. Delivery to the buyer’s address via the selected carrier.

Payment: Card payments via PayTR; card data is not stored on our servers; 3D Secure may apply.

Withdrawal: 14 days from delivery without giving a reason (exceptions under the Regulation, e.g. opened food/supplements, personalized goods).

Defective goods: Statutory remedies apply (repair, replacement, refund, or price reduction).

Disputes: Consumer arbitration committees and consumer courts at the buyer’s residence; written complaints to the seller.

Seller: ${seller.name}`,
    },
    "on-bilgilendirme": {
      title: "Pre-contract Information Form",
      content: `Under Turkish Law No. 6502 and the Distance Contracts Regulation, the following information is provided before you order.

SELLER
${seller.name}
${seller.address}
Tel: ${seller.phone} · Email: ${seller.email}
Tax: ${seller.taxOffice} / ${seller.taxNumber}

PRODUCTS
Type, quantity, and price are shown in the cart and payment screen. Products ship in original packaging under proper storage conditions.

TOTAL PRICE
Product price, discounts, shipping, and taxes are shown as the total before payment. No extra charges after payment.

PAYMENT
Secure card payment via PayTR.

DELIVERY
To your order address via the selected carrier; estimated times are shown on the product or checkout page.

WITHDRAWAL
14 days from delivery; exceptions are listed in the Distance Sales Agreement and Returns Policy.

COMPLAINTS
${seller.email} · ${seller.phone}. Consumer arbitration and courts are available.

By confirming, you acknowledge that you have read this form.`,
    },
    "iptal-iade": {
      title: "Cancellation & Returns Policy",
      content: `${seller.name} follows Turkish consumer law and the Distance Contracts Regulation.

1. Order cancellation
Before payment or before shipment, email ${seller.email} to cancel. Paid unshipped orders are refunded.

2. Withdrawal (14 days)
From delivery date, withdraw without reason via ${seller.email} (order no., name, optional reason).

3. Non-returnable / limited items
Opened food/supplements where hygiene prevents resale; personalized goods; spoiled goods not stored properly; used or damaged items (except defects).

4. Return shipment
After approval, send items in resalable condition with invoice to the address we provide. Return shipping per our policy; defective items: seller pays shipping.

5. Refunds
Within 14 days after we receive and inspect the return, to the original payment method. Bank posting times may vary.

6. Damaged delivery
Note damage with the carrier and report within 48 hours to ${seller.email} with photos/video.

7. Contact
${seller.name} · ${seller.address}
${seller.email} · ${seller.phone}`,
    },
    "musteri-memnuniyeti": {
      title: "Customer Satisfaction Policy",
      content: `${seller.name} commits to quality, transparency, and fast support for original Herbalife products.

1. Principles
Clear order and delivery information; hygienic packaging; timely responses; full consumer rights compliance.

2. Support
Email: ${seller.email}
Phone: ${seller.phone}
Hours: ${seller.hours}

3. Complaints
Send your order number; initial response within 3 business days; resolution may include replacement, reshipment, or refund; outcome confirmed in writing.

4. Quality
Packaging, expiry, or product defects handled under statutory defect rules at no cost to you.

5. Feedback
Surveys and email feedback processed in line with KVKK.

This policy works together with the Distance Sales Agreement and Returns Policy.`,
    },
    "guvenli-alisveris": {
      title: "Secure Shopping",
      content: `Shopping at ${seller.name} is protected by technical, legal, and operational measures.

1. PayTR payments
Card payments via PayTR virtual POS / iFrame. Card numbers, CVV, and expiry are not sent to or stored on our servers. SSL/TLS encryption; 3D Secure supported. PayTR operates under PCI-DSS.

2. Site security
Admin and customer accounts use authentication; suspicious sessions may trigger extra checks.

3. Personal data
Order and delivery data processed under KVKK; see Privacy Policy, KVKK notice, and Privacy Notice pages.

4. Fraud prevention
Unusual orders may be held for verification contact.

5. Records
Order and payment records kept for legal retention periods; order summary emailed.

6. Tips
Shop only on our official domain; avoid “remember me” on shared PCs; check HTTPS on payment pages; never share card details by email or phone.

7. Support
Security concerns: ${seller.email}

Payment: PayTR · Major card schemes supported (subject to your bank’s installment rules).`,
    },
    "aydinlatma-metni": {
      title: "Privacy Notice (KVKK Art. 10)",
      content: `Under KVKK Art. 10, ${seller.name} (“Data Controller”) informs you about processing of personal data:

1. Controller
${seller.name}
${seller.address}
${seller.email} · ${seller.phone}

2. Data processed
Identity, contact, order/payment data, security logs, cookies (optional cookies only with consent).

3. Purposes
Order fulfilment, payment, invoicing, shipping, support, legal duties, information (marketing only with separate consent), security and fraud prevention.

4. Legal bases
KVKK Art. 5/2: contract, legal obligation, legitimate interest; consent where required.

5. Transfers
Carriers, PayTR, email/SMS, hosting, and authorities when legally required — limited to purpose.

6. Retention
For statutory and processing periods, then deletion or anonymization.

7. Your rights (KVKK Art. 11)
Access, rectification, erasure, restriction, learn recipients, object, claim damages. Apply: ${seller.email}

8. Response time
Applications answered within 30 days at the latest.`,
    },
    gizlilik: {
      title: "Privacy Policy",
      content: `${seller.name} respects your privacy. This policy explains how we collect, use, and protect data from visitors, members, and customers.

1. Information we collect
Account and order details, delivery address, order contents, payment results (not card numbers), technical logs, and cookies.

2. Use
Service delivery, orders and support, legal compliance, security, marketing with consent, site improvement.

3. Sharing
Only with partners needed to fulfil the service (PayTR, carriers, communications) and authorities when required. We do not sell your data.

4. Security
SSL, access controls, and PCI-DSS compliant payment processing.

5. Children
Not directed at under-18s.

6. Changes
Updates published on this page.

7. Contact
${seller.email} · ${seller.phone}
${seller.address}

The KVKK notice and Cookie Policy form part of this document.`,
    },
  };
}
