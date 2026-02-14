import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const conversationTypeEnum = pgEnum("conversation_type", [
  "direct",
  "group",
  "classified_contact",
  "mediation",
]);

export const conversation = pgTable(
  "conversation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    type: conversationTypeEnum("type").default("direct").notNull(),
    subject: text("subject"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastMessageAt: timestamp("last_message_at"),
  },
  (table) => [
    index("conversation_type_idx").on(table.type),
    index("conversation_last_msg_idx").on(table.lastMessageAt),
  ],
);

export const conversationParticipant = pgTable(
  "conversation_participant",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("participant").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    lastReadAt: timestamp("last_read_at"),
  },
  (table) => [
    uniqueIndex("conv_part_conv_user_uidx").on(
      table.conversationId,
      table.userId,
    ),
    index("conv_part_user_idx").on(table.userId),
    index("conv_part_conv_idx").on(table.conversationId),
  ],
);

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    content: text("content").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_conv_idx").on(table.conversationId),
    index("message_sender_idx").on(table.senderId),
    index("message_sent_at_idx").on(table.sentAt),
  ],
);

export const conversationRelations = relations(
  conversation,
  ({ many }) => ({
    participants: many(conversationParticipant),
    messages: many(message),
  }),
);

export const conversationParticipantRelations = relations(
  conversationParticipant,
  ({ one }) => ({
    conversation: one(conversation, {
      fields: [conversationParticipant.conversationId],
      references: [conversation.id],
    }),
    user: one(user, {
      fields: [conversationParticipant.userId],
      references: [user.id],
    }),
  }),
);

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));
