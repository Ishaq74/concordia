/**
 * fix-legal-i18n.mjs
 * Adds i18n keys for all hardcoded legal page paragraphs (FR/EN/ES/AR)
 * and modifies legal.astro to use them.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const i18nDir = resolve(root, 'src/i18n');

// ── Legal content translations ──────────────────────────────────────────────
const legalContent = {
  legalIntro: {
    fr: "Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, nous tenons à vous informer de l'identité des différents intervenants impliqués dans la réalisation et le suivi du site \"Recrutement Gagnant\".",
    en: "In accordance with the provisions of Law No. 2004-575 of June 21, 2004, on Confidence in the Digital Economy, we wish to inform you of the identity of the various parties involved in the creation and monitoring of the \"Recrutement Gagnant\" website.",
    es: "De conformidad con las disposiciones de la Ley n.° 2004-575 del 21 de junio de 2004 para la confianza en la economía digital, deseamos informarle de la identidad de los distintos intervinientes implicados en la realización y seguimiento del sitio \"Recrutement Gagnant\".",
    ar: "وفقًا لأحكام القانون رقم 2004-575 المؤرخ في 21 يونيو 2004 بشأن الثقة في الاقتصاد الرقمي، نود إبلاغكم بهوية مختلف الأطراف المشاركة في إنشاء ومتابعة موقع \"Recrutement Gagnant\"."
  },
  siteIdentityText: {
    fr: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit convallis nunc neque, bibendum pulvinar vitae commodo velit. Proin diam tortor sed malesuada nunc, habitant. Dignissim ipsum porta enim, magna urna, quam.",
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit convallis nunc neque, bibendum pulvinar vitae commodo velit. Proin diam tortor sed malesuada nunc, habitant. Dignissim ipsum porta enim, magna urna, quam.",
    es: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit convallis nunc neque, bibendum pulvinar vitae commodo velit. Proin diam tortor sed malesuada nunc, habitant. Dignissim ipsum porta enim, magna urna, quam.",
    ar: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit convallis nunc neque, bibendum pulvinar vitae commodo velit. Proin diam tortor sed malesuada nunc, habitant. Dignissim ipsum porta enim, magna urna, quam."
  },
  hostingText: {
    fr: "Le Site est hébergé par la société Site.Data.faq_legales.hebergement.societe, située au Site.Data.faq_legales.hebergement.adresse (contact téléphonique ou email : Site.Data.faq_legales.hebergement.contact).",
    en: "The Website is hosted by Site.Data.faq_legales.hebergement.societe, located at Site.Data.faq_legales.hebergement.adresse (phone or email contact: Site.Data.faq_legales.hebergement.contact).",
    es: "El Sitio web está alojado por la empresa Site.Data.faq_legales.hebergement.societe, ubicada en Site.Data.faq_legales.hebergement.adresse (contacto telefónico o email: Site.Data.faq_legales.hebergement.contact).",
    ar: "يتم استضافة الموقع من قبل شركة Site.Data.faq_legales.hebergement.societe، الكائنة في Site.Data.faq_legales.hebergement.adresse (للتواصل هاتفيًا أو عبر البريد الإلكتروني: Site.Data.faq_legales.hebergement.contact)."
  },
  publicationDirectorText: {
    fr: "Le Directeur de la publication du Site est Site.Data.faq_legales.directeur_publication.",
    en: "The Publication Director of the Website is Site.Data.faq_legales.directeur_publication.",
    es: "El Director de publicación del Sitio es Site.Data.faq_legales.directeur_publication.",
    ar: "مدير النشر للموقع هو Site.Data.faq_legales.directeur_publication."
  },
  personalDataText: {
    fr: "Le traitement de vos données à caractère personnel est régi par notre Politique de Confidentialité, disponible dans la section « Politique de Confidentialité », conformément au Règlement Général sur la Protection des Données 2016/679 du 27 avril 2016 (« RGPD »).",
    en: "The processing of your personal data is governed by our Privacy Policy, available in the \"Privacy Policy\" section, in accordance with the General Data Protection Regulation 2016/679 of April 27, 2016 (\"GDPR\").",
    es: "El tratamiento de sus datos personales se rige por nuestra Política de Privacidad, disponible en la sección \"Política de Privacidad\", de conformidad con el Reglamento General de Protección de Datos 2016/679 del 27 de abril de 2016 (\"RGPD\").",
    ar: "تخضع معالجة بياناتك الشخصية لسياسة الخصوصية الخاصة بنا، المتاحة في قسم \"سياسة الخصوصية\"، وفقًا للائحة العامة لحماية البيانات 2016/679 المؤرخة في 27 أبريل 2016 (\"GDPR\")."
  },
  disputesText1: {
    fr: "En cas de litige entre le professionnel et le consommateur, ceux-ci s'efforceront de trouver une solution amiable. A défaut d'accord amiable, le consommateur a la possibilité de saisir gratuitement le médiateur de la consommation dont relève le professionnel, à savoir Site.Data.faq_legales.mediateur.nom, dans un délai d'un an à compter de la réclamation écrite adressée au professionnel. La saisine du médiateur de la consommation devra s'effectuer : - soit en complétant le formulaire prévu à cet effet sur le site internet de Site.Data.faq_legales.mediateur.site - soit par courrier adressé à Site.Data.faq_legales.mediateur.adresse.",
    en: "In the event of a dispute between the professional and the consumer, both parties shall endeavor to find an amicable solution. Failing an amicable agreement, the consumer may freely refer the matter to the consumer mediator for the professional, namely Site.Data.faq_legales.mediateur.nom, within one year from the date of the written complaint sent to the professional. The referral to the consumer mediator may be made: - either by completing the form provided for this purpose on the website of Site.Data.faq_legales.mediateur.site - or by mail sent to Site.Data.faq_legales.mediateur.adresse.",
    es: "En caso de litigio entre el profesional y el consumidor, ambos se esforzarán por encontrar una solución amistosa. A falta de acuerdo amistoso, el consumidor tiene la posibilidad de recurrir gratuitamente al mediador de consumo del profesional, a saber, Site.Data.faq_legales.mediateur.nom, en un plazo de un año a partir de la reclamación escrita dirigida al profesional. El recurso al mediador de consumo deberá efectuarse: - completando el formulario previsto en el sitio web de Site.Data.faq_legales.mediateur.site - o por correo dirigido a Site.Data.faq_legales.mediateur.adresse.",
    ar: "في حالة نزاع بين المحترف والمستهلك، يسعى الطرفان إلى إيجاد حل ودي. في حالة عدم التوصل إلى اتفاق ودي، يمكن للمستهلك اللجوء مجانًا إلى وسيط الاستهلاك التابع للمحترف، وهو Site.Data.faq_legales.mediateur.nom، في غضون سنة واحدة من تاريخ الشكوى الكتابية الموجهة إلى المحترف. يتم اللجوء إلى وسيط الاستهلاك: - إما بملء النموذج المخصص لهذا الغرض على موقع Site.Data.faq_legales.mediateur.site - أو بالبريد الموجه إلى Site.Data.faq_legales.mediateur.adresse."
  },
  companyInfoText: {
    fr: "L'entreprise XYZ, située au 123 rue Principale, 75000 Ville, France, est responsable du traitement des données personnelles collectées sur ce site.",
    en: "XYZ Company, located at 123 Main Street, 75000 City, France, is responsible for processing personal data collected on this website.",
    es: "La empresa XYZ, ubicada en 123 calle Principal, 75000 Ciudad, Francia, es responsable del tratamiento de los datos personales recopilados en este sitio.",
    ar: "شركة XYZ، الكائنة في 123 الشارع الرئيسي، 75000 المدينة، فرنسا، هي المسؤولة عن معالجة البيانات الشخصية التي يتم جمعها على هذا الموقع."
  },
  dataCollectionText: {
    fr: "Nous collectons des données personnelles telles que le nom, l'adresse e-mail, l'adresse postale, etc., uniquement dans le cadre de la fourniture de nos services et produits, et avec le consentement explicite de l'utilisateur.",
    en: "We collect personal data such as name, email address, postal address, etc., solely for the purpose of providing our services and products, and with the explicit consent of the user.",
    es: "Recopilamos datos personales como el nombre, la dirección de correo electrónico, la dirección postal, etc., únicamente en el marco de la prestación de nuestros servicios y productos, y con el consentimiento explícito del usuario.",
    ar: "نقوم بجمع البيانات الشخصية مثل الاسم وعنوان البريد الإلكتروني والعنوان البريدي وما إلى ذلك، فقط في إطار تقديم خدماتنا ومنتجاتنا، وبموافقة صريحة من المستخدم."
  },
  dataCollectionPurposeText: {
    fr: "Les données personnelles collectées sont utilisées dans le but de fournir nos services, de traiter les commandes, d'améliorer notre site et nos produits, et de communiquer avec nos utilisateurs.",
    en: "Personal data collected is used for the purpose of providing our services, processing orders, improving our website and products, and communicating with our users.",
    es: "Los datos personales recopilados se utilizan con el fin de proporcionar nuestros servicios, procesar los pedidos, mejorar nuestro sitio y nuestros productos, y comunicarnos con nuestros usuarios.",
    ar: "تُستخدم البيانات الشخصية المجمعة بغرض تقديم خدماتنا ومعالجة الطلبات وتحسين موقعنا ومنتجاتنا والتواصل مع مستخدمينا."
  },
  consentText: {
    fr: "En utilisant ce site, vous consentez à la collecte et au traitement de vos données personnelles conformément à notre politique de confidentialité.",
    en: "By using this website, you consent to the collection and processing of your personal data in accordance with our privacy policy.",
    es: "Al utilizar este sitio, usted consiente la recopilación y el tratamiento de sus datos personales de conformidad con nuestra política de privacidad.",
    ar: "باستخدام هذا الموقع، فإنك توافق على جمع بياناتك الشخصية ومعالجتها وفقًا لسياسة الخصوصية الخاصة بنا."
  },
  dataUsageText: {
    fr: "Les données personnelles sont utilisées uniquement aux fins spécifiées lors de la collecte et sont protégées conformément aux lois sur la protection des données en vigueur.",
    en: "Personal data is used solely for the purposes specified at the time of collection and is protected in accordance with applicable data protection laws.",
    es: "Los datos personales se utilizan únicamente para los fines especificados en el momento de la recopilación y están protegidos de conformidad con las leyes de protección de datos vigentes.",
    ar: "تُستخدم البيانات الشخصية فقط للأغراض المحددة وقت الجمع وتكون محمية وفقًا لقوانين حماية البيانات المعمول بها."
  },
  dataSharingText: {
    fr: "Nous ne partageons pas vos données personnelles avec des tiers, sauf dans les cas prévus par la loi ou avec votre consentement explicite.",
    en: "We do not share your personal data with third parties, except in cases provided by law or with your explicit consent.",
    es: "No compartimos sus datos personales con terceros, salvo en los casos previstos por la ley o con su consentimiento explícito.",
    ar: "لا نشارك بياناتك الشخصية مع أطراف ثالثة، إلا في الحالات المنصوص عليها قانونًا أو بموافقتك الصريحة."
  },
  userRightsText: {
    fr: "Vous avez le droit d'accéder à vos données personnelles, de les corriger, de les supprimer et de vous opposer à leur traitement. Pour exercer ces droits, veuillez nous contacter à [adresse e-mail].",
    en: "You have the right to access, correct, delete, and object to the processing of your personal data. To exercise these rights, please contact us at [email address].",
    es: "Usted tiene derecho a acceder a sus datos personales, corregirlos, eliminarlos y oponerse a su tratamiento. Para ejercer estos derechos, póngase en contacto con nosotros en [dirección de correo electrónico].",
    ar: "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها والاعتراض على معالجتها. لممارسة هذه الحقوق، يرجى الاتصال بنا على [عنوان البريد الإلكتروني]."
  },
  cookiesText: {
    fr: "Ce site utilise des cookies et d'autres technologies de suivi pour améliorer votre expérience de navigation et pour collecter des informations sur la manière dont vous utilisez le site.",
    en: "This website uses cookies and other tracking technologies to improve your browsing experience and to collect information about how you use the site.",
    es: "Este sitio utiliza cookies y otras tecnologías de seguimiento para mejorar su experiencia de navegación y para recopilar información sobre cómo utiliza el sitio.",
    ar: "يستخدم هذا الموقع ملفات تعريف الارتباط وتقنيات التتبع الأخرى لتحسين تجربة التصفح وجمع معلومات حول كيفية استخدامك للموقع."
  },
  policyUpdatesText: {
    fr: "Cette politique de confidentialité peut être mise à jour périodiquement pour refléter les changements dans nos pratiques en matière de confidentialité. Toute modification importante sera clairement indiquée sur cette page.",
    en: "This privacy policy may be updated periodically to reflect changes in our privacy practices. Any significant changes will be clearly indicated on this page.",
    es: "Esta política de privacidad puede actualizarse periódicamente para reflejar los cambios en nuestras prácticas de privacidad. Cualquier modificación importante se indicará claramente en esta página.",
    ar: "قد يتم تحديث سياسة الخصوصية هذه بشكل دوري لتعكس التغييرات في ممارساتنا المتعلقة بالخصوصية. سيتم الإشارة بوضوح إلى أي تعديلات مهمة على هذه الصفحة."
  },
  contactDetailsPrivacyText: {
    fr: "Si vous avez des questions ou des préoccupations concernant notre politique de confidentialité, veuillez nous contacter à [adresse e-mail] ou par courrier à [adresse postale].",
    en: "If you have any questions or concerns about our privacy policy, please contact us at [email address] or by mail at [postal address].",
    es: "Si tiene preguntas o inquietudes sobre nuestra política de privacidad, contáctenos en [dirección de correo electrónico] o por correo postal a [dirección postal].",
    ar: "إذا كانت لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية الخاصة بنا، يرجى الاتصال بنا على [عنوان البريد الإلكتروني] أو عبر البريد على [العنوان البريدي]."
  },
  scopeText: {
    fr: "Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les commandes passées par le client (ci-après dénommé \"le Client\") auprès de l'entreprise XYZ (ci-après dénommée \"le Vendeur\") via le site web [URL du site].",
    en: "These General Terms and Conditions of Sale (GTC) apply to all orders placed by the customer (hereinafter referred to as \"the Customer\") with XYZ company (hereinafter referred to as \"the Seller\") via the website [website URL].",
    es: "Las presentes Condiciones Generales de Venta (CGV) se aplican a todos los pedidos realizados por el cliente (en adelante denominado \"el Cliente\") a la empresa XYZ (en adelante denominada \"el Vendedor\") a través del sitio web [URL del sitio].",
    ar: "تنطبق شروط وأحكام البيع العامة هذه على جميع الطلبات المقدمة من العميل (المشار إليه فيما بعد بـ \"العميل\") لدى شركة XYZ (المشار إليها فيما بعد بـ \"البائع\") عبر الموقع الإلكتروني [رابط الموقع]."
  },
  ordersText: {
    fr: "Le Client peut passer commande via le site web [URL du site]. Toute commande implique l'acceptation expresse et sans réserve des présentes CGV.",
    en: "The Customer may place orders via the website [website URL]. Any order implies express and unreserved acceptance of these GTC.",
    es: "El Cliente puede realizar pedidos a través del sitio web [URL del sitio]. Cualquier pedido implica la aceptación expresa y sin reservas de las presentes CGV.",
    ar: "يمكن للعميل تقديم الطلبات عبر الموقع الإلكتروني [رابط الموقع]. يعني أي طلب القبول الصريح وغير المشروط لهذه الشروط والأحكام."
  },
  pricingText: {
    fr: "Les prix des produits sont indiqués en euros toutes taxes comprises (TTC). Le Vendeur se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.",
    en: "Product prices are indicated in euros including all taxes (TTC). The Seller reserves the right to modify prices at any time, but products will be invoiced based on the rates in effect at the time of order validation.",
    es: "Los precios de los productos se indican en euros con todos los impuestos incluidos (IVA incluido). El Vendedor se reserva el derecho de modificar sus precios en cualquier momento, pero los productos se facturarán según las tarifas vigentes en el momento de la validación del pedido.",
    ar: "تُعرض أسعار المنتجات باليورو شاملة جميع الضرائب. يحتفظ البائع بالحق في تعديل أسعاره في أي وقت، ولكن سيتم إصدار الفواتير على أساس الأسعار السارية في وقت تأكيد الطلب."
  },
  paymentText: {
    fr: "Le paiement s'effectue en ligne par carte bancaire ou tout autre moyen de paiement sécurisé accepté par le Vendeur. La commande ne sera traitée qu'après réception du paiement.",
    en: "Payment is made online by credit card or any other secure payment method accepted by the Seller. The order will only be processed after receipt of payment.",
    es: "El pago se efectúa en línea mediante tarjeta bancaria o cualquier otro medio de pago seguro aceptado por el Vendedor. El pedido solo se procesará tras la recepción del pago.",
    ar: "يتم الدفع عبر الإنترنت بالبطاقة المصرفية أو أي وسيلة دفع آمنة أخرى يقبلها البائع. لن تتم معالجة الطلب إلا بعد استلام الدفع."
  },
  deliveryText: {
    fr: "Les produits seront livrés à l'adresse indiquée par le Client lors de la commande. Les délais de livraison sont donnés à titre indicatif et peuvent varier en fonction du lieu de livraison et de la disponibilité des produits.",
    en: "Products will be delivered to the address provided by the Customer at the time of order. Delivery times are given as an indication and may vary depending on the delivery location and product availability.",
    es: "Los productos se entregarán en la dirección indicada por el Cliente en el momento del pedido. Los plazos de entrega se proporcionan a título indicativo y pueden variar en función del lugar de entrega y la disponibilidad de los productos.",
    ar: "سيتم تسليم المنتجات إلى العنوان الذي يحدده العميل عند الطلب. مواعيد التسليم تقريبية وقد تختلف حسب مكان التسليم وتوفر المنتجات."
  },
  withdrawalText: {
    fr: "Conformément à la législation en vigueur, le Client dispose d'un délai de [nombre de jours] jours pour exercer son droit de rétractation à compter de la réception des produits, sans avoir à justifier de motifs ni à payer de pénalités.",
    en: "In accordance with applicable legislation, the Customer has [number of days] days to exercise their right of withdrawal from the receipt of the products, without having to justify any reason or pay any penalties.",
    es: "De conformidad con la legislación vigente, el Cliente dispone de un plazo de [número de días] días para ejercer su derecho de desistimiento a partir de la recepción de los productos, sin necesidad de justificar motivos ni pagar penalizaciones.",
    ar: "وفقًا للتشريعات المعمول بها، يحق للعميل الانسحاب خلال [عدد الأيام] يومًا من استلام المنتجات، دون الحاجة إلى تبرير الأسباب أو دفع أي غرامات."
  },
  warrantyText: {
    fr: "Les produits vendus sont soumis à la garantie légale de conformité et à la garantie des vices cachés prévues par la loi. En cas de non-conformité ou de vice caché, le Client peut choisir entre la réparation, le remplacement ou le remboursement du produit.",
    en: "Products sold are subject to the legal guarantee of conformity and the guarantee against hidden defects as provided by law. In case of non-conformity or hidden defect, the Customer may choose between repair, replacement, or refund of the product.",
    es: "Los productos vendidos están sujetos a la garantía legal de conformidad y a la garantía por vicios ocultos previstas por la ley. En caso de no conformidad o vicio oculto, el Cliente puede elegir entre la reparación, la sustitución o el reembolso del producto.",
    ar: "تخضع المنتجات المباعة لضمان المطابقة القانوني وضمان العيوب الخفية المنصوص عليهما قانونًا. في حالة عدم المطابقة أو وجود عيب خفي، يمكن للعميل الاختيار بين الإصلاح أو الاستبدال أو استرداد ثمن المنتج."
  },
  liabilityText: {
    fr: "Le Vendeur ne saurait être tenu pour responsable des dommages directs ou indirects causés par l'utilisation des produits vendus. La responsabilité du Vendeur est limitée au montant de la commande.",
    en: "The Seller shall not be held liable for direct or indirect damages caused by the use of the products sold. The Seller's liability is limited to the order amount.",
    es: "El Vendedor no será responsable de los daños directos o indirectos causados por el uso de los productos vendidos. La responsabilidad del Vendedor se limita al importe del pedido.",
    ar: "لا يتحمل البائع المسؤولية عن الأضرار المباشرة أو غير المباشرة الناجمة عن استخدام المنتجات المباعة. تقتصر مسؤولية البائع على مبلغ الطلب."
  },
  disputesText2: {
    fr: "En cas de litige, une solution amiable sera recherchée en priorité. À défaut d'accord amiable, le litige sera soumis aux tribunaux compétents.",
    en: "In the event of a dispute, an amicable solution will be sought as a priority. Failing an amicable agreement, the dispute will be submitted to the competent courts.",
    es: "En caso de litigio, se buscará una solución amistosa como prioridad. A falta de acuerdo amistoso, el litigio se someterá a los tribunales competentes.",
    ar: "في حالة النزاع، سيتم البحث عن حل ودي كأولوية. في حالة عدم التوصل إلى اتفاق ودي، يُحال النزاع إلى المحاكم المختصة."
  },
  contactDetailsTermsText: {
    fr: "Pour toute question ou réclamation concernant les CGV, le Client peut contacter le Vendeur par e-mail à [adresse e-mail] ou par courrier à [adresse postale].",
    en: "For any questions or complaints regarding the GTC, the Customer may contact the Seller by email at [email address] or by mail at [postal address].",
    es: "Para cualquier pregunta o reclamación relativa a las CGV, el Cliente puede contactar al Vendedor por correo electrónico a [dirección de correo electrónico] o por correo postal a [dirección postal].",
    ar: "لأي استفسارات أو شكاوى تتعلق بالشروط والأحكام، يمكن للعميل الاتصال بالبائع عبر البريد الإلكتروني على [عنوان البريد الإلكتروني] أو عبر البريد على [العنوان البريدي]."
  }
};

// ── Add keys to JSON files ──────────────────────────────────────────────────
const locales = ['fr', 'en', 'es', 'ar'];
let totalAdded = 0;

for (const locale of locales) {
  const jsonPath = resolve(i18nDir, `${locale}.json`);
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  
  if (!data.legalPage) data.legalPage = {};
  if (!data.legalPage.content) data.legalPage.content = {};
  
  let added = 0;
  for (const [key, translations] of Object.entries(legalContent)) {
    if (!data.legalPage.content[key]) {
      data.legalPage.content[key] = translations[locale];
      added++;
    }
  }
  
  writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  ${locale}.json: +${added} keys added to legalPage.content`);
  totalAdded += added;
}

console.log(`\n✅ Total: ${totalAdded} keys added across all locales`);

// ── Now modify legal.astro ──────────────────────────────────────────────────
const legalPath = resolve(root, 'src/pages/[lang]/auth/legal.astro');
let astro = readFileSync(legalPath, 'utf8');

// Map of hardcoded text → i18n expression
const replacements = [
  // Section 1: Mentions Légales
  {
    old: `                <p class="cs-text">\n                    Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, nous tenons à vous informer de l'identité des différents intervenants impliqués dans la réalisation et le suivi du site "Recrutement Gagnant".\n                </p>`,
    new: `                <p class="cs-text">\n                    {t.legalPage?.content?.legalIntro ?? "Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, nous tenons à vous informer de l'identité des différents intervenants impliqués dans la réalisation et le suivi du site \\"Recrutement Gagnant\\"."}\n                </p>`
  },
  {
    old: `                        <p class="cs-item-p">\n                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit convallis nunc neque, bibendum pulvinar vitae commodo velit. Proin diam tortor sed malesuada nunc, habitant. Dignissim ipsum porta enim, magna urna, quam. \n                        </p>`,
    new: `                        <p class="cs-item-p">\n                            {t.legalPage?.content?.siteIdentityText ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}\n                        </p>`
  },
  {
    old: `                        <p class="cs-item-p">\n                            Le Site est hébergé par la société Site.Data.faq_legales.hebergement.societe, située au Site.Data.faq_legales.hebergement.adresse (contact téléphonique ou email : Site.Data.faq_legales.hebergement.contact ).`,
    new: `                        <p class="cs-item-p">\n                            {t.legalPage?.content?.hostingText ?? "Le Site est hébergé par la société Site.Data.faq_legales.hebergement.societe."}`
  },
  {
    old: `                        <p class="cs-item-p">\n                            Le Directeur de la publication du Site est Site.Data.faq_legales.directeur_publication.\n                        </p>`,
    new: `                        <p class="cs-item-p">\n                            {t.legalPage?.content?.publicationDirectorText ?? "Le Directeur de la publication du Site est Site.Data.faq_legales.directeur_publication."}\n                        </p>`
  },
  {
    old: `                        <p class="cs-item-p">\n                            Le traitement de vos données à caractère personnel est régi par notre Politique de Confidentialité, disponible dans la section « Politique de Confidentialité », conformément au Règlement Général sur la Protection des Données 2016/679 du 27 avril 2016 (« RGPD »).\n                        </p>`,
    new: `                        <p class="cs-item-p">\n                            {t.legalPage?.content?.personalDataText ?? "Le traitement de vos données à caractère personnel est régi par notre Politique de Confidentialité."}\n                        </p>`
  },
];

// Apply simple string replacements
let replaced = 0;
for (const r of replacements) {
  if (astro.includes(r.old)) {
    astro = astro.replace(r.old, r.new);
    replaced++;
  }
}

// Now handle the more complex paragraphs with regex
const regexReplacements = [
  // Disputes text (section 1 - long multiline)
  {
    pattern: /(<p class="cs-item-p">)\s*En cas de litige entre le professionnel et le consommateur[\s\S]*?La saisine du médiateur[\s\S]*?Site\.Data\.faq_legales\.mediateur\.adresse\s*\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.disputesText1 ?? "En cas de litige entre le professionnel et le consommateur, ceux-ci s'efforceront de trouver une solution amiable."}\n                        $2`
  },
  // Privacy section paragraphs
  {
    pattern: /(<p class="cs-item-p">)\s*L'entreprise XYZ, située au 123 rue Principale[\s\S]*?collectées sur ce site\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.companyInfoText ?? "L'entreprise XYZ est responsable du traitement des données personnelles."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Nous collectons des données personnelles telles que le nom[\s\S]*?consentement explicite de l'utilisateur\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.dataCollectionText ?? "Nous collectons des données personnelles avec le consentement de l'utilisateur."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Les données personnelles collectées sont utilisées dans le but de fournir[\s\S]*?communiquer avec nos utilisateurs\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.dataCollectionPurposeText ?? "Les données sont utilisées pour fournir nos services."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*En utilisant ce site, vous consentez[\s\S]*?politique de confidentialité\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.consentText ?? "En utilisant ce site, vous consentez à notre politique de confidentialité."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Les données personnelles sont utilisées uniquement aux fins[\s\S]*?protection des données en vigueur\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.dataUsageText ?? "Les données sont utilisées aux fins spécifiées lors de la collecte."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Nous ne partageons pas vos données personnelles avec des tiers[\s\S]*?consentement explicite\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.dataSharingText ?? "Nous ne partageons pas vos données avec des tiers."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Vous avez le droit d'accéder à vos données personnelles[\s\S]*?\[adresse e-mail\]\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.userRightsText ?? "Vous avez le droit d'accéder à vos données personnelles."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Ce site utilise des cookies et d'autres technologies[\s\S]*?utilisez le site\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.cookiesText ?? "Ce site utilise des cookies."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Cette politique de confidentialité peut être mise à jour[\s\S]*?indiquée sur cette page\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.policyUpdatesText ?? "Cette politique peut être mise à jour périodiquement."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Si vous avez des questions ou des préoccupations concernant notre politique[\s\S]*?\[adresse postale\]\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.contactDetailsPrivacyText ?? "Contactez-nous pour toute question sur notre politique de confidentialité."}\n                        $2`
  },
  // Terms section paragraphs
  {
    pattern: /(<p class="cs-item-p">)\s*Les présentes Conditions Générales de Vente \(CGV\) s'appliquent[\s\S]*?\[URL du site\]\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.scopeText ?? "Les présentes CGV s'appliquent à toutes les commandes."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Le Client peut passer commande via le site web[\s\S]*?sans réserve des présentes CGV\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.ordersText ?? "Le Client peut passer commande via le site web."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Les prix des produits sont indiqués en euros[\s\S]*?validation de la commande\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.pricingText ?? "Les prix sont indiqués en euros TTC."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Le paiement s'effectue en ligne[\s\S]*?réception du paiement\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.paymentText ?? "Le paiement s'effectue en ligne."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Les produits seront livrés à l'adresse[\s\S]*?disponibilité des produits\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.deliveryText ?? "Les produits seront livrés à l'adresse indiquée."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Conformément à la législation en vigueur, le Client dispose[\s\S]*?payer de pénalités\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.withdrawalText ?? "Le Client dispose d'un droit de rétractation."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Les produits vendus sont soumis à la garantie légale[\s\S]*?remboursement du produit\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.warrantyText ?? "Les produits sont soumis aux garanties légales."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Le Vendeur ne saurait être tenu pour responsable[\s\S]*?montant de la commande\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.liabilityText ?? "Le Vendeur n'est pas responsable des dommages indirects."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*En cas de litige, une solution amiable sera recherchée en priorité[\s\S]*?tribunaux compétents\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.disputesText2 ?? "En cas de litige, une solution amiable sera recherchée."}\n                        $2`
  },
  {
    pattern: /(<p class="cs-item-p">)\s*Pour toute question ou réclamation concernant les CGV[\s\S]*?\[adresse postale\]\.\s*(<\/p>)/,
    replacement: `$1\n                            {t.legalPage?.content?.contactDetailsTermsText ?? "Contactez le Vendeur pour toute question sur les CGV."}\n                        $2`
  }
];

for (const r of regexReplacements) {
  if (r.pattern.test(astro)) {
    astro = astro.replace(r.pattern, r.replacement);
    replaced++;
  } else {
    console.log(`  ⚠️ Pattern not matched: ${r.pattern.toString().slice(0, 60)}...`);
  }
}

writeFileSync(legalPath, astro, 'utf8');
console.log(`\n✅ legal.astro: ${replaced} paragraphs replaced with i18n keys`);
