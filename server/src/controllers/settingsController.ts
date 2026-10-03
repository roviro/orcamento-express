import { Request, Response } from "express";
import { settingsService } from "../services/settingsService";

export const settingsController = {
  getSettings(req: Request, res: Response) {
    try {
      const settings = settingsService.getAll();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateSettings(req: Request, res: Response) {
    try {
      const data = req.body;
      settingsService.updateMany(data);
      return res.json({ success: true, settings: settingsService.getAll() });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
