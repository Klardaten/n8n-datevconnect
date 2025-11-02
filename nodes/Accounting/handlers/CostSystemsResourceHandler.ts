import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type CostSystemsOperation = "getAll" | "get";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Cost Systems operations
 * Manages operations related to cost accounting system configurations
 */
export class CostSystemsResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: CostSystemsOperation,
    authContext: AuthContext,
    returnData: INodeExecutionData[]
  ): Promise<void> {
    switch (operation) {
      case "getAll":
        await this.handleGetAll(authContext, returnData);
        break;
      case "get":
        await this.handleGet(authContext, returnData);
        break;
      default:
        throw new NodeOperationError(this.context.getNode(), `Unknown operation: ${operation}`, {
          itemIndex: this.itemIndex,
        });
    }
  }

  private async handleGetAll(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const queryParams = this.buildQueryParams();
      const costSystems = await datevConnectClient.accounting.getCostSystems(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costSystems);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGet(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const costSystemId = this.getRequiredString("costSystemId");
      const queryParams = this.buildQueryParams();
      const costSystem = await datevConnectClient.accounting.getCostSystem(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costSystem);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}