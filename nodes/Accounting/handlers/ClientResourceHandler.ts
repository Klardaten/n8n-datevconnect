import { NodeOperationError, type INodeExecutionData } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AuthContext, ClientOperation } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for all accounting client-related operations
 */
export class ClientResourceHandler extends BaseResourceHandler {
  async execute(
    operation: string,
    authContext: AuthContext,
    returnData: INodeExecutionData[],
  ): Promise<void> {
    const sendSuccess = this.createSendSuccess(returnData);

    try {
      let response: JsonValue | undefined;

      switch (operation as ClientOperation) {
        case "getAll":
          response = await this.handleGetAll(authContext);
          break;
        case "get":
          response = await this.handleGet(authContext);
          break;
        default:
          throw new NodeOperationError(
            this.context.getNode(),
            `The operation "${operation}" is not supported for resource "client".`,
            { itemIndex: this.itemIndex },
          );
      }

      sendSuccess(response);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetAll(authContext: AuthContext): Promise<JsonValue> {
    const top = this.getNumberParameter("top", 100);
    const skip = this.getNumberParameter("skip", 0);
    const select = this.getOptionalString("select");
    const filter = this.getOptionalString("filter");

    return await datevConnectClient.accounting.getClients(
      this.context,
      { 
        ...authContext,
        $top: top,
        $skip: skip,
        $select: select,
        $filter: filter,
      }
    );
  }

  private async handleGet(authContext: AuthContext): Promise<JsonValue> {
    const clientId = this.getRequiredString("clientId");
    const select = this.getOptionalString("select");

    return await datevConnectClient.accounting.getClient(
      this.context,
      clientId,
      {
        ...authContext,
        $select: select,
      }
    );
  }
}