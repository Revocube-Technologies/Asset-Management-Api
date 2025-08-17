export const PERMISSIONS = [
  {
    group: "Assets",
    permissions: [
      "assets:create",
      "assets:update",
      "assets: delete",
      "assets:changStatus",
    ],
  },
  {
    group: "Assignments",
    permissions: [
      "assignments: create",
      "assignments: update",
      "assignments: delete",
    ],
  },
  {
    group: "Departments",
    permissions: [
      "departments: create",
      "departments: update",
      "departments: delete",
    ],
  },
  {
    group: "Locations",
    permissions: ["location:create", "location:update", "location:delete"],
  },
  {
    group: "Repairs",
    permissions: ["repairs:create", "repairs:update", "repairs:delete"],
  },
  {
    group: "Requests",
    permissions: ["requests:create", "requests:update", "requests:delete"],
  },
  {
    group: "Roles",
    permissions: ["roles:create", "roles:update", "roles:delete"],
  },
  {
    group: "Admins",
    permissions: ["admins:create", "admins:update", "admins:delete"],
  },
];

export const COMPULSORY_PERMISSIONS = [
  "assets:view",
  "assignment:view",
  "requests:view",
  "repair:view",
];
