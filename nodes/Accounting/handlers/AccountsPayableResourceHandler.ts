import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Accounts Payable operations
 * Manages operations related to accounts payable (open items on the payable side)
 */
export class AccountsPayableResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllAccountsPayable();
      case "get":
        return this.getAccountPayable();
      case "getCondensed":
        return this.getCondensedAccountsPayable();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllAccountsPayable(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accountsPayable = await datevConnectClient.accounting.getAccountsPayable(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accountsPayable as any);
    } catch (error) {
      this.handleApiError(error, "Get all accounts payable");
    }
  }

  private async getAccountPayable(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const accountsPayableId = this.executeFunctions.getNodeParameter("accountsPayableId", 0) as string;
      const queryParams = this.buildQueryParams();
      const accountPayable = await datevConnectClient.accounting.getAccountPayable(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        accountsPayableId,
        queryParams
      );
      return this.wrapData(accountPayable as any);
    } catch (error) {
      this.handleApiError(error, "Get account payable");
    }
  }

  private async getCondensedAccountsPayable(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const condensedAccountsPayable = await datevConnectClient.accounting.getAccountsPayableCondensed(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(condensedAccountsPayable as any);
    } catch (error) {
      this.handleApiError(error, "Get condensed accounts payable");
    }
  }
}