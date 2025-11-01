import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Business Partners operations
 * Manages operations related to debitors (customers) and creditors (suppliers)
 */
export class BusinessPartnersResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getDebitors":
        return this.getDebitors();
      case "getDebitor":
        return this.getDebitor();
      case "createDebitor":
        return this.createDebitor();
      case "updateDebitor":
        return this.updateDebitor();
      case "getNextAvailableDebitor":
        return this.getNextAvailableDebitor();
      case "getCreditors":
        return this.getCreditors();
      case "getCreditor":
        return this.getCreditor();
      case "createCreditor":
        return this.createCreditor();
      case "updateCreditor":
        return this.updateCreditor();
      case "getNextAvailableCreditor":
        return this.getNextAvailableCreditor();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getDebitors(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const debitors = await datevConnectClient.accounting.getDebitors(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(debitors as any);
    } catch (error) {
      this.handleApiError(error, "Get debitors");
    }
  }

  private async getDebitor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const debitorId = this.executeFunctions.getNodeParameter("debitorId", 0) as string;
      const queryParams = this.buildQueryParams();
      const debitor = await datevConnectClient.accounting.getDebitor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        debitorId,
        queryParams
      );
      return this.wrapData(debitor as any);
    } catch (error) {
      this.handleApiError(error, "Get debitor");
    }
  }

  private async createDebitor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const debitorData = this.executeFunctions.getNodeParameter("debitorData", 0) as any;
      const debitor = await datevConnectClient.accounting.createDebitor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        debitorData
      );
      return this.wrapData(debitor as any);
    } catch (error) {
      this.handleApiError(error, "Create debitor");
    }
  }

  private async updateDebitor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const debitorId = this.executeFunctions.getNodeParameter("debitorId", 0) as string;
      const debitorData = this.executeFunctions.getNodeParameter("debitorData", 0) as any;
      const debitor = await datevConnectClient.accounting.updateDebitor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        debitorId,
        debitorData
      );
      return this.wrapData(debitor as any);
    } catch (error) {
      this.handleApiError(error, "Update debitor");
    }
  }

  private async getNextAvailableDebitor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const nextAvailable = await datevConnectClient.accounting.getNextAvailableDebitor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(nextAvailable as any);
    } catch (error) {
      this.handleApiError(error, "Get next available debitor");
    }
  }

  private async getCreditors(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const creditors = await datevConnectClient.accounting.getCreditors(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(creditors as any);
    } catch (error) {
      this.handleApiError(error, "Get creditors");
    }
  }

  private async getCreditor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const creditorId = this.executeFunctions.getNodeParameter("creditorId", 0) as string;
      const queryParams = this.buildQueryParams();
      const creditor = await datevConnectClient.accounting.getCreditor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        creditorId,
        queryParams
      );
      return this.wrapData(creditor as any);
    } catch (error) {
      this.handleApiError(error, "Get creditor");
    }
  }

  private async createCreditor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const creditorData = this.executeFunctions.getNodeParameter("creditorData", 0) as any;
      const creditor = await datevConnectClient.accounting.createCreditor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        creditorData
      );
      return this.wrapData(creditor as any);
    } catch (error) {
      this.handleApiError(error, "Create creditor");
    }
  }

  private async updateCreditor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const creditorId = this.executeFunctions.getNodeParameter("creditorId", 0) as string;
      const creditorData = this.executeFunctions.getNodeParameter("creditorData", 0) as any;
      const creditor = await datevConnectClient.accounting.updateCreditor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        creditorId,
        creditorData
      );
      return this.wrapData(creditor as any);
    } catch (error) {
      this.handleApiError(error, "Update creditor");
    }
  }

  private async getNextAvailableCreditor(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const nextAvailable = await datevConnectClient.accounting.getNextAvailableCreditor(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(nextAvailable as any);
    } catch (error) {
      this.handleApiError(error, "Get next available creditor");
    }
  }
}