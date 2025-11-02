import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type CostCentersUnitsOperation = "getAll" | "get";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Cost Centers/Units operations
 * Manages operations related to cost center and cost unit management
 */
export class CostCentersUnitsResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: CostCentersUnitsOperation,
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
      const costCenters = await datevConnectClient.accounting.getCostCenters(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costCenters);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGet(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const costSystemId = this.getRequiredString("costSystemId");
      const costCenterId = this.getRequiredString("costCenterId");
      const queryParams = this.buildQueryParams();
      const costCenter = await datevConnectClient.accounting.getCostCenter(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        costCenterId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costCenter);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}