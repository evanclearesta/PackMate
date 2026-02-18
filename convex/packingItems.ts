import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== identity.subject) {
      return [];
    }

    const categories = await ctx.db
      .query("packingCategories")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder);

    const items = await ctx.db
      .query("packingItems")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    return sortedCategories.map((category) => ({
      ...category,
      items: items.filter(
        (item) => item.categoryId === category._id
      ),
    }));
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    categoryId: v.id("packingCategories"),
    name: v.string(),
    quantity: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("packingItems", {
      tripId: args.tripId,
      categoryId: args.categoryId,
      name: args.name,
      quantity: args.quantity ?? 1,
      isPacked: false,
      notes: args.notes,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("packingItems"),
    name: v.optional(v.string()),
    quantity: v.optional(v.number()),
    isPacked: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    categoryId: v.optional(v.id("packingCategories")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }
    const trip = await ctx.db.get(item.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(id, updates);
  },
});

export const togglePacked = mutation({
  args: { id: v.id("packingItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }
    const trip = await ctx.db.get(item.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { isPacked: !item.isPacked });
  },
});

export const remove = mutation({
  args: { id: v.id("packingItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }
    const trip = await ctx.db.get(item.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const assignments = await ctx.db
      .query("itemBagAssignments")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.id))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const createCategory = mutation({
  args: {
    tripId: v.id("trips"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const existing = await ctx.db
      .query("packingCategories")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const maxSortOrder = existing.reduce(
      (max, cat) => Math.max(max, cat.sortOrder),
      -1
    );

    return await ctx.db.insert("packingCategories", {
      tripId: args.tripId,
      name: args.name,
      sortOrder: maxSortOrder + 1,
    });
  },
});

export const assignToBag = mutation({
  args: {
    itemId: v.id("packingItems"),
    bagId: v.id("bags"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    const trip = await ctx.db.get(item.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const existing = await ctx.db
      .query("itemBagAssignments")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    const alreadyAssigned = existing.find((a) => a.bagId === args.bagId);
    if (alreadyAssigned) {
      return alreadyAssigned._id;
    }

    return await ctx.db.insert("itemBagAssignments", {
      itemId: args.itemId,
      bagId: args.bagId,
    });
  },
});

export const unassignFromBag = mutation({
  args: {
    itemId: v.id("packingItems"),
    bagId: v.id("bags"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    const trip = await ctx.db.get(item.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const assignments = await ctx.db
      .query("itemBagAssignments")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    const match = assignments.find((a) => a.bagId === args.bagId);
    if (match) {
      await ctx.db.delete(match._id);
    }
  },
});

export const getAssignments = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== identity.subject) {
      return [];
    }

    const items = await ctx.db
      .query("packingItems")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const allAssignments = [];
    for (const item of items) {
      const assignments = await ctx.db
        .query("itemBagAssignments")
        .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
        .collect();
      allAssignments.push(...assignments);
    }

    return allAssignments;
  },
});
