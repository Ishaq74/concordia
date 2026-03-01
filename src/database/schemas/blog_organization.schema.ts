import { pgTable, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";

/**
 * Blog Organization — Schema.org Organization-compatible table.
 * Stores comprehensive org data including identity, contact, legal,
 * relationships, policies, and SEO metadata.
 */
export const blogOrganizations = pgTable("blog_organizations", {
  // --- Identity ---
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  alternateName: jsonb("alternate_name"), // string[]
  description: jsonb("description"), // { fr, en, ... }
  url: text("url"),
  logo: text("logo"),
  image: text("image"),
  slogan: jsonb("slogan"), // { fr, en, ... }

  // --- Contact ---
  email: text("email"),
  telephone: text("telephone"),
  faxNumber: text("fax_number"),
  address: jsonb("address"), // { streetAddress, addressLocality, addressRegion, postalCode, addressCountry }
  contactPoint: jsonb("contact_point"), // [{ contactType, telephone, email, hoursAvailable }]

  // --- Legal & Identifiers ---
  legalName: jsonb("legal_name"), // { fr, en, ... }
  taxID: text("tax_id"),
  vatID: text("vat_id"),
  leiCode: text("lei_code"),
  duns: text("duns"),
  isicV4: text("isic_v4"),
  naics: text("naics"),
  nonprofitStatus: text("nonprofit_status"),

  // --- People & Structure ---
  founder: jsonb("founder"), // string | string[]
  foundingDate: timestamp("founding_date"),
  foundingLocation: text("founding_location"),
  numberOfEmployees: integer("number_of_employees"),
  employee: jsonb("employee"), // string[]
  alumni: jsonb("alumni"), // string[]
  parentOrganization: text("parent_organization"),
  subOrganization: jsonb("sub_organization"), // string[]
  department: jsonb("department"), // string[]

  // --- Business ---
  owns: jsonb("owns"), // string[]
  brand: jsonb("brand"), // string[]
  makesOffer: jsonb("makes_offer"), // string[]
  seeks: jsonb("seeks"), // string[]
  hasOfferCatalog: jsonb("has_offer_catalog"), // string[]
  areaServed: jsonb("area_served"), // string[]
  serviceArea: jsonb("service_area"), // string[]

  // --- Awards & Credentials ---
  award: jsonb("award"), // string[]
  hasCredential: jsonb("has_credential"), // string[]

  // --- Knowledge & Languages ---
  knowsLanguage: jsonb("knows_language"), // string[]
  knowsAbout: jsonb("knows_about"), // string[]
  keywords: text("keywords"),

  // --- Memberships & Same-as ---
  memberOf: jsonb("member_of"), // string[]
  sameAs: jsonb("same_as"), // string[] (social links)

  // --- Policies (Schema.org NewsMediaOrganization) ---
  publishingPrinciples: text("publishing_principles"),
  actionableFeedbackPolicy: text("actionable_feedback_policy"),
  correctionsPolicy: text("corrections_policy"),
  diversityPolicy: text("diversity_policy"),
  ethicsPolicy: text("ethics_policy"),
  masthead: text("masthead"),
  missionCoveragePrioritiesPolicy: text("mission_coverage_priorities_policy"),
  noBylinesPolicy: text("no_bylines_policy"),
  ownershipFundingInfo: text("ownership_funding_info"),
  unnamedSourcesPolicy: text("unnamed_sources_policy"),
  verificationFactCheckingPolicy: text("verification_fact_checking_policy"),
  diversityStaffingReport: text("diversity_staffing_report"),

  // --- Ratings & Interaction ---
  aggregateRating: jsonb("aggregate_rating"), // { ratingValue, bestRating, worstRating, ratingCount }
  interactionStatistic: jsonb("interaction_statistic"), // [{ interactionType, userInteractionCount }]
  review: jsonb("review"), // string[]
  event: jsonb("event"), // string[]

  // --- Display flags ---
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),

  // --- Timestamps ---
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
