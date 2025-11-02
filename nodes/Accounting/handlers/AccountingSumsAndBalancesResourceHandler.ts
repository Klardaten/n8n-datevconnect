import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type AccountingSumsAndBalancesOperation = "getAll" | "get";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Accounting Sums and Balances operations
 * Manages operations related to accounting balance sheet and P&L data
 */
export class AccountingSumsAndBalancesResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: AccountingSumsAndBalancesOperation,
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
      const sumsAndBalances = await datevConnectClient.accounting.getAccountingSumsAndBalances(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(sumsAndBalances);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGet(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const accountingSumsAndBalancesId = this.getRequiredString("accountingSumsAndBalancesId");
      const queryParams = this.buildQueryParams();
      const sumsAndBalances = await datevConnectClient.accounting.getAccountingSumsAndBalance(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        accountingSumsAndBalancesId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(sumsAndBalances);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}