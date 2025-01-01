// src/controllers/masterDataController.ts
import { Request, Response, NextFunction } from 'express';
import { MasterDataModel } from '../models/MasterDataModel';
import { VendorStatus, VendorCategory } from '../types/master.types';

export class MasterDataController {
    static async getItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const item = await MasterDataModel.getItemById(id);
            if (!item) {
                res.status(404).json({ success: false, error: 'Item not found' });
                return;
            }
            res.json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }

    static async getVendorById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const vendor = await MasterDataModel.getVendorById(id);
            if (!vendor) {
                res.status(404).json({ success: false, error: 'Vendor not found' });
                return;
            }
            res.json({ success: true, data: vendor });
        } catch (error) {
            next(error);
        }
    }

    // Update other controller methods similarly
    static async createItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const item = await MasterDataModel.createItem(req.body);
            res.status(201).json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }

    static async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const item = await MasterDataModel.updateItem(id, req.body);
            res.json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }

    static async getItems(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { category, isActive, search } = req.query;
            const items = await MasterDataModel.getItems({
                category: category as string,
                isActive: isActive === 'true',
                searchTerm: search as string
            });
            res.json({ success: true, data: items });
        } catch (error) {
            next(error);
        }
    }

    static async createVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const vendor = await MasterDataModel.createVendor(req.body);
            res.status(201).json({ success: true, data: vendor });
        } catch (error) {
            next(error);
        }
    }

    static async updateVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const vendor = await MasterDataModel.updateVendor(id, req.body);
            res.json({ success: true, data: vendor });
        } catch (error) {
            next(error);
        }
    }

    static async getVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { category, status, isActive, search } = req.query;
            const vendors = await MasterDataModel.getVendors({
                category: category as VendorCategory,
                status: status as VendorStatus,
                isActive: isActive === 'true',
                searchTerm: search as string
            });
            res.json({ success: true, data: vendors });
        } catch (error) {
            next(error);
        }
    }

    static async updateVendorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { status, remarks } = req.body;
            const vendor = await MasterDataModel.updateVendorStatus(id, status, remarks);
            res.json({ success: true, data: vendor });
        } catch (error) {
            next(error);
        }
    }
}