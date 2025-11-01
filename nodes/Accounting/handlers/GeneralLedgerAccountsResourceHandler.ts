import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for General Ledger Accounts operations
 * Manages operations related to chart of accounts
 */
export class GeneralLedgerAccountsResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllGeneralLedgerAccounts();
      case "get":
        return this.getGeneralLedgerAccount();
      case "getUtilized":
        return this.getUtilizedGeneralLedgerAccounts();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllGeneralLedgerAccounts(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accounts = await datevConnectClient.accounting.getGeneralLedgerAccounts(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accounts as any);
    } catch (error) {
      this.handleApiError(error, "Get all general ledger accounts");
    }
  }

  private async getGeneralLedgerAccount(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const generalLedgerAccountId = this.executeFunctions.getNodeParameter("generalLedgerAccountId", 0) as string;
      const queryParams = this.buildQueryParams();
      const account = await datevConnectClient.accounting.getGeneralLedgerAccount(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        generalLedgerAccountId,
        queryParams
      );
      return this.wrapData(account as any);
    } catch (error) {
      this.handleApiError(error, "Get general ledger account");
    }
  }

  private async getUtilizedGeneralLedgerAccounts(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accounts = await datevConnectClient.accounting.getUtilizedGeneralLedgerAccounts(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accounts as any);
    } catch (error) {
      this.handleApiError(error, "Get utilized general ledger accounts");
    }
  }
}