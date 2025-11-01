import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AccountingSequence } from "../types";

export class AccountingSequenceResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "create":
        return this.createAccountingSequence();
      case "getAll":
        return this.getAllAccountingSequences();
      case "get":
        return this.getAccountingSequence();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async createAccountingSequence(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const accountingSequenceData = this.executeFunctions.getNodeParameter("accountingSequenceData", 0) as string;
      let parsedData: any;
      try {
        parsedData = JSON.parse(accountingSequenceData);
      } catch (error) {
        throw new Error("Invalid JSON in accounting sequence data");
      }

      const accountingSequence = await datevConnectClient.accounting.createAccountingSequence(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        parsedData
      );
      return this.wrapData(accountingSequence as any);
    } catch (error) {
      this.handleApiError(error, "Create accounting sequence");
    }
  }

  private async getAllAccountingSequences(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const accountingSequences = await datevConnectClient.accounting.getAccountingSequences(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(accountingSequences as any);
    } catch (error) {
      this.handleApiError(error, "Get all accounting sequences");
    }
  }

  private async getAccountingSequence(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const accountingSequenceId = this.executeFunctions.getNodeParameter("accountingSequenceId", 0) as string;
      const queryParams = this.buildQueryParams();
      const accountingSequence = await datevConnectClient.accounting.getAccountingSequence(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        accountingSequenceId,
        queryParams
      );
      return this.wrapData(accountingSequence as any);
    } catch (error) {
      this.handleApiError(error, "Get accounting sequence");
    }
  }
}