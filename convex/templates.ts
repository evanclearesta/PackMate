import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_isSystem", (q) => q.eq("isSystem", true))
      .collect();
  },
});

export const get = query({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      return null;
    }

    const categories = await ctx.db
      .query("templateCategories")
      .withIndex("by_templateId", (q) => q.eq("templateId", args.templateId))
      .collect();

    const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder);

    const categoriesWithItems = await Promise.all(
      sortedCategories.map(async (category) => {
        const items = await ctx.db
          .query("templateItems")
          .withIndex("by_categoryId", (q) => q.eq("categoryId", category._id))
          .collect();
        return { ...category, items };
      })
    );

    return { ...template, categories: categoriesWithItems };
  },
});

export const applyToTrip = mutation({
  args: {
    tripId: v.id("trips"),
    templateId: v.id("templates"),
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

    const categories = await ctx.db
      .query("templateCategories")
      .withIndex("by_templateId", (q) => q.eq("templateId", args.templateId))
      .collect();

    const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder);

    for (const templateCategory of sortedCategories) {
      const newCategoryId = await ctx.db.insert("packingCategories", {
        tripId: args.tripId,
        name: templateCategory.name,
        sortOrder: templateCategory.sortOrder,
      });

      const templateItems = await ctx.db
        .query("templateItems")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", templateCategory._id))
        .collect();

      for (const templateItem of templateItems) {
        await ctx.db.insert("packingItems", {
          tripId: args.tripId,
          categoryId: newCategoryId,
          name: templateItem.name,
          quantity: templateItem.quantity,
          isPacked: false,
        });
      }
    }
  },
});
