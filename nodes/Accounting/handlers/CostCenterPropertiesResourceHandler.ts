import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Cost Center Properties operations
 * Manages operations related to cost center property management
 */
export class CostCenterPropertiesResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllCostCenterProperties();
      case "get":
        return this.getCostCenterProperty();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllCostCenterProperties(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costCenterProperties = await datevConnectClient.accounting.getCostCenterProperties(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        queryParams
      );
      return this.wrapData(costCenterProperties as any);
    } catch (error) {
      this.handleApiError(error, "Get all cost center properties");
    }
  }

  private async getCostCenterProperty(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const costCenterPropertyId = this.executeFunctions.getNodeParameter("costCenterPropertyId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costCenterProperty = await datevConnectClient.accounting.getCostCenterProperty(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        costCenterPropertyId,
        queryParams
      );
      return this.wrapData(costCenterProperty as any);
    } catch (error) {
      this.handleApiError(error, "Get cost center property");
    }
  }
}