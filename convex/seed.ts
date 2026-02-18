import { internalMutation } from "./_generated/server";

export const seedTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("templates")
      .withIndex("by_isSystem", (q) => q.eq("isSystem", true))
      .collect();

    if (existing.length > 0) {
      return { message: "Templates already seeded", count: existing.length };
    }

    const templates = [
      {
        name: "Beach Vacation",
        description: "Everything you need for a perfect beach getaway",
        icon: "beach",
        categories: [
          {
            name: "Clothing",
            items: [
              { name: "Swimsuit", quantity: 2 },
              { name: "Shorts", quantity: 3 },
              { name: "T-shirts", quantity: 4 },
              { name: "Sundress", quantity: 2 },
              { name: "Sandals", quantity: 2 },
              { name: "Cover-up", quantity: 1 },
            ],
          },
          {
            name: "Beach Essentials",
            items: [
              { name: "Sunscreen SPF 50", quantity: 1 },
              { name: "Beach towel", quantity: 2 },
              { name: "Sunglasses", quantity: 1 },
              { name: "Sun hat", quantity: 1 },
              { name: "Aloe vera gel", quantity: 1 },
            ],
          },
          {
            name: "Gear",
            items: [
              { name: "Snorkel set", quantity: 1 },
              { name: "Waterproof phone pouch", quantity: 1 },
              { name: "Beach bag", quantity: 1 },
              { name: "Cooler bag", quantity: 1 },
            ],
          },
          {
            name: "Toiletries",
            items: [
              { name: "Shampoo", quantity: 1 },
              { name: "Conditioner", quantity: 1 },
              { name: "Toothbrush", quantity: 1 },
              { name: "Toothpaste", quantity: 1 },
              { name: "Deodorant", quantity: 1 },
            ],
          },
        ],
      },
      {
        name: "Hiking Adventure",
        description: "Gear up for trails and outdoor exploration",
        icon: "hiking",
        categories: [
          {
            name: "Clothing",
            items: [
              { name: "Hiking boots", quantity: 1 },
              { name: "Moisture-wicking shirts", quantity: 3 },
              { name: "Hiking pants", quantity: 2 },
              { name: "Wool socks", quantity: 4 },
              { name: "Rain jacket", quantity: 1 },
              { name: "Fleece layer", quantity: 1 },
            ],
          },
          {
            name: "Gear",
            items: [
              { name: "Backpack (40L)", quantity: 1 },
              { name: "Water bottles", quantity: 2 },
              { name: "Headlamp", quantity: 1 },
              { name: "Trekking poles", quantity: 1 },
              { name: "First aid kit", quantity: 1 },
            ],
          },
          {
            name: "Navigation & Safety",
            items: [
              { name: "Trail map", quantity: 1 },
              { name: "Compass", quantity: 1 },
              { name: "Whistle", quantity: 1 },
              { name: "Emergency blanket", quantity: 1 },
            ],
          },
          {
            name: "Food & Hydration",
            items: [
              { name: "Trail mix", quantity: 3 },
              { name: "Energy bars", quantity: 6 },
              { name: "Water purification tablets", quantity: 1 },
              { name: "Electrolyte packets", quantity: 4 },
            ],
          },
        ],
      },
      {
        name: "Business Trip",
        description: "Professional packing for work travel",
        icon: "briefcase",
        categories: [
          {
            name: "Business Attire",
            items: [
              { name: "Suits", quantity: 2 },
              { name: "Dress shirts", quantity: 3 },
              { name: "Dress shoes", quantity: 1 },
              { name: "Ties", quantity: 2 },
              { name: "Belt", quantity: 1 },
              { name: "Dress socks", quantity: 4 },
            ],
          },
          {
            name: "Tech & Documents",
            items: [
              { name: "Laptop", quantity: 1 },
              { name: "Laptop charger", quantity: 1 },
              { name: "Phone charger", quantity: 1 },
              { name: "Business cards", quantity: 1 },
              { name: "Portfolio/notebook", quantity: 1 },
            ],
          },
          {
            name: "Casual Wear",
            items: [
              { name: "Casual pants", quantity: 1 },
              { name: "Casual shirt", quantity: 2 },
              { name: "Comfortable shoes", quantity: 1 },
              { name: "Underwear", quantity: 4 },
            ],
          },
          {
            name: "Toiletries",
            items: [
              { name: "Travel toiletry kit", quantity: 1 },
              { name: "Cologne/perfume", quantity: 1 },
              { name: "Lint roller", quantity: 1 },
              { name: "Stain remover pen", quantity: 1 },
              { name: "Wrinkle release spray", quantity: 1 },
            ],
          },
        ],
      },
      {
        name: "Winter Getaway",
        description: "Stay warm and prepared for cold weather destinations",
        icon: "snowflake",
        categories: [
          {
            name: "Outerwear",
            items: [
              { name: "Winter jacket", quantity: 1 },
              { name: "Gloves", quantity: 2 },
              { name: "Wool scarf", quantity: 1 },
              { name: "Beanie/winter hat", quantity: 1 },
              { name: "Snow boots", quantity: 1 },
            ],
          },
          {
            name: "Base Layers",
            items: [
              { name: "Thermal tops", quantity: 3 },
              { name: "Thermal leggings", quantity: 3 },
              { name: "Wool socks", quantity: 5 },
              { name: "Fleece pullover", quantity: 2 },
            ],
          },
          {
            name: "Winter Gear",
            items: [
              { name: "Hand warmers", quantity: 4 },
              { name: "Lip balm with SPF", quantity: 1 },
              { name: "Moisturizer", quantity: 1 },
              { name: "Neck gaiter", quantity: 1 },
              { name: "Ski goggles", quantity: 1 },
            ],
          },
          {
            name: "Essentials",
            items: [
              { name: "Insulated water bottle", quantity: 1 },
              { name: "Portable charger", quantity: 1 },
              { name: "Travel blanket", quantity: 1 },
              { name: "Sunscreen (for snow glare)", quantity: 1 },
            ],
          },
        ],
      },
      {
        name: "Moving Day",
        description: "Organize your move with a comprehensive checklist",
        icon: "truck",
        categories: [
          {
            name: "Packing Supplies",
            items: [
              { name: "Moving boxes (large)", quantity: 10 },
              { name: "Moving boxes (medium)", quantity: 15 },
              { name: "Moving boxes (small)", quantity: 10 },
              { name: "Packing tape", quantity: 4 },
              { name: "Bubble wrap rolls", quantity: 3 },
              { name: "Packing paper", quantity: 2 },
            ],
          },
          {
            name: "Labeling & Organization",
            items: [
              { name: "Colored labels", quantity: 1 },
              { name: "Permanent markers", quantity: 4 },
              { name: "Room inventory sheets", quantity: 1 },
              { name: "Fragile stickers", quantity: 1 },
            ],
          },
          {
            name: "Tools",
            items: [
              { name: "Box cutter", quantity: 2 },
              { name: "Screwdriver set", quantity: 1 },
              { name: "Furniture dolly", quantity: 1 },
              { name: "Moving straps", quantity: 2 },
              { name: "Furniture pads/blankets", quantity: 6 },
            ],
          },
          {
            name: "Essentials Box",
            items: [
              { name: "Toilet paper", quantity: 2 },
              { name: "Paper towels", quantity: 1 },
              { name: "Basic cleaning supplies", quantity: 1 },
              { name: "Snacks and water", quantity: 1 },
              { name: "Phone charger", quantity: 1 },
              { name: "Important documents folder", quantity: 1 },
            ],
          },
        ],
      },
    ];

    for (const template of templates) {
      const templateId = await ctx.db.insert("templates", {
        name: template.name,
        description: template.description,
        icon: template.icon,
        isSystem: true,
      });

      for (let i = 0; i < template.categories.length; i++) {
        const category = template.categories[i];
        const categoryId = await ctx.db.insert("templateCategories", {
          templateId,
          name: category.name,
          sortOrder: i,
        });

        for (const item of category.items) {
          await ctx.db.insert("templateItems", {
            categoryId,
            name: item.name,
            quantity: item.quantity,
          });
        }
      }
    }

    return { message: "Seeded 5 system templates successfully" };
  },
});
