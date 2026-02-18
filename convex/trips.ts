import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;

    const trips = await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const tripsWithProgress = await Promise.all(
      trips.map(async (trip) => {
        const items = await ctx.db
          .query("packingItems")
          .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
          .collect();

        const totalCount = items.length;
        const packedCount = items.filter((item) => item.isPacked).length;

        return { ...trip, packedCount, totalCount };
      })
    );

    return tripsWithProgress.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  },
});

export const get = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      return null;
    }

    const items = await ctx.db
      .query("packingItems")
      .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
      .collect();

    const totalCount = items.length;
    const packedCount = items.filter((item) => item.isPacked).length;

    return { ...trip, packedCount, totalCount };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    type: v.union(v.literal("travel"), v.literal("moving")),
    coverImageId: v.optional(v.id("_storage")),
    templateId: v.optional(v.id("templates")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tripId = await ctx.db.insert("trips", {
      userId: identity.subject,
      title: args.title,
      destination: args.destination,
      startDate: args.startDate,
      endDate: args.endDate,
      type: args.type,
      coverImageId: args.coverImageId,
      templateId: args.templateId,
      createdAt: Date.now(),
    });

    return tripId;
  },
});

export const update = mutation({
  args: {
    id: v.id("trips"),
    title: v.optional(v.string()),
    destination: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    type: v.optional(v.union(v.literal("travel"), v.literal("moving"))),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Trip not found");
    }
    if (existing.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const trip = await ctx.db.get(args.id);
    if (!trip) {
      throw new Error("Trip not found");
    }
    if (trip.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const items = await ctx.db
      .query("packingItems")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.id))
      .collect();

    for (const item of items) {
      const assignments = await ctx.db
        .query("itemBagAssignments")
        .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
        .collect();
      for (const assignment of assignments) {
        await ctx.db.delete(assignment._id);
      }
      await ctx.db.delete(item._id);
    }

    const categories = await ctx.db
      .query("packingCategories")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.id))
      .collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    const bags = await ctx.db
      .query("bags")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.id))
      .collect();
    for (const bag of bags) {
      const bagAssignments = await ctx.db
        .query("itemBagAssignments")
        .withIndex("by_bagId", (q) => q.eq("bagId", bag._id))
        .collect();
      for (const assignment of bagAssignments) {
        await ctx.db.delete(assignment._id);
      }
      await ctx.db.delete(bag._id);
    }

    await ctx.db.delete(args.id);
  },
});
