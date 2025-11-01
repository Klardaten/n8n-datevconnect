import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Stocktaking Data operations
 * Manages operations related to inventory/stocktaking data in asset accounting
 */
export class StocktakingDataResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllStocktakingData();
      case "getByAsset":
        return this.getStocktakingDataByAsset();
      case "update":
        return this.updateStocktakingData();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllStocktakingData(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const stocktakingData = await datevConnectClient.accounting.getStocktakingData(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(stocktakingData as any);
    } catch (error) {
      this.handleApiError(error, "Get all stocktaking data");
    }
  }

  private async getStocktakingDataByAsset(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const assetId = this.executeFunctions.getNodeParameter("assetId", 0) as string;
      const queryParams = this.buildQueryParams();
      const stocktakingData = await datevConnectClient.accounting.getStocktakingDataByAsset(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        assetId,
        queryParams
      );
      return this.wrapData(stocktakingData as any);
    } catch (error) {
      this.handleApiError(error, "Get stocktaking data by asset");
    }
  }

  private async updateStocktakingData(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const assetId = this.executeFunctions.getNodeParameter("assetId", 0) as string;
      const stocktakingData = this.executeFunctions.getNodeParameter("stocktakingData", 0) as object;
      const result = await datevConnectClient.accounting.updateStocktakingData(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        assetId,
        stocktakingData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Update stocktaking data");
    }
  }
}