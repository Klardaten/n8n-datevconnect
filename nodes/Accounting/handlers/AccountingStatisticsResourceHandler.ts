import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Accounting Statistics operations
 * Manages operations related to accounting statistics data
 */
export class AccountingStatisticsResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllAccountingStatistics();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllAccountingStatistics(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accountingStatistics = await datevConnectClient.accounting.getAccountingStatistics(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accountingStatistics as any);
    } catch (error) {
      this.handleApiError(error, "Get accounting statistics");
    }
  }
}