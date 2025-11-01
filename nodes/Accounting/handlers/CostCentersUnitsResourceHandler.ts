import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Cost Centers/Units operations
 * Manages operations related to cost center and cost unit management
 */
export class CostCentersUnitsResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllCostCenters();
      case "get":
        return this.getCostCenter();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllCostCenters(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costCenters = await datevConnectClient.accounting.getCostCenters(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        queryParams
      );
      return this.wrapData(costCenters as any);
    } catch (error) {
      this.handleApiError(error, "Get all cost centers");
    }
  }

  private async getCostCenter(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const costCenterId = this.executeFunctions.getNodeParameter("costCenterId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costCenter = await datevConnectClient.accounting.getCostCenter(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        costCenterId,
        queryParams
      );
      return this.wrapData(costCenter as any);
    } catch (error) {
      this.handleApiError(error, "Get cost center");
    }
  }
}