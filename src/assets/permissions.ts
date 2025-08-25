export const PERMISSIONS = [
  {
    group: "Assets",
    permissions: [
      "assets:view",
      "assets:create",
      "assets:update",
      "assets:delete",
      "assets:changeStatus"
    ],
  },
  {
    group: "Assignments",
    permissions: [
      "assignments:view",
      "assignments:create",
      "assignments:update",
      "assignments:delete",
    ],
  },
  {
    group: "Departments",
    permissions: [
      "departments:view",
      "departments:create",
      "departments:update",
      "departments:delete",
    ],
  },
  {
    group: "Locations",
    permissions: [
      "locations:view",
      "locations:create",
      "locations:update",
      "locations:delete",
    ],
  },
  {
    group: "Repairs",
    permissions: [
      "repairs:view",
      "repairs:create",
      "repairs:update",
      "repairs:delete",
    ],
  },
  {
    group: "Requests",
    permissions: [
      "requests:view",
      "requests:create",
      "requests:update",
      "requests:delete",
    ],
  },
  {
    group: "Roles",
    permissions: [
      "roles:view",
      "roles:create",
      "roles:update",
      "roles:delete",
    ],
  },
  {
    group: "Admins",
    permissions: [
      "admins:view",
      "admins:create",
      "admins:update",
      "admins:delete",
    ],
  },
];

export const COMPULSORY_PERMISSIONS = [
  "assets:view",
  "assignments:view",
  "departments:view",
  "locations:view",
  "repairs:view",
  "requests:view",
  "roles:view",
  "admins:view"
];

