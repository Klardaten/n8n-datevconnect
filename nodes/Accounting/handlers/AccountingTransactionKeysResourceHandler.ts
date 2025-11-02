import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type AccountingTransactionKeysOperation = "getAll" | "get";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Accounting Transaction Keys operations
 * Manages operations related to transaction key management
 */
export class AccountingTransactionKeysResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: AccountingTransactionKeysOperation,
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
      const accountingTransactionKeys = await datevConnectClient.accounting.getAccountingTransactionKeys(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(accountingTransactionKeys);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGet(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const accountingTransactionKeyId = this.getRequiredString("accountingTransactionKeyId");
      const queryParams = this.buildQueryParams();
      const accountingTransactionKey = await datevConnectClient.accounting.getAccountingTransactionKey(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        accountingTransactionKeyId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(accountingTransactionKey);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}