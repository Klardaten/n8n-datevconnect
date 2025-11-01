import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Internal Cost Services operations
 * Manages operations related to internal cost service allocation records
 */
export class InternalCostServicesResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "create":
        return this.createInternalCostService();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async createInternalCostService(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const internalCostServiceData = this.executeFunctions.getNodeParameter("internalCostServiceData", 0) as object;
      const result = await datevConnectClient.accounting.createInternalCostService(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        internalCostServiceData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Create internal cost service");
    }
  }
}