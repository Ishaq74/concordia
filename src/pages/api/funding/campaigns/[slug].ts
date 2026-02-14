import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { fundingCampaign, donation } from "@database/schemas";
import { eq, and, sql, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const prerender = false;

/** Get campaign detail with donation stats. */
export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();

  const campaigns = await db
    .select()
    .from(fundingCampaign)
    .where(eq(fundingCampaign.slug, slug))
    .limit(1);

  if (campaigns.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const campaign = campaigns[0];

  const donorCount = await db
    .select({ count: sql<number>`count(DISTINCT ${donation.donorId})` })
    .from(donation)
    .where(eq(donation.campaignId, campaign.id));

  const recentDonations = await db
    .select()
    .from(donation)
    .where(
      and(
        eq(donation.campaignId, campaign.id),
        eq(donation.isAnonymous, false),
      ),
    )
    .orderBy(desc(donation.createdAt))
    .limit(10);

  return new Response(
    JSON.stringify({
      ...campaign,
      donorCount: Number(donorCount[0]?.count ?? 0),
      recentDonations,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Make a donation to a campaign. */
export const POST: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.amount || parseFloat(body.amount) <= 0) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "amount must be positive" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  const campaigns = await db
    .select()
    .from(fundingCampaign)
    .where(eq(fundingCampaign.slug, slug))
    .limit(1);

  if (campaigns.length === 0 || campaigns[0].status !== "active") {
    return new Response(
      JSON.stringify({ error: "BIZ_NOT_FOUND", message: "Campaign not found or not active" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const campaign = campaigns[0];
  const amount = parseFloat(body.amount);
  const donationId = randomUUID();

  await db.insert(donation).values({
    id: donationId,
    campaignId: campaign.id,
    donorId: session.user.id,
    amount: amount.toString(),
    message: body.message ?? null,
    isAnonymous: body.isAnonymous ?? false,
  });

  // Update campaign currentAmount
  const newAmount = parseFloat(campaign.raisedAmount ?? "0") + amount;
  const updates: Record<string, unknown> = {
    raisedAmount: newAmount.toFixed(2),
    donorCount: sql`${fundingCampaign.donorCount} + 1`,
  };

  // Auto-fund if goal reached
  if (newAmount >= parseFloat(campaign.goalAmount)) {
    updates.status = "funded";
    updates.fundedAt = new Date();
  }

  await db.update(fundingCampaign).set(updates).where(eq(fundingCampaign.id, campaign.id));

  return new Response(
    JSON.stringify({ id: donationId, campaignCurrentAmount: newAmount.toFixed(2) }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
