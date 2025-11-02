import { NodeOperationError, type INodeExecutionData } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AuthContext, AccountingSequenceOperation } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for all accounting sequence-related operations
 */
export class AccountingSequenceResourceHandler extends BaseResourceHandler {
  async execute(
    operation: string,
    authContext: AuthContext,
    returnData: INodeExecutionData[],
  ): Promise<void> {
    const sendSuccess = this.createSendSuccess(returnData);

    try {
      let response: JsonValue | undefined;

      switch (operation as AccountingSequenceOperation) {
        case "create":
          response = await this.handleCreate(authContext);
          break;
        case "getAll":
          response = await this.handleGetAll(authContext);
          break;
        case "get":
          response = await this.handleGet(authContext);
          break;
        case "getAccountingRecords":
          response = await this.handleGetAccountingRecords(authContext);
          break;
        case "getAccountingRecord":
          response = await this.handleGetAccountingRecord(authContext);
          break;
        default:
          throw new NodeOperationError(
            this.context.getNode(),
            `The operation "${operation}" is not supported for resource "accountingSequence".`,
            { itemIndex: this.itemIndex },
          );
      }

      sendSuccess(response);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleCreate(authContext: AuthContext): Promise<JsonValue> {
    const accountingSequenceData = this.getRequiredString("accountingSequenceData");
    const data = this.parseJsonParameter(accountingSequenceData, "accountingSequenceData");
    
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new NodeOperationError(
        this.context.getNode(),
        "Accounting sequence data must be a valid JSON object",
        { itemIndex: this.itemIndex }
      );
    }
    
    const result = await datevConnectClient.accounting.createAccountingSequence(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      data,
    );
    
    return result ?? null;
  }

  private async handleGetAll(authContext: AuthContext): Promise<JsonValue> {
    const result = await datevConnectClient.accounting.getAccountingSequences(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
    );
    
    return result ?? null;
  }

  private async handleGet(authContext: AuthContext): Promise<JsonValue> {
    const accountingSequenceId = this.getRequiredString("accountingSequenceId");
    
    const result = await datevConnectClient.accounting.getAccountingSequence(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      accountingSequenceId,
    );
    
    return result ?? null;
  }

  private async handleGetAccountingRecords(authContext: AuthContext): Promise<JsonValue> {
    const accountingSequenceId = this.getRequiredString("accountingSequenceId");
    const queryParams = this.buildQueryParams();
    
    const result = await datevConnectClient.accounting.getAccountingRecords(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      accountingSequenceId,
      queryParams,
    );
    
    return result ?? null;
  }

  private async handleGetAccountingRecord(authContext: AuthContext): Promise<JsonValue> {
    const accountingSequenceId = this.getRequiredString("accountingSequenceId");
    const accountingRecordId = this.getRequiredString("accountingRecordId");
    const queryParams = this.buildQueryParams();
    
    const result = await datevConnectClient.accounting.getAccountingRecord(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      accountingSequenceId,
      accountingRecordId,
      queryParams,
    );
    
    return result ?? null;
  }
}