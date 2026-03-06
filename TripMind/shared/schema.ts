import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Auth Tables ---
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// --- App Tables ---
export const trips = pgTable("trips", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  budget: integer("budget"),
  style: text("style"),
  coverEmoji: text("cover_emoji"),
  totalCost: integer("total_cost").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const days = pgTable("days", {
  id: serial("id").primaryKey(),
  tripId: varchar("trip_id").references(() => trips.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  date: text("date"),
  theme: text("theme"),
  summary: text("summary"),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").references(() => days.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  timeSlot: text("time_slot"),
  category: text("category"),
  cost: integer("cost").default(0),
  location: text("location"),
  notes: text("notes"),
  status: text("status").default('planned'),
  sortOrder: integer("sort_order"),
});

export const packingItems = pgTable("packing_items", {
  id: serial("id").primaryKey(),
  tripId: varchar("trip_id").references(() => trips.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  category: text("category"),
  isPacked: boolean("is_packed").default(false),
});

// Zod schemas
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true, totalCost: true });
export const insertDaySchema = createInsertSchema(days).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertPackingItemSchema = createInsertSchema(packingItems).omit({ id: true });

// Base types
export type Trip = typeof trips.$inferSelect;
export type Day = typeof days.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type PackingItem = typeof packingItems.$inferSelect;

export type DayWithActivities = Day & { activities: Activity[] };
export type TripWithDetails = Trip & { days: DayWithActivities[], packingItems: PackingItem[] };

// Request Types
export type CreateTripRequest = z.infer<typeof insertTripSchema>;
export type UpdateTripRequest = Partial<CreateTripRequest>;

export type CreateDayRequest = z.infer<typeof insertDaySchema>;
export type UpdateDayRequest = Partial<CreateDayRequest>;

export type CreateActivityRequest = z.infer<typeof insertActivitySchema>;
export type UpdateActivityRequest = Partial<CreateActivityRequest>;

export type CreatePackingItemRequest = z.infer<typeof insertPackingItemSchema>;
export type UpdatePackingItemRequest = Partial<CreatePackingItemRequest>;
