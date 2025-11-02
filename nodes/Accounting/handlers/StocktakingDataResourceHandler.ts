import { NodeOperationError, type INodeExecutionData } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AuthContext, StocktakingDataOperation } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for Stocktaking Data operations
 * Manages operations related to inventory/stocktaking data in asset accounting
 */
export class StocktakingDataResourceHandler extends BaseResourceHandler {
  async execute(
    operation: string,
    authContext: AuthContext,
    returnData: INodeExecutionData[],
  ): Promise<void> {
    const sendSuccess = this.createSendSuccess(returnData);

    try {
      let response: JsonValue | undefined;

      switch (operation as StocktakingDataOperation) {
        case "getAll":
          response = await this.handleGetAll(authContext);
          break;
        case "get":
          response = await this.handleGet(authContext);
          break;
        case "update":
          response = await this.handleUpdate(authContext);
          break;
        default:
          throw new NodeOperationError(
            this.context.getNode(),
            `The operation "${operation}" is not supported for resource "stocktakingData".`,
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
    const result = await datevConnectClient.accounting.getStocktakingData(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
    return result ?? null;
  }

  private async handleGet(authContext: AuthContext): Promise<JsonValue> {
    const assetId = this.getRequiredString("assetId");
    const queryParams = this.buildQueryParams();
    const result = await datevConnectClient.accounting.getStocktakingDataByAsset(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      assetId,
      queryParams
    );
    return result ?? null;
  }

  private async handleUpdate(authContext: AuthContext): Promise<JsonValue> {
    const assetId = this.getRequiredString("assetId");
    const stocktakingData = this.getRequiredString("stocktakingData");
    const data = this.parseJsonParameter(stocktakingData, "stocktakingData");
    
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new NodeOperationError(
        this.context.getNode(),
        "Stocktaking data must be a valid JSON object",
        { itemIndex: this.itemIndex }
      );
    }
    
    const result = await datevConnectClient.accounting.updateStocktakingData(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      assetId,
      data
    );
    return result ?? null;
  }
}