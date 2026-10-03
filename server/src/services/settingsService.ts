import { db } from "../db/database";

export const settingsService = {
  getAll(): Record<string, string> {
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  },

  get(key: string, defaultValue = ""): string {
    const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  },

  set(key: string, value: string): void {
    db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, value);
  },

  updateMany(data: Record<string, string>): void {
    const updateStmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const runTx = db.transaction(() => {
      for (const [key, value] of Object.entries(data)) {
        updateStmt.run(key, String(value));
      }
    });

    runTx();
  }
};
