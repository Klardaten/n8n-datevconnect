import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Cost Systems operations
 * Manages operations related to cost accounting system configurations
 */
export class CostSystemsResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllCostSystems();
      case "get":
        return this.getCostSystem();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllCostSystems(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const costSystems = await datevConnectClient.accounting.getCostSystems(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(costSystems as any);
    } catch (error) {
      this.handleApiError(error, "Get all cost systems");
    }
  }

  private async getCostSystem(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costSystem = await datevConnectClient.accounting.getCostSystem(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        queryParams
      );
      return this.wrapData(costSystem as any);
    } catch (error) {
      this.handleApiError(error, "Get cost system");
    }
  }
}