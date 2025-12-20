import { Request, Response } from 'express';
import { PVProjectDataModel, CreatePVProjectDataInput, BUILDING_AGE_CLASSES, BUILDING_TYPES, OWNERSHIP_TYPES, ROOF_TYPES, ROOF_MATERIALS, ROOF_ORIENTATIONS, ROOF_ANGLES, WALLBOX_INTEREST, STORAGE_INTEREST, INSTALLATION_LOCATIONS } from '../models/PVProjectData';
import { logger } from '../utils/logger';

export const pvProjectDataController = {
  // Get PV data by project ID
  getByProjectId: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const data = await PVProjectDataModel.findByProjectId(parseInt(projectId));
      res.json(data || {});
    } catch (error: any) {
      logger.error('Error fetching PV project data:', error);
      res.status(500).json({ error: 'Failed to fetch PV project data' });
    }
  },

  // Create or update PV data
  upsert: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const data: CreatePVProjectDataInput = {
        ...req.body,
        project_id: parseInt(projectId),
      };
      const result = await PVProjectDataModel.upsert(data);
      res.json(result);
    } catch (error: any) {
      logger.error('Error saving PV project data:', error);
      res.status(500).json({ error: 'Failed to save PV project data' });
    }
  },

  // Delete PV data
  delete: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      await PVProjectDataModel.delete(parseInt(projectId));
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Error deleting PV project data:', error);
      res.status(500).json({ error: 'Failed to delete PV project data' });
    }
  },

  // Get dropdown options
  getOptions: async (_req: Request, res: Response) => {
    res.json({
      buildingAgeClasses: BUILDING_AGE_CLASSES,
      buildingTypes: BUILDING_TYPES,
      ownershipTypes: OWNERSHIP_TYPES,
      roofTypes: ROOF_TYPES,
      roofMaterials: ROOF_MATERIALS,
      roofOrientations: ROOF_ORIENTATIONS,
      roofAngles: ROOF_ANGLES,
      wallboxInterest: WALLBOX_INTEREST,
      storageInterest: STORAGE_INTEREST,
      installationLocations: INSTALLATION_LOCATIONS,
    });
  },
};








