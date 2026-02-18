import { Id } from "../convex/_generated/dataModel";

export type Trip = {
  _id: Id<"trips">;
  _creationTime: number;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImageId?: Id<"_storage">;
  templateId?: Id<"templates">;
  type: "travel" | "moving";
  createdAt: number;
};

export type Bag = {
  _id: Id<"bags">;
  _creationTime: number;
  tripId: Id<"trips">;
  name: string;
  color: string;
  icon: string;
};

export type PackingCategory = {
  _id: Id<"packingCategories">;
  _creationTime: number;
  tripId: Id<"trips">;
  name: string;
  sortOrder: number;
};

export type PackingItem = {
  _id: Id<"packingItems">;
  _creationTime: number;
  tripId: Id<"trips">;
  categoryId: Id<"packingCategories">;
  name: string;
  quantity: number;
  isPacked: boolean;
  notes?: string;
};

export type ItemBagAssignment = {
  _id: Id<"itemBagAssignments">;
  _creationTime: number;
  itemId: Id<"packingItems">;
  bagId: Id<"bags">;
};

export type Template = {
  _id: Id<"templates">;
  _creationTime: number;
  name: string;
  description: string;
  icon: string;
  isSystem: boolean;
};

export type TemplateCategory = {
  _id: Id<"templateCategories">;
  _creationTime: number;
  templateId: Id<"templates">;
  name: string;
  sortOrder: number;
};

export type TemplateItem = {
  _id: Id<"templateItems">;
  _creationTime: number;
  categoryId: Id<"templateCategories">;
  name: string;
  quantity: number;
};

export type TripWithProgress = Trip & {
  packedCount: number;
  totalCount: number;
};

export type CategoryWithItems = PackingCategory & {
  items: PackingItem[];
};

export type ItemWithAssignments = PackingItem & {
  bagIds: Id<"bags">[];
};

export type TemplateWithDetails = Template & {
  categories: (TemplateCategory & {
    items: TemplateItem[];
  })[];
};
