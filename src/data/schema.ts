export type ColumnType = {
  name: string;
  type: string;
  constraints: string[];
  isFK?: boolean;
  isPK?: boolean;
  references?: { table: string; column: string };
};

export type TableType = {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  columns: ColumnType[];
};

export type RelationshipType = {
  from: string;
  fromColumn: string;
  to: string;
  toColumn: string;
  type: "one-to-many" | "many-to-many" | "one-to-one";
  label?: string;
};

export type RelationshipLabels = {
  from: "0/1" | "1/0" | "1/N" | "N/N" | "N/1";
  to: "0/1" | "1/0" | "1/N" | "N/N" | "N/1";
};

export const tables: TableType[] = [
  {
    id: "academic_year",
    name: "academic_year",
    color: "indigo",
    icon: "🎓",
    description: "Lookup table for academic years (L1, L2, M1…)",
    columns: [
      { name: "Academic_Year_ID", type: "TINYINT UNSIGNED", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "Label", type: "VARCHAR(10)", constraints: ["NOT NULL", "UNIQUE"] },
    ],
  },
  {
    id: "speciality",
    name: "speciality",
    color: "violet",
    icon: "📚",
    description: "Lookup table for academic specialities",
    columns: [
      { name: "Speciality_ID", type: "TINYINT UNSIGNED", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "Label", type: "VARCHAR(100)", constraints: ["NOT NULL", "UNIQUE"] },
    ],
  },
  {
    id: "users",
    name: "users",
    color: "blue",
    icon: "👤",
    description: "All system users — readers and librarians",
    columns: [
      { name: "User_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "Last_Name", type: "VARCHAR(50)", constraints: ["NOT NULL"] },
      { name: "First_Name", type: "VARCHAR(50)", constraints: ["NOT NULL"] },
      { name: "Email", type: "VARCHAR(100)", constraints: ["NOT NULL", "UNIQUE"] },
      { name: "Phone", type: "VARCHAR(20)", constraints: [] },
      { name: "Password", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
      { name: "Role", type: "ENUM", constraints: ["reader | librarian", "DEFAULT reader"] },
      { name: "Academic_Year_ID", type: "TINYINT UNSIGNED", constraints: ["FK → academic_year"], isFK: true, references: { table: "academic_year", column: "Academic_Year_ID" } },
      { name: "Speciality_ID", type: "TINYINT UNSIGNED", constraints: ["FK → speciality"], isFK: true, references: { table: "speciality", column: "Speciality_ID" } },
      { name: "Status", type: "ENUM", constraints: ["pending | active | inactive | suspended"] },
      { name: "Card_Number", type: "VARCHAR(20)", constraints: ["UNIQUE"] },
      { name: "Profile_Picture", type: "VARCHAR(255)", constraints: [] },
      { name: "Registration_Date", type: "DATE", constraints: ["NOT NULL"] },
    ],
  },
  {
    id: "invitation",
    name: "invitation",
    color: "cyan",
    icon: "✉️",
    description: "Tracks user invitation tokens and their lifecycle",
    columns: [
      { name: "Invitation_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Token", type: "VARCHAR(128)", constraints: ["NOT NULL", "UNIQUE"] },
      { name: "Status", type: "ENUM", constraints: ["pending | sent | accepted | expired | failed"] },
      { name: "Created_At", type: "DATETIME", constraints: ["DEFAULT NOW()"] },
      { name: "Sent_At", type: "DATETIME", constraints: ["NULL"] },
      { name: "Expires_At", type: "DATETIME", constraints: ["NOT NULL"] },
      { name: "Accepted_At", type: "DATETIME", constraints: ["NULL"] },
      { name: "Resend_Count", type: "INT", constraints: ["DEFAULT 0"] },
      { name: "Last_Error", type: "TEXT", constraints: [] },
    ],
  },
  {
    id: "settings",
    name: "settings",
    color: "slate",
    icon: "⚙️",
    description: "Global key-value configuration store",
    columns: [
      { name: "Setting_Key", type: "VARCHAR(100)", constraints: ["PK"], isPK: true },
      { name: "Setting_Value", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
    ],
  },
  {
    id: "document",
    name: "document",
    color: "amber",
    icon: "📖",
    description: "Books, papers and other library documents",
    columns: [
      { name: "Document_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "Category", type: "VARCHAR(100)", constraints: [] },
      { name: "Title", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
      { name: "Edition", type: "VARCHAR(50)", constraints: [] },
      { name: "ISBN", type: "VARCHAR(20)", constraints: ["UNIQUE"] },
      { name: "Academic_Year", type: "VARCHAR(30)", constraints: ["NULL"] },
      { name: "Speciality", type: "VARCHAR(100)", constraints: ["NULL"] },
      { name: "Cover_Image", type: "VARCHAR(255)", constraints: [] },
      { name: "Description", type: "TEXT", constraints: [] },
      { name: "Language", type: "VARCHAR(50)", constraints: [] },
      { name: "Shelf_Location", type: "VARCHAR(100)", constraints: [] },
      { name: "Is_Deleted", type: "TINYINT(1)", constraints: ["DEFAULT 0"] },
      { name: "Deleted_At", type: "DATETIME", constraints: ["NULL"] },
    ],
  },
  {
    id: "author",
    name: "author",
    color: "orange",
    icon: "✍️",
    description: "Authors of library documents",
    columns: [
      { name: "Author_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "First_Name", type: "VARCHAR(100)", constraints: ["NOT NULL"] },
      { name: "Last_Name", type: "VARCHAR(100)", constraints: ["NOT NULL"] },
    ],
  },
  {
    id: "document_author",
    name: "document_author",
    color: "yellow",
    icon: "🔗",
    description: "Junction table linking documents to their authors",
    columns: [
      { name: "Document_ID", type: "INT", constraints: ["PK", "FK → document"], isPK: true, isFK: true, references: { table: "document", column: "Document_ID" } },
      { name: "Author_ID", type: "INT", constraints: ["PK", "FK → author"], isPK: true, isFK: true, references: { table: "author", column: "Author_ID" } },
      { name: "Author_Order", type: "TINYINT UNSIGNED", constraints: ["DEFAULT 1"] },
    ],
  },
  {
    id: "copy",
    name: "copy",
    color: "green",
    icon: "📋",
    description: "Physical copies of each document",
    columns: [
      { name: "Copy_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "Document_ID", type: "INT", constraints: ["FK → document", "NOT NULL"], isFK: true, references: { table: "document", column: "Document_ID" } },
      { name: "Barcode", type: "VARCHAR(50)", constraints: ["UNIQUE"] },
      { name: "Condition", type: "VARCHAR(50)", constraints: [] },
      { name: "Status", type: "ENUM", constraints: ["available | loaned | reserved | lost | damaged | under_repair"] },
    ],
  },
  {
    id: "reservation",
    name: "reservation",
    color: "purple",
    icon: "🔖",
    description: "Document reservations made by readers",
    columns: [
      { name: "Reservation_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Document_ID", type: "INT", constraints: ["FK → document", "NOT NULL"], isFK: true, references: { table: "document", column: "Document_ID" } },
      { name: "Reservation_Date", type: "DATE", constraints: ["NOT NULL"] },
      { name: "Expiration_Date", type: "DATE", constraints: [] },
      { name: "Due_Date", type: "DATE", constraints: ["NULL"] },
      { name: "Status", type: "ENUM", constraints: ["pending | fulfilled | cancelled | expired"] },
    ],
  },
  {
    id: "loan",
    name: "loan",
    color: "rose",
    icon: "📤",
    description: "Active and historical document loans",
    columns: [
      { name: "Loan_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Copy_ID", type: "INT", constraints: ["FK → copy", "NOT NULL"], isFK: true, references: { table: "copy", column: "Copy_ID" } },
      { name: "Librarian_ID", type: "INT", constraints: ["FK → users", "NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Reservation_ID", type: "INT", constraints: ["FK → reservation", "NULL", "UNIQUE"], isFK: true, references: { table: "reservation", column: "Reservation_ID" } },
      { name: "Loan_Date", type: "DATE", constraints: ["NOT NULL"] },
      { name: "Due_Date", type: "DATE", constraints: ["NOT NULL"] },
      { name: "Actual_Return_Date", type: "DATE", constraints: ["NULL"] },
      { name: "Renewal_Count", type: "INT", constraints: ["DEFAULT 0"] },
      { name: "Status", type: "ENUM", constraints: ["in_progress | returned | overdue"] },
    ],
  },
  {
    id: "notification",
    name: "notification",
    color: "teal",
    icon: "🔔",
    description: "User notifications for loans, reservations, system events",
    columns: [
      { name: "Notification_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Document_ID", type: "INT", constraints: ["FK → document", "NULL"], isFK: true, references: { table: "document", column: "Document_ID" } },
      { name: "Title", type: "VARCHAR(150)", constraints: ["NOT NULL"] },
      { name: "Message", type: "TEXT", constraints: ["NOT NULL"] },
      { name: "Type", type: "ENUM", constraints: ["overdue | due_soon | reservation | system"] },
      { name: "Is_Read", type: "TINYINT(1)", constraints: ["DEFAULT 0"] },
      { name: "Created_At", type: "DATETIME", constraints: ["DEFAULT NOW()"] },
    ],
  },
  {
    id: "broadcast_message",
    name: "broadcast_message",
    color: "pink",
    icon: "📢",
    description: "Mass messages sent by librarians to groups of readers",
    columns: [
      { name: "Broadcast_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "Librarian_ID", type: "INT", constraints: ["FK → users", "NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Subject", type: "VARCHAR(150)", constraints: ["NOT NULL"] },
      { name: "Message", type: "TEXT", constraints: ["NOT NULL"] },
      { name: "Message_Type", type: "ENUM", constraints: ["info | warning | reminder | alert"] },
      { name: "Academic_Year_ID", type: "TINYINT UNSIGNED", constraints: ["FK → academic_year", "NULL"], isFK: true, references: { table: "academic_year", column: "Academic_Year_ID" } },
      { name: "Speciality_ID", type: "TINYINT UNSIGNED", constraints: ["FK → speciality", "NULL"], isFK: true, references: { table: "speciality", column: "Speciality_ID" } },
      { name: "Recipients_Count", type: "INT", constraints: ["DEFAULT 0"] },
      { name: "Created_At", type: "DATETIME", constraints: ["DEFAULT NOW()"] },
    ],
  },
  {
    id: "report",
    name: "report",
    color: "red",
    icon: "🚩",
    description: "User-submitted reports about document or copy issues",
    columns: [
      { name: "Report_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Document_ID", type: "INT", constraints: ["FK → document", "NOT NULL"], isFK: true, references: { table: "document", column: "Document_ID" } },
      { name: "Copy_ID", type: "INT", constraints: ["FK → copy", "NULL"], isFK: true, references: { table: "copy", column: "Copy_ID" } },
      { name: "Issue_Type", type: "ENUM", constraints: ["inaccurate_info | damaged_copy | missing_pages | spam"] },
      { name: "Description", type: "TEXT", constraints: [] },
      { name: "Status", type: "ENUM", constraints: ["pending | in_review | resolved | rejected"] },
      { name: "Resolved_By", type: "INT", constraints: ["FK → users", "NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Resolved_At", type: "DATETIME", constraints: ["NULL"] },
      { name: "Created_At", type: "DATETIME", constraints: ["DEFAULT NOW()"] },
    ],
  },
  {
    id: "fine",
    name: "fine",
    color: "fuchsia",
    icon: "💰",
    description: "Fines issued for overdue loans",
    columns: [
      { name: "Fine_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "Loan_ID", type: "INT", constraints: ["FK → loan", "NOT NULL", "UNIQUE"], isFK: true, references: { table: "loan", column: "Loan_ID" } },
      { name: "Amount", type: "DECIMAL(8,2)", constraints: ["NOT NULL"] },
      { name: "Overdue_Days", type: "INT", constraints: ["NOT NULL"] },
      { name: "Status", type: "ENUM", constraints: ["unpaid | paid | waived"] },
      { name: "Issued_At", type: "DATE", constraints: ["NOT NULL"] },
    ],
  },
  {
    id: "saved_list",
    name: "saved_list",
    color: "lime",
    icon: "❤️",
    description: "Documents bookmarked/saved by readers",
    columns: [
      { name: "Saved_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Document_ID", type: "INT", constraints: ["FK → document", "NOT NULL"], isFK: true, references: { table: "document", column: "Document_ID" } },
      { name: "Saved_At", type: "DATETIME", constraints: ["DEFAULT NOW()"] },
    ],
  },
  {
    id: "review",
    name: "review",
    color: "sky",
    icon: "⭐",
    description: "Ratings and reviews left by readers on documents",
    columns: [
      { name: "Review_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Document_ID", type: "INT", constraints: ["FK → document", "NOT NULL"], isFK: true, references: { table: "document", column: "Document_ID" } },
      { name: "Rating", type: "TINYINT UNSIGNED", constraints: ["1-5", "NULL"] },
      { name: "Content", type: "TEXT", constraints: ["NULL"] },
      { name: "Created_At", type: "DATETIME", constraints: ["DEFAULT NOW()"] },
      { name: "Updated_At", type: "DATETIME", constraints: ["ON UPDATE NOW()"] },
    ],
  },
  {
    id: "remember_token",
    name: "remember_token",
    color: "stone",
    icon: "🔑",
    description: "Persistent login tokens for remember-me sessions",
    columns: [
      { name: "Token_ID", type: "INT", constraints: ["PK", "AUTO_INCREMENT"], isPK: true },
      { name: "User_ID", type: "INT", constraints: ["FK → users", "NOT NULL"], isFK: true, references: { table: "users", column: "User_ID" } },
      { name: "Token_Hash", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
      { name: "Expires_At", type: "DATETIME", constraints: ["NOT NULL"] },
    ],
  },
];

export const relationships: RelationshipType[] = [
  // users ← lookup tables
  { from: "users", fromColumn: "Academic_Year_ID", to: "academic_year", toColumn: "Academic_Year_ID", type: "one-to-many" },
  { from: "users", fromColumn: "Speciality_ID", to: "speciality", toColumn: "Speciality_ID", type: "one-to-many" },
  // invitation → users
  { from: "invitation", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  // document_author (junction)
  { from: "document_author", fromColumn: "Document_ID", to: "document", toColumn: "Document_ID", type: "many-to-many" },
  { from: "document_author", fromColumn: "Author_ID", to: "author", toColumn: "Author_ID", type: "many-to-many" },
  // copy → document
  { from: "copy", fromColumn: "Document_ID", to: "document", toColumn: "Document_ID", type: "one-to-many" },
  // reservation → users, document
  { from: "reservation", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "reservation", fromColumn: "Document_ID", to: "document", toColumn: "Document_ID", type: "one-to-many" },
  // loan → users, copy, reservation
  { from: "loan", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "loan", fromColumn: "Copy_ID", to: "copy", toColumn: "Copy_ID", type: "one-to-many" },
  { from: "loan", fromColumn: "Librarian_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "loan", fromColumn: "Reservation_ID", to: "reservation", toColumn: "Reservation_ID", type: "one-to-one" },
  // notification → users, document
  { from: "notification", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "notification", fromColumn: "Document_ID", to: "document", toColumn: "Document_ID", type: "one-to-many" },
  // broadcast → users, academic_year, speciality
  { from: "broadcast_message", fromColumn: "Librarian_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "broadcast_message", fromColumn: "Academic_Year_ID", to: "academic_year", toColumn: "Academic_Year_ID", type: "one-to-many" },
  { from: "broadcast_message", fromColumn: "Speciality_ID", to: "speciality", toColumn: "Speciality_ID", type: "one-to-many" },
  // report → users, document, copy
  { from: "report", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "report", fromColumn: "Document_ID", to: "document", toColumn: "Document_ID", type: "one-to-many" },
  { from: "report", fromColumn: "Copy_ID", to: "copy", toColumn: "Copy_ID", type: "one-to-many" },
  { from: "report", fromColumn: "Resolved_By", to: "users", toColumn: "User_ID", type: "one-to-many" },
  // fine → loan
  { from: "fine", fromColumn: "Loan_ID", to: "loan", toColumn: "Loan_ID", type: "one-to-one" },
  // saved_list → users, document
  { from: "saved_list", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "saved_list", fromColumn: "Document_ID", to: "document", toColumn: "Document_ID", type: "one-to-many" },
  // review → users, document
  { from: "review", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
  { from: "review", fromColumn: "Document_ID", to: "document", toColumn: "Document_ID", type: "one-to-many" },
  // remember_token → users
  { from: "remember_token", fromColumn: "User_ID", to: "users", toColumn: "User_ID", type: "one-to-many" },
];

export const tableGroups = [
  { label: "Lookup", color: "indigo", tables: ["academic_year", "speciality", "settings"] },
  { label: "Users & Auth", color: "blue", tables: ["users", "invitation", "remember_token"] },
  { label: "Catalog", color: "amber", tables: ["document", "author", "document_author", "copy"] },
  { label: "Circulation", color: "rose", tables: ["reservation", "loan", "fine"] },
  { label: "Engagement", color: "teal", tables: ["notification", "broadcast_message", "saved_list", "review", "report"] },
];

const hasNotNull = (constraints: string[] | undefined) =>
  !!constraints?.some((c) => c.toUpperCase().includes("NOT NULL"));

export function getRelationshipLabels(
  rel: RelationshipType,
  tablesData: TableType[] = tables
): RelationshipLabels {
  if (rel.type === "many-to-many") {
    return { from: "N/N", to: "N/N" };
  }

  if (rel.type === "one-to-many") {
    return { from: "N/1", to: "1/N" };
  }

  const fromTable = tablesData.find((t) => t.id === rel.from);
  const fromCol = fromTable?.columns.find((c) => c.name === rel.fromColumn);
  const isRequired = hasNotNull(fromCol?.constraints);

  return isRequired
    ? { from: "1/0", to: "0/1" }
    : { from: "0/1", to: "1/0" };
}
