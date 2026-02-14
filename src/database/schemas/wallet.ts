import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  numeric,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "credit",
  "debit",
  "commission",
  "refund",
  "donation",
  "transfer",
]);

export const wallet = pgTable(
  "wallet",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    balance: numeric("balance", { precision: 12, scale: 2 })
      .default("0.00")
      .notNull(),
    currency: text("currency").default("EUR").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("wallet_user_id_uidx").on(table.userId)],
);

export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    walletId: text("wallet_id")
      .notNull()
      .references(() => wallet.id, { onDelete: "restrict" }),
    type: transactionTypeEnum("type").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description"),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    idempotencyKey: text("idempotency_key").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transaction_wallet_id_idx").on(table.walletId),
    index("transaction_type_idx").on(table.type),
    index("transaction_created_at_idx").on(table.createdAt),
    index("transaction_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
  ],
);

export const walletRelations = relations(wallet, ({ one, many }) => ({
  user: one(user, {
    fields: [wallet.userId],
    references: [user.id],
  }),
  transactions: many(transaction),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  wallet: one(wallet, {
    fields: [transaction.walletId],
    references: [wallet.id],
  }),
}));
