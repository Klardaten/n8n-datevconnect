import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type GeneralLedgerAccountsOperation = "getAll" | "get" | "getUtilized";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for General Ledger Accounts operations
 * Manages operations related to chart of accounts
 */
export class GeneralLedgerAccountsResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: GeneralLedgerAccountsOperation,
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
      case "getUtilized":
        await this.handleGetUtilized(authContext, returnData);
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
      const accounts = await datevConnectClient.accounting.getGeneralLedgerAccounts(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(accounts);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGet(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const generalLedgerAccountId = this.getRequiredString("generalLedgerAccountId");
      const queryParams = this.buildQueryParams();
      const account = await datevConnectClient.accounting.getGeneralLedgerAccount(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        generalLedgerAccountId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(account);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetUtilized(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const queryParams = this.buildQueryParams();
      const accounts = await datevConnectClient.accounting.getUtilizedGeneralLedgerAccounts(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(accounts);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}