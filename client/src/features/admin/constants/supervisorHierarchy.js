/*
 * Government Finance Management System
 * Supervisor / Organizational Hierarchy
 *
 * IMPORTANT:
 * - These labels are preserved from the Excel hierarchy.
 * - Do not rename, remove, merge, or correct entries here without
 *   confirmation from the organization/backend team.
 * - This file is the frontend configuration source for the
 *   Create Employee hierarchy UI.
 */

export const SUPERVISOR_HIERARCHY = [
  {
    label: "Director",
    children: [],
  },
  {
    label: "Group Coordinator Research",
    children: [],
  },
  {
    label: "Head of the Department",
    children: [],
  },
  {
    label: "Head of the Office",
    children: [],
  },
  {
    label: "Drawing Dispersing Officer",
    children: [],
  },
  {
    label: "Accounts Clerk 2",
    children: [],
  },
  {
    label: "Accounts Clerk 1",
    children: [],
  },
  {
    label: "Establishment Section Head",
    children: [],
  },
  {
    label: "Est Incharge 1",
    children: [],
  },
  {
    label: "Est Incharge 2",
    children: [],
  },
  {
    label: "Facility & Services Head",
    children: [
      "IT Incharge 1",
      "IT Incharge 2",
      "Stores Incharge 1",
      "Stores Incharge 2",
      "Sample Incharge 1",
      "Sample Incharge 2",
      "Estate Incharge 1",
      "Estate Incharge 2",
      "Electrician Incharge 1",
      "Plumber Incharge 1",
      "Vehicle Incharge 1",
      "Vehicle Incharge 2",
    ],
  },
  {
    label: "Extension Dvision Head",
    children: [
      "Extension Division Incharge",
    ],
  },
  {
    label: "Wood Properties and Processing Division (WPPD) Head",
    children: [
      "Principle Investigator 1 - WPPD",
      "Principle Investigator 2 - WPPD",
      "Consultant 1 - WPPD",
      "Consultant 2 - WPPD",
    ],
  },
  {
    label: "Silviculture & Forest Management Divison Head",
    children: [
      "Principle Investigator 1 - SFMD",
      "Principle Investigator 2 - SFMD",
      "Consultant 1 - SFMD",
      "Consultant 2 - SFMD",
    ],
  },
  {
    label: "Forest Protection Division Head",
    children: [
      "Principle Investigator 1 - FPD",
      "Principle Investigator 2 - FPD",
      "Consultant 1 - FPD",
      "Consultant 2 - FPD",
    ],
  },
  {
    label: "Plywood & Panel Products Technology Division Head",
    children: [
      "Principle Investigator 1 - PPPD",
      "Principle Investigator 2 - PPPD",
    ],
  },
  {
    label: "IWST Gottipura Field Research Station Incharge 3",
    children: [],
  },
  {
    label: "IWST Gottipura Field Research Station Incharge 2",
    children: [],
  },
  {
    label: "IWST Gottipura Field Research Station Incharge 1",
    children: [],
  },
  {
    label: "IWST Gottipura Field Research Station Incharge 0",
    children: [],
  },
  {
    label: "IWST Gottipura Field Research Station Incharge 1",
    children: [],
  },
  {
    label: "IWST Gottipura Field Research Station Incharge 2",
    children: [],
  },
];

export const SUPERVISOR_ROLE_OPTIONS = SUPERVISOR_HIERARCHY.map(
  ({ label }) => label,
);

export function getSupervisorPositions(supervisorRole) {
  const hierarchyItem = SUPERVISOR_HIERARCHY.find(
    (item) => item.label === supervisorRole,
  );

  return hierarchyItem?.children ?? [];
}