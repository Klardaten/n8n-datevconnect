import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AccountPosting } from "../types";

export class AccountPostingResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllAccountPostings();
      case "get":
        return this.getAccountPosting();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllAccountPostings(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accountPostings = await datevConnectClient.accounting.getAccountPostings(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accountPostings as any);
    } catch (error) {
      this.handleApiError(error, "Get all account postings");
    }
  }

  private async getAccountPosting(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const accountPostingId = this.executeFunctions.getNodeParameter("accountPostingId", 0) as string;
      const queryParams = this.buildQueryParams();
      const accountPosting = await datevConnectClient.accounting.getAccountPosting(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        accountPostingId,
        queryParams
      );
      return this.wrapData(accountPosting as any);
    } catch (error) {
      this.handleApiError(error, "Get account posting");
    }
  }
}