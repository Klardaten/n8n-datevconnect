import { NodeOperationError, type INodeExecutionData } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AuthContext, VariousAddressOperation } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for Various Addresses operations
 * Manages operations related to address management for various business partners
 */
export class VariousAddressesResourceHandler extends BaseResourceHandler {
  async execute(
    operation: string,
    authContext: AuthContext,
    returnData: INodeExecutionData[],
  ): Promise<void> {
    const sendSuccess = this.createSendSuccess(returnData);

    try {
      let response: JsonValue | undefined;

      switch (operation as VariousAddressOperation) {
        case "getAll":
          response = await this.handleGetAll(authContext);
          break;
        case "get":
          response = await this.handleGet(authContext);
          break;
        case "create":
          response = await this.handleCreate(authContext);
          break;
        default:
          throw new NodeOperationError(
            this.context.getNode(),
            `The operation "${operation}" is not supported for resource "variousAddresses".`,
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
    const result = await datevConnectClient.accounting.getVariousAddresses(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
    return result ?? null;
  }

  private async handleGet(authContext: AuthContext): Promise<JsonValue> {
    const variousAddressId = this.getRequiredString("variousAddressId");
    const queryParams = this.buildQueryParams();
    const result = await datevConnectClient.accounting.getVariousAddress(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      variousAddressId,
      queryParams
    );
    return result ?? null;
  }

  private async handleCreate(authContext: AuthContext): Promise<JsonValue> {
    const variousAddressData = this.getRequiredString("variousAddressData");
    const data = this.parseJsonParameter(variousAddressData, "variousAddressData");
    
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new NodeOperationError(
        this.context.getNode(),
        "Various address data must be a valid JSON object",
        { itemIndex: this.itemIndex }
      );
    }
    
    const result = await datevConnectClient.accounting.createVariousAddress(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      data
    );
    return result ?? null;
  }
}