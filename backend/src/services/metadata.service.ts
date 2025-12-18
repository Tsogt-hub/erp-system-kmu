import { DataAssetModel, CreateDataAssetInput } from '../models/DataAsset';
import { CreateDataQualityRuleInput, DataQualityRuleModel } from '../models/DataQualityRule';

export class MetadataService {
  static async listAssets() {
    return DataAssetModel.list();
  }

  static async createAsset(payload: CreateDataAssetInput) {
    return DataAssetModel.create(payload);
  }

  static async listQualityRules(assetId?: number) {
    if (assetId) {
      return DataQualityRuleModel.findByAsset(assetId);
    }
    return DataQualityRuleModel.list();
  }

  static async createQualityRule(payload: CreateDataQualityRuleInput) {
    return DataQualityRuleModel.create(payload);
  }
}


