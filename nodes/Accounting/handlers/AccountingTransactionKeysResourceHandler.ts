import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Accounting Transaction Keys operations
 * Manages operations related to transaction key management
 */
export class AccountingTransactionKeysResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllAccountingTransactionKeys();
      case "get":
        return this.getAccountingTransactionKey();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllAccountingTransactionKeys(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accountingTransactionKeys = await datevConnectClient.accounting.getAccountingTransactionKeys(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accountingTransactionKeys as any);
    } catch (error) {
      this.handleApiError(error, "Get all accounting transaction keys");
    }
  }

  private async getAccountingTransactionKey(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const accountingTransactionKeyId = this.executeFunctions.getNodeParameter("accountingTransactionKeyId", 0) as string;
      const queryParams = this.buildQueryParams();
      const accountingTransactionKey = await datevConnectClient.accounting.getAccountingTransactionKey(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        accountingTransactionKeyId,
        queryParams
      );
      return this.wrapData(accountingTransactionKey as any);
    } catch (error) {
      this.handleApiError(error, "Get accounting transaction key");
    }
  }
}