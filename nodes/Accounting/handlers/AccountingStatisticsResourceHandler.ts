import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type AccountingStatisticsOperation = "getAll";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Accounting Statistics operations
 * Manages operations related to accounting statistics data
 */
export class AccountingStatisticsResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: AccountingStatisticsOperation,
    authContext: AuthContext,
    returnData: INodeExecutionData[]
  ): Promise<void> {
    switch (operation) {
      case "getAll":
        await this.handleGetAll(authContext, returnData);
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
      const accountingStatistics = await datevConnectClient.accounting.getAccountingStatistics(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(accountingStatistics);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}