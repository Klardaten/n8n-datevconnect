import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Terms of Payment operations
 * Manages operations related to payment terms configurations and settings
 */
export class TermsOfPaymentResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllTermsOfPayment();
      case "get":
        return this.getTermOfPayment();
      case "create":
        return this.createTermOfPayment();
      case "update":
        return this.updateTermOfPayment();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllTermsOfPayment(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const termsOfPayment = await datevConnectClient.accounting.getTermsOfPayment(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(termsOfPayment as any);
    } catch (error) {
      this.handleApiError(error, "Get all terms of payment");
    }
  }

  private async getTermOfPayment(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const termOfPaymentId = this.executeFunctions.getNodeParameter("termOfPaymentId", 0) as string;
      const queryParams = this.buildQueryParams();
      const termOfPayment = await datevConnectClient.accounting.getTermOfPayment(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        termOfPaymentId,
        queryParams
      );
      return this.wrapData(termOfPayment as any);
    } catch (error) {
      this.handleApiError(error, "Get term of payment");
    }
  }

  private async createTermOfPayment(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const termOfPaymentData = this.executeFunctions.getNodeParameter("termOfPaymentData", 0) as object;
      const result = await datevConnectClient.accounting.createTermOfPayment(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        termOfPaymentData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Create term of payment");
    }
  }

  private async updateTermOfPayment(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const termOfPaymentId = this.executeFunctions.getNodeParameter("termOfPaymentId", 0) as string;
      const termOfPaymentData = this.executeFunctions.getNodeParameter("termOfPaymentData", 0) as object;
      const result = await datevConnectClient.accounting.updateTermOfPayment(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        termOfPaymentId,
        termOfPaymentData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Update term of payment");
    }
  }
}