/**
 * Shared lead constants.
 *
 * These live outside actions.ts because a 'use server' file may only export
 * async functions — exporting a plain object or array from it fails the build.
 */
export const LEAD_STATUSES = ['new', 'in_progress', 'contacted', 'closed'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  contacted: 'Contacted',
  closed: 'Closed',
};

export interface ActionState {
  error?: string;
  ok?: string;
}
