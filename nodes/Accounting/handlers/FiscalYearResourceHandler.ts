import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { FiscalYear } from "../types";

export class FiscalYearResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllFiscalYears();
      case "get":
        return this.getFiscalYear();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllFiscalYears(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId) {
        throw new Error("Client ID is required for fiscal year operations");
      }
      const queryParams = this.buildQueryParams();
      const fiscalYears = await datevConnectClient.accounting.getFiscalYears(
        this.executeFunctions,
        this.clientId,
        queryParams
      );
      return this.wrapData(fiscalYears as any);
    } catch (error) {
      this.handleApiError(error, "Get all fiscal years");
    }
  }

  private async getFiscalYear(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const fiscalYear = await datevConnectClient.accounting.getFiscalYear(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(fiscalYear as any);
    } catch (error) {
      this.handleApiError(error, "Get fiscal year");
    }
  }
}