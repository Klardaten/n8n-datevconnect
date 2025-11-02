import { NodeOperationError, type INodeExecutionData } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AuthContext, TermsOfPaymentOperation } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for Terms of Payment operations
 * Manages operations related to payment terms configurations and settings
 */
export class TermsOfPaymentResourceHandler extends BaseResourceHandler {
  async execute(
    operation: string,
    authContext: AuthContext,
    returnData: INodeExecutionData[],
  ): Promise<void> {
    const sendSuccess = this.createSendSuccess(returnData);

    try {
      let response: JsonValue | undefined;

      switch (operation as TermsOfPaymentOperation) {
        case "getAll":
          response = await this.handleGetAll(authContext);
          break;
        case "get":
          response = await this.handleGet(authContext);
          break;
        case "create":
          response = await this.handleCreate(authContext);
          break;
        case "update":
          response = await this.handleUpdate(authContext);
          break;
        default:
          throw new NodeOperationError(
            this.context.getNode(),
            `The operation "${operation}" is not supported for resource "termsOfPayment".`,
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
    const result = await datevConnectClient.accounting.getTermsOfPayment(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
    return result ?? null;
  }

  private async handleGet(authContext: AuthContext): Promise<JsonValue> {
    const termOfPaymentId = this.getRequiredString("termOfPaymentId");
    const queryParams = this.buildQueryParams();
    const result = await datevConnectClient.accounting.getTermOfPayment(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      termOfPaymentId,
      queryParams
    );
    return result ?? null;
  }

  private async handleCreate(authContext: AuthContext): Promise<JsonValue> {
    const termOfPaymentData = this.getRequiredString("termOfPaymentData");
    const data = this.parseJsonParameter(termOfPaymentData, "termOfPaymentData");
    
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new NodeOperationError(
        this.context.getNode(),
        "Term of payment data must be a valid JSON object",
        { itemIndex: this.itemIndex }
      );
    }
    
    const result = await datevConnectClient.accounting.createTermOfPayment(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      data
    );
    return result ?? null;
  }

  private async handleUpdate(authContext: AuthContext): Promise<JsonValue> {
    const termOfPaymentId = this.getRequiredString("termOfPaymentId");
    const termOfPaymentData = this.getRequiredString("termOfPaymentData");
    const data = this.parseJsonParameter(termOfPaymentData, "termOfPaymentData");
    
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new NodeOperationError(
        this.context.getNode(),
        "Term of payment data must be a valid JSON object",
        { itemIndex: this.itemIndex }
      );
    }
    
    const result = await datevConnectClient.accounting.updateTermOfPayment(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      termOfPaymentId,
      data
    );
    return result ?? null;
  }
}