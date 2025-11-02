import { NodeOperationError, type INodeExecutionData } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AuthContext, AccountsReceivableOperation } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

export class AccountsReceivableResourceHandler extends BaseResourceHandler {
  async execute(
    operation: string,
    authContext: AuthContext,
    returnData: INodeExecutionData[],
  ): Promise<void> {
    const sendSuccess = this.createSendSuccess(returnData);

    try {
      let response: JsonValue | undefined;

      switch (operation as AccountsReceivableOperation) {
        case "getAll":
          response = await this.handleGetAll(authContext);
          break;
        case "get":
          response = await this.handleGet(authContext);
          break;
        case "getCondensed":
          response = await this.handleGetCondensed(authContext);
          break;
        default:
          throw new NodeOperationError(
            this.context.getNode(),
            `The operation "${operation}" is not supported for resource "accountsReceivable".`,
            { itemIndex: this.itemIndex },
          );
      }

      sendSuccess(response);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetAll(authContext: AuthContext): Promise<JsonValue> {
    const queryParams = this.buildQueryParams();
    const result = await datevConnectClient.accounting.getAccountsReceivable(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
    return result ?? null;
  }

  private async handleGet(authContext: AuthContext): Promise<JsonValue> {
    const accountsReceivableId = this.getRequiredString("accountsReceivableId");
    const queryParams = this.buildQueryParams();
    const result = await datevConnectClient.accounting.getAccountReceivable(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      accountsReceivableId,
      queryParams
    );
    return result ?? null;
  }

  private async handleGetCondensed(authContext: AuthContext): Promise<JsonValue> {
    const queryParams = this.buildQueryParams();
    const result = await datevConnectClient.accounting.getAccountsReceivableCondensed(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
    return result ?? null;
  }
}