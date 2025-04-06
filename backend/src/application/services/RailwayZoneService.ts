// application/services/RailwayZoneService.ts
import { Result, ResultUtils } from '../../shared/types/common.types';
import { AppError } from '../../shared/errors/AppError';
import { RailwayZone, RAILWAY_ZONES, getZoneById } from '../../domain/entities/constants/railway';

export type CreateRailwayZoneDto = {
  id: string;
  name: string;
  headquarters: string;
};

export class RailwayZoneService {
  constructor() {}

  getAllZones(): Result<RailwayZone[]> {
    try {
      return ResultUtils.ok(RAILWAY_ZONES);
    } catch (error) {
      console.error('Getting Railway Zones Error:', error);
      throw new AppError('Failed to get railway zones');
    }
  }

  getZoneById(id: string): Result<RailwayZone | undefined> {
    try {
      const zone = getZoneById(id);
      if (!zone) {
        return ResultUtils.fail('Railway zone not found');
      }
      return ResultUtils.ok(zone);
    } catch (error) {
      console.error('Getting Railway Zone Error:', error);
      throw new AppError('Failed to get railway zone');
    }
  }

  addZone(dto: CreateRailwayZoneDto): Result<RailwayZone> {
    try {
      // Check if zone with the same ID already exists
      const existingZone = getZoneById(dto.id);
      if (existingZone) {
        return ResultUtils.fail('Railway zone with this ID already exists');
      }

      // Validate input
      if (!dto.id || !dto.name || !dto.headquarters) {
        return ResultUtils.fail('All fields (id, name, headquarters) are required');
      }

      // Create a new zone
      const newZone: RailwayZone = {
        id: dto.id,
        name: dto.name,
        headquarters: dto.headquarters
      };

      // Add to the RAILWAY_ZONES array
      RAILWAY_ZONES.push(newZone);

      return ResultUtils.ok(newZone);
    } catch (error) {
      console.error('Adding Railway Zone Error:', error);
      throw new AppError('Failed to add railway zone');
    }
  }

  updateZone(id: string, dto: Partial<CreateRailwayZoneDto>): Result<RailwayZone> {
    try {
      // Find the index of the zone with the given id
      const zoneIndex = RAILWAY_ZONES.findIndex(zone => zone.id === id);
      if (zoneIndex === -1) {
        return ResultUtils.fail('Railway zone not found');
      }

      // Update the zone
      const updatedZone = {
        ...RAILWAY_ZONES[zoneIndex],
        ...dto
      };

      // Replace the zone in the array
      RAILWAY_ZONES[zoneIndex] = updatedZone;

      return ResultUtils.ok(updatedZone);
    } catch (error) {
      console.error('Updating Railway Zone Error:', error);
      throw new AppError('Failed to update railway zone');
    }
  }

  deleteZone(id: string): Result<void> {
    try {
      // Find the index of the zone with the given id
      const zoneIndex = RAILWAY_ZONES.findIndex(zone => zone.id === id);
      if (zoneIndex === -1) {
        return ResultUtils.fail('Railway zone not found');
      }

      // Remove the zone from the array
      RAILWAY_ZONES.splice(zoneIndex, 1);

      return ResultUtils.ok(undefined);
    } catch (error) {
      console.error('Deleting Railway Zone Error:', error);
      throw new AppError('Failed to delete railway zone');
    }
  }
} 