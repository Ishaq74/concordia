import { getDrizzle } from "@database/drizzle";
import { wallet, transaction } from "@database/schemas";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export type TransactionType =
  | "credit"
  | "debit"
  | "commission"
  | "refund"
  | "donation"
  | "transfer";

export interface TransactionInput {
  walletId: string;
  type: TransactionType;
  amount: string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  idempotencyKey?: string;
}

/**
 * Get a user's wallet. Returns null if not found.
 */
export async function getWalletByUserId(userId: string) {
  const db = await getDrizzle();
  const rows = await db
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Credit a wallet (increase balance). Returns the created transaction.
 */
export async function creditWallet(input: TransactionInput): Promise<string> {
  const db = await getDrizzle();
  const txId = randomUUID();

  // Idempotency check
  if (input.idempotencyKey) {
    const existing = await db
      .select({ id: transaction.id })
      .from(transaction)
      .where(eq(transaction.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (existing.length > 0) return existing[0].id;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(wallet)
      .set({
        balance: sql`${wallet.balance}::numeric + ${input.amount}::numeric`,
      })
      .where(eq(wallet.id, input.walletId));

    await tx.insert(transaction).values({
      id: txId,
      walletId: input.walletId,
      type: input.type,
      amount: input.amount,
      description: input.description ?? null,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
    });
  });

  return txId;
}

/**
 * Debit a wallet (decrease balance). Throws if insufficient funds.
 */
export async function debitWallet(input: TransactionInput): Promise<string> {
  const db = await getDrizzle();
  const txId = randomUUID();

  if (input.idempotencyKey) {
    const existing = await db
      .select({ id: transaction.id })
      .from(transaction)
      .where(eq(transaction.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (existing.length > 0) return existing[0].id;
  }

  await db.transaction(async (tx) => {
    const [w] = await tx
      .select({ balance: wallet.balance })
      .from(wallet)
      .where(eq(wallet.id, input.walletId))
      .for("update");

    if (!w) throw new Error("Wallet not found");

    const currentBalance = parseFloat(w.balance);
    const debitAmount = parseFloat(input.amount);

    if (currentBalance < debitAmount) {
      throw new Error("BIZ_INSUFFICIENT_BALANCE");
    }

    await tx
      .update(wallet)
      .set({
        balance: sql`${wallet.balance}::numeric - ${input.amount}::numeric`,
      })
      .where(eq(wallet.id, input.walletId));

    await tx.insert(transaction).values({
      id: txId,
      walletId: input.walletId,
      type: input.type,
      amount: input.amount,
      description: input.description ?? null,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
    });
  });

  return txId;
}

/**
 * Get transaction history for a wallet.
 */
export async function getWalletTransactions(
  walletId: string,
  options: { limit?: number; offset?: number } = {},
) {
  const db = await getDrizzle();
  const { limit = 20, offset = 0 } = options;
  const { desc } = await import("drizzle-orm");

  return db
    .select()
    .from(transaction)
    .where(eq(transaction.walletId, walletId))
    .orderBy(desc(transaction.createdAt))
    .limit(limit)
    .offset(offset);
}
