import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  trips: defineTable({
    userId: v.string(),
    title: v.string(),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    templateId: v.optional(v.id("templates")),
    type: v.union(v.literal("travel"), v.literal("moving")),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  bags: defineTable({
    tripId: v.id("trips"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
  }).index("by_tripId", ["tripId"]),

  packingCategories: defineTable({
    tripId: v.id("trips"),
    name: v.string(),
    sortOrder: v.number(),
  }).index("by_tripId", ["tripId"]),

  packingItems: defineTable({
    tripId: v.id("trips"),
    categoryId: v.id("packingCategories"),
    name: v.string(),
    quantity: v.number(),
    isPacked: v.boolean(),
    notes: v.optional(v.string()),
  }).index("by_tripId", ["tripId"]),

  itemBagAssignments: defineTable({
    itemId: v.id("packingItems"),
    bagId: v.id("bags"),
  })
    .index("by_itemId", ["itemId"])
    .index("by_bagId", ["bagId"]),

  templates: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    isSystem: v.boolean(),
  }).index("by_isSystem", ["isSystem"]),

  templateCategories: defineTable({
    templateId: v.id("templates"),
    name: v.string(),
    sortOrder: v.number(),
  }).index("by_templateId", ["templateId"]),

  templateItems: defineTable({
    categoryId: v.id("templateCategories"),
    name: v.string(),
    quantity: v.number(),
  }).index("by_categoryId", ["categoryId"]),
});
