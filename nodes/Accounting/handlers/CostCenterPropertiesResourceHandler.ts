import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type CostCenterPropertiesOperation = "getAll" | "get";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Cost Center Properties operations
 * Manages operations related to cost center property management
 */
export class CostCenterPropertiesResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: CostCenterPropertiesOperation,
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
      const costSystemId = this.getRequiredString("costSystemId");
      const queryParams = this.buildQueryParams();
      const costCenterProperties = await datevConnectClient.accounting.getCostCenterProperties(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costCenterProperties);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGet(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const costSystemId = this.getRequiredString("costSystemId");
      const costCenterPropertyId = this.getRequiredString("costCenterPropertyId");
      const queryParams = this.buildQueryParams();
      const costCenterProperty = await datevConnectClient.accounting.getCostCenterProperty(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        costCenterPropertyId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costCenterProperty);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}