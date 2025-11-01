import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Various Addresses operations
 * Manages operations related to address management for various business partners
 */
export class VariousAddressesResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllVariousAddresses();
      case "get":
        return this.getVariousAddress();
      case "create":
        return this.createVariousAddress();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllVariousAddresses(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const variousAddresses = await datevConnectClient.accounting.getVariousAddresses(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(variousAddresses as any);
    } catch (error) {
      this.handleApiError(error, "Get all various addresses");
    }
  }

  private async getVariousAddress(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const variousAddressId = this.executeFunctions.getNodeParameter("variousAddressId", 0) as string;
      const queryParams = this.buildQueryParams();
      const variousAddress = await datevConnectClient.accounting.getVariousAddress(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        variousAddressId,
        queryParams
      );
      return this.wrapData(variousAddress as any);
    } catch (error) {
      this.handleApiError(error, "Get various address");
    }
  }

  private async createVariousAddress(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const variousAddressData = this.executeFunctions.getNodeParameter("variousAddressData", 0) as object;
      const result = await datevConnectClient.accounting.createVariousAddress(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        variousAddressData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Create various address");
    }
  }
}