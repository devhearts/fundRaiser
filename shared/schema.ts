import { z } from "zod";

// Event schema
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  goalAmount: z.number(),
  currentAmount: z.number(),
  coverImage: z.string().nullable(),
  location: z.string().nullable(),
  deadline: z.date().nullable(),
  isPublic: z.boolean(),
  organizerName: z.string(),
  organizerEmail: z.string(),
  status: z.string(),
  createdAt: z.date(),
});

export const insertEventSchema = z.object({
  title: z.string(),
  description: z.string(),
  goalAmount: z.number(),
  coverImage: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  deadline: z.date().nullable().optional(),
  isPublic: z.boolean().optional(),
  organizerName: z.string(),
  organizerEmail: z.string(),
  status: z.string().optional(),
});

// Contribution schema
export const contributionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  donorName: z.string(),
  donorEmail: z.string(),
  amount: z.number(),
  isAnonymous: z.boolean(),
  isPledge: z.boolean(),
  message: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
});

export const insertContributionSchema = z.object({
  eventId: z.string(),
  donorName: z.string(),
  donorEmail: z.string(),
  amount: z.number(),
  isAnonymous: z.boolean().optional(),
  isPledge: z.boolean().optional(),
  message: z.string().nullable().optional(),
  status: z.string().optional(),
});

// Type exports
export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Contribution = z.infer<typeof contributionSchema>;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
