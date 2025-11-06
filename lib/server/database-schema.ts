export const DATABASE_ID = "expense_tracker" as const;
export const DATABASE_NAME = "Expense Tracker" as const;

export type AttributeDefinition =
  | {
      type: "string";
      key: string;
      size: number;
      required?: boolean;
      default?: string | null;
      array?: boolean;
    }
  | {
      type: "enum";
      key: string;
      elements: string[];
      required?: boolean;
      default?: string | null;
      array?: boolean;
    }
  | {
      type: "integer";
      key: string;
      required?: boolean;
      min?: number;
      max?: number;
      default?: number | null;
      array?: boolean;
    }
  | {
      type: "float";
      key: string;
      required?: boolean;
      min?: number;
      max?: number;
      default?: number | null;
      array?: boolean;
    }
  | {
      type: "boolean";
      key: string;
      required?: boolean;
      default?: boolean | null;
    }
  | {
      type: "datetime";
      key: string;
      required?: boolean;
      default?: string | null;
      array?: boolean;
    };

export type IndexDefinition = {
  key: string;
  type: "key" | "fulltext" | "unique";
  attributes: string[];
  orders?: Array<"ASC" | "DESC">;
};

export type CollectionSchema = {
  id: string;
  name: string;
  documentSecurity?: boolean;
  permissions?: string[];
  attributes: AttributeDefinition[];
  indexes?: IndexDefinition[];
};

export const COLLECTION_SCHEMAS: CollectionSchema[] = [
  {
    id: "wallets",
    name: "Wallets",
    documentSecurity: true,
    permissions: [],
    attributes: [
      { type: "string", key: "name", size: 128, required: true },
      { type: "string", key: "default_currency", size: 16, required: true },
      { type: "string", key: "owner_team_id", size: 64, required: true },
      { type: "float", key: "monthly_budget", required: false, min: 0 }
    ],
    indexes: [
      {
        key: "idx_owner_team",
        type: "key",
        attributes: ["owner_team_id"],
        orders: ["ASC"]
      }
    ]
  },
  {
    id: "members",
    name: "Members",
    documentSecurity: true,
    permissions: [],
    attributes: [
      { type: "string", key: "wallet_id", size: 64, required: true },
      { type: "string", key: "user_id", size: 64, required: true },
      {
        type: "enum",
        key: "role",
        elements: ["owner", "manager", "member", "viewer"],
        required: true
      },
      { type: "datetime", key: "joined_at", required: false },
      { type: "string", key: "invited_by", size: 64, required: false }
    ],
    indexes: [
      {
        key: "idx_wallet",
        type: "key",
        attributes: ["wallet_id"],
        orders: ["ASC"]
      },
      {
        key: "idx_wallet_user",
        type: "unique",
        attributes: ["wallet_id", "user_id"],
        orders: ["ASC", "ASC"]
      }
    ]
  },
  {
    id: "transactions",
    name: "Transactions",
    documentSecurity: true,
    permissions: [],
    attributes: [
      { type: "string", key: "wallet_id", size: 64, required: true },
      { type: "float", key: "amount", required: true },
      {
        type: "enum",
        key: "type",
        elements: ["expense", "income"],
        required: true
      },
      { type: "string", key: "category_id", size: 64, required: false },
      { type: "datetime", key: "occurred_at", required: true },
      { type: "string", key: "memo", size: 512, required: false },
      { type: "string", key: "merchant", size: 256, required: false },
      { type: "string", key: "tags", size: 64, array: true, required: false },
      {
        type: "string",
        key: "attachment_ids",
        size: 64,
        array: true,
        required: false
      },
      { type: "string", key: "recurring_rule_id", size: 64, required: false }
    ],
    indexes: [
      {
        key: "idx_wallet",
        type: "key",
        attributes: ["wallet_id"],
        orders: ["ASC"]
      },
      {
        key: "idx_wallet_date",
        type: "key",
        attributes: ["wallet_id", "occurred_at"],
        orders: ["ASC", "DESC"]
      }
    ]
  },
  {
    id: "categories",
    name: "Categories",
    documentSecurity: true,
    permissions: [],
    attributes: [
      { type: "string", key: "wallet_id", size: 64, required: true },
      { type: "string", key: "name", size: 128, required: true },
      {
        type: "enum",
        key: "type",
        elements: ["expense", "income"],
        required: true
      },
      { type: "string", key: "color", size: 16, required: false },
      { type: "string", key: "icon", size: 64, required: false },
      { type: "datetime", key: "archived_at", required: false }
    ],
    indexes: [
      {
        key: "idx_wallet",
        type: "key",
        attributes: ["wallet_id"],
        orders: ["ASC"]
      }
    ]
  },
  {
    id: "budgets",
    name: "Budgets",
    documentSecurity: true,
    permissions: [],
    attributes: [
      { type: "string", key: "wallet_id", size: 64, required: true },
      { type: "string", key: "category_id", size: 64, required: false },
      {
        type: "enum",
        key: "interval",
        elements: ["monthly", "quarterly", "yearly", "custom"],
        required: true
      },
      { type: "float", key: "limit", required: true, min: 0 },
      { type: "boolean", key: "rollover", required: true, default: false },
      { type: "integer", key: "alert_thresholds", array: true, required: false }
    ],
    indexes: [
      {
        key: "idx_wallet",
        type: "key",
        attributes: ["wallet_id"],
        orders: ["ASC"]
      }
    ]
  },
  {
    id: "recurring_rules",
    name: "Recurring Rules",
    documentSecurity: true,
    permissions: [],
    attributes: [
      { type: "string", key: "wallet_id", size: 64, required: true },
      {
        type: "enum",
        key: "cadence",
        elements: ["daily", "weekly", "biweekly", "monthly", "yearly", "custom"],
        required: true
      },
      { type: "datetime", key: "next_run_at", required: true },
      { type: "string", key: "timezone", size: 64, required: false },
      { type: "string", key: "payload", size: 8192, required: false }
    ],
    indexes: [
      {
        key: "idx_wallet",
        type: "key",
        attributes: ["wallet_id"],
        orders: ["ASC"]
      },
      {
        key: "idx_wallet_next_run",
        type: "key",
        attributes: ["wallet_id", "next_run_at"],
        orders: ["ASC", "ASC"]
      }
    ]
  },
  {
    id: "activity_logs",
    name: "Activity Logs",
    documentSecurity: true,
    permissions: [],
    attributes: [
      { type: "string", key: "wallet_id", size: 64, required: true },
      { type: "string", key: "actor_id", size: 64, required: true },
      { type: "string", key: "action", size: 128, required: true },
      { type: "string", key: "metadata", size: 4096, required: false },
      { type: "datetime", key: "created_at", required: true }
    ],
    indexes: [
      {
        key: "idx_wallet",
        type: "key",
        attributes: ["wallet_id"],
        orders: ["ASC"]
      },
      {
        key: "idx_wallet_created",
        type: "key",
        attributes: ["wallet_id", "created_at"],
        orders: ["ASC", "DESC"]
      }
    ]
  }
];

export type DatabaseSchema = typeof COLLECTION_SCHEMAS;
