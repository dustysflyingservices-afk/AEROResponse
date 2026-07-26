import type { MissionPriority, MissionStatus } from "@prisma/client";

export const MISSION_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const MISSION_PRIORITY_LABELS: Record<MissionPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const MISSION_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
