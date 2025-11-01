import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { Client } from "../types";

export class ClientResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllClients();
      case "get":
        return this.getClient();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllClients(): Promise<INodeExecutionData[]> {
    try {
      const queryParams = this.buildQueryParams();
      const clients = await datevConnectClient.accounting.getClients(
        this.executeFunctions,
        queryParams
      );
      return this.wrapData(clients as any);
    } catch (error) {
      this.handleApiError(error, "Get all clients");
    }
  }

  private async getClient(): Promise<INodeExecutionData[]> {
    try {
      const clientId = this.executeFunctions.getNodeParameter("clientId", 0) as string;
      const queryParams = this.buildQueryParams();
      const client = await datevConnectClient.accounting.getClient(
        this.executeFunctions,
        clientId,
        queryParams
      );
      return this.wrapData(client as any);
    } catch (error) {
      this.handleApiError(error, "Get client");
    }
  }
}