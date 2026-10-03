import { Request, Response } from "express";
import { db } from "../db/database";

export const clientController = {
  getAllClients(req: Request, res: Response) {
    try {
      const clients = db.prepare("SELECT * FROM clients ORDER BY name ASC").all();
      return res.json(clients);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  createClient(req: Request, res: Response) {
    try {
      const { name, phone, email, address, notes } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: "Nome e telefone são obrigatórios." });
      }

      const id = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO clients (id, name, phone, email, address, notes, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, name.trim(), phone.trim(), email || null, address || null, notes || null, now);

      const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
      return res.status(201).json(client);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM clients WHERE id = ?").run(id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
