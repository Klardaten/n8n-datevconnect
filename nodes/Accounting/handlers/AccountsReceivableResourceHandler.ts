import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AccountsReceivable } from "../types";

export class AccountsReceivableResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllAccountsReceivable();
      case "get":
        return this.getAccountReceivable();
      case "getCondensed":
        return this.getCondensedAccountsReceivable();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllAccountsReceivable(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accountsReceivable = await datevConnectClient.accounting.getAccountsReceivable(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accountsReceivable as any);
    } catch (error) {
      this.handleApiError(error, "Get all accounts receivable");
    }
  }

  private async getAccountReceivable(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const accountsReceivableId = this.executeFunctions.getNodeParameter("accountsReceivableId", 0) as string;
      const queryParams = this.buildQueryParams();
      const accountReceivable = await datevConnectClient.accounting.getAccountReceivable(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        accountsReceivableId,
        queryParams
      );
      return this.wrapData(accountReceivable as any);
    } catch (error) {
      this.handleApiError(error, "Get account receivable");
    }
  }

  private async getCondensedAccountsReceivable(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const condensedAccountsReceivable = await datevConnectClient.accounting.getAccountsReceivableCondensed(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(condensedAccountsReceivable as any);
    } catch (error) {
      this.handleApiError(error, "Get condensed accounts receivable");
    }
  }
}