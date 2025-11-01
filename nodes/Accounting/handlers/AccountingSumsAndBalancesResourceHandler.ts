import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Accounting Sums and Balances operations
 * Manages operations related to accounting balance sheet and P&L data
 */
export class AccountingSumsAndBalancesResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllAccountingSumsAndBalances();
      case "get":
        return this.getAccountingSumsAndBalances();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllAccountingSumsAndBalances(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const sumsAndBalances = await datevConnectClient.accounting.getAccountingSumsAndBalances(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(sumsAndBalances as any);
    } catch (error) {
      this.handleApiError(error, "Get all accounting sums and balances");
    }
  }

  private async getAccountingSumsAndBalances(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const accountingSumsAndBalancesId = this.executeFunctions.getNodeParameter("accountingSumsAndBalancesId", 0) as string;
      const queryParams = this.buildQueryParams();
      const sumsAndBalances = await datevConnectClient.accounting.getAccountingSumsAndBalance(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        accountingSumsAndBalancesId,
        queryParams
      );
      return this.wrapData(sumsAndBalances as any);
    } catch (error) {
      this.handleApiError(error, "Get accounting sums and balances");
    }
  }
}