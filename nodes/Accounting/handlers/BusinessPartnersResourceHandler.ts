import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type BusinessPartnersOperation = 
  | "getDebitors" 
  | "getDebitor" 
  | "createDebitor" 
  | "updateDebitor" 
  | "getNextAvailableDebitor"
  | "getCreditors" 
  | "getCreditor" 
  | "createCreditor" 
  | "updateCreditor" 
  | "getNextAvailableCreditor";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Business Partners operations
 * Manages operations related to debitors (customers) and creditors (suppliers)
 */
export class BusinessPartnersResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: BusinessPartnersOperation,
    authContext: AuthContext,
    returnData: INodeExecutionData[]
  ): Promise<void> {
    switch (operation) {
      case "getDebitors":
        await this.handleGetDebitors(authContext, returnData);
        break;
      case "getDebitor":
        await this.handleGetDebitor(authContext, returnData);
        break;
      case "createDebitor":
        await this.handleCreateDebitor(authContext, returnData);
        break;
      case "updateDebitor":
        await this.handleUpdateDebitor(authContext, returnData);
        break;
      case "getNextAvailableDebitor":
        await this.handleGetNextAvailableDebitor(authContext, returnData);
        break;
      case "getCreditors":
        await this.handleGetCreditors(authContext, returnData);
        break;
      case "getCreditor":
        await this.handleGetCreditor(authContext, returnData);
        break;
      case "createCreditor":
        await this.handleCreateCreditor(authContext, returnData);
        break;
      case "updateCreditor":
        await this.handleUpdateCreditor(authContext, returnData);
        break;
      case "getNextAvailableCreditor":
        await this.handleGetNextAvailableCreditor(authContext, returnData);
        break;
      default:
        throw new NodeOperationError(this.context.getNode(), `Unknown operation: ${operation}`, {
          itemIndex: this.itemIndex,
        });
    }
  }

  // New handle methods for the converted pattern
  private async handleGetDebitors(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const queryParams = this.buildQueryParams();
      const debitors = await datevConnectClient.accounting.getDebitors(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(debitors);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetDebitor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const debitorId = this.getRequiredString("debitorId");
      const queryParams = this.buildQueryParams();
      const debitor = await datevConnectClient.accounting.getDebitor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        debitorId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(debitor);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleCreateDebitor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const debitorDataRaw = this.context.getNodeParameter("debitorData", this.itemIndex);
      const debitorData = this.parseJsonParameter(debitorDataRaw, "debitorData");
      if (debitorData === undefined) {
        throw new Error("debitorData is required for creating debitor");
      }
      
      const result = await datevConnectClient.accounting.createDebitor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        debitorData as any
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(result);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleUpdateDebitor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const debitorId = this.getRequiredString("debitorId");
      const debitorDataRaw = this.context.getNodeParameter("debitorData", this.itemIndex);
      const debitorData = this.parseJsonParameter(debitorDataRaw, "debitorData");
      if (debitorData === undefined) {
        throw new Error("debitorData is required for updating debitor");
      }
      
      const result = await datevConnectClient.accounting.updateDebitor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        debitorId,
        debitorData as any
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(result);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetNextAvailableDebitor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const queryParams = this.buildQueryParams();
      const nextAvailable = await datevConnectClient.accounting.getNextAvailableDebitor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(nextAvailable);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetCreditors(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const queryParams = this.buildQueryParams();
      const creditors = await datevConnectClient.accounting.getCreditors(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(creditors);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetCreditor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const creditorId = this.getRequiredString("creditorId");
      const queryParams = this.buildQueryParams();
      const creditor = await datevConnectClient.accounting.getCreditor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        creditorId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(creditor);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleCreateCreditor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const creditorDataRaw = this.context.getNodeParameter("creditorData", this.itemIndex);
      const creditorData = this.parseJsonParameter(creditorDataRaw, "creditorData");
      if (creditorData === undefined) {
        throw new Error("creditorData is required for creating creditor");
      }
      
      const result = await datevConnectClient.accounting.createCreditor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        creditorData as any
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(result);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleUpdateCreditor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const creditorId = this.getRequiredString("creditorId");
      const creditorDataRaw = this.context.getNodeParameter("creditorData", this.itemIndex);
      const creditorData = this.parseJsonParameter(creditorDataRaw, "creditorData");
      if (creditorData === undefined) {
        throw new Error("creditorData is required for updating creditor");
      }
      
      const result = await datevConnectClient.accounting.updateCreditor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        creditorId,
        creditorData as any
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(result);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetNextAvailableCreditor(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const queryParams = this.buildQueryParams();
      const nextAvailable = await datevConnectClient.accounting.getNextAvailableCreditor(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(nextAvailable);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}