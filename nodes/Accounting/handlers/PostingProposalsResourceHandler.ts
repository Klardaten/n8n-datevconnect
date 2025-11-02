import { NodeOperationError, type INodeExecutionData } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import { datevConnectClient } from "../../../src/services/accountingClient";
import type { AuthContext, PostingProposalOperation } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for Posting Proposals operations
 * Manages posting proposal rules and batch operations for invoices and cash register data
 */
export class PostingProposalsResourceHandler extends BaseResourceHandler {
  async execute(
    operation: string,
    authContext: AuthContext,
    returnData: INodeExecutionData[],
  ): Promise<void> {
    const sendSuccess = this.createSendSuccess(returnData);

    try {
      let response: JsonValue | undefined;

      switch (operation as PostingProposalOperation) {
        case "getRulesIncoming":
          response = await this.handleGetRulesIncoming(authContext);
          break;
        case "getRulesOutgoing":
          response = await this.handleGetRulesOutgoing(authContext);
          break;
        case "getRulesCashRegister":
          response = await this.handleGetRulesCashRegister(authContext);
          break;
        case "getRuleIncoming":  
          response = await this.handleGetRuleIncoming(authContext);
          break;
        case "getRuleOutgoing":
          response = await this.handleGetRuleOutgoing(authContext);
          break;
        case "getRuleCashRegister":
          response = await this.handleGetRuleCashRegister(authContext);
          break;
        case "batchIncoming":
          response = await this.handleBatchIncoming(authContext);
          break;
        case "batchOutgoing":
          response = await this.handleBatchOutgoing(authContext);
          break;
        case "batchCashRegister":
          response = await this.handleBatchCashRegister(authContext);
          break;
        default:
          throw new NodeOperationError(
            this.context.getNode(),
            `The operation "${operation}" is not supported for resource "postingProposals".`,
            { itemIndex: this.itemIndex },
          );
      }

      sendSuccess(response);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  // New handle methods for the converted pattern

















  // New handle methods for the converted pattern
  private async handleGetRulesIncoming(authContext: AuthContext): Promise<JsonValue> {
    const queryParams = this.buildQueryParams();
    return await datevConnectClient.accounting.getPostingProposalRulesIncoming(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
  }

  private async handleGetRulesOutgoing(authContext: AuthContext): Promise<JsonValue> {
    const queryParams = this.buildQueryParams();
    return await datevConnectClient.accounting.getPostingProposalRulesOutgoing(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
  }

  private async handleGetRulesCashRegister(authContext: AuthContext): Promise<JsonValue> {
    const queryParams = this.buildQueryParams();
    return await datevConnectClient.accounting.getPostingProposalRulesCashRegister(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      queryParams
    );
  }

  private async handleGetRuleIncoming(authContext: AuthContext): Promise<JsonValue> {
    const ruleId = this.getRequiredString("ruleId");
    const queryParams = this.buildQueryParams();
    return await datevConnectClient.accounting.getPostingProposalRuleIncoming(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      ruleId,
      queryParams
    );
  }

  private async handleGetRuleOutgoing(authContext: AuthContext): Promise<JsonValue> {
    const ruleId = this.getRequiredString("ruleId");
    const queryParams = this.buildQueryParams();
    return await datevConnectClient.accounting.getPostingProposalRuleOutgoing(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      ruleId,
      queryParams
    );
  }

  private async handleGetRuleCashRegister(authContext: AuthContext): Promise<JsonValue> {
    const ruleId = this.getRequiredString("ruleId");
    const queryParams = this.buildQueryParams();
    return await datevConnectClient.accounting.getPostingProposalRuleCashRegister(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      ruleId,
      queryParams
    );
  }

  private async handleBatchIncoming(authContext: AuthContext): Promise<JsonValue | undefined> {
    const batchDataRaw = this.context.getNodeParameter("batchData", this.itemIndex);
    const batchData: JsonValue = this.parseJsonParameter(batchDataRaw, "batchData");
    return await datevConnectClient.accounting.batchPostingProposalsIncoming(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      batchData
    );
  }

  private async handleBatchOutgoing(authContext: AuthContext): Promise<JsonValue | undefined> {
    const batchDataRaw = this.context.getNodeParameter("batchData", this.itemIndex);
    const batchData: JsonValue = this.parseJsonParameter(batchDataRaw, "batchData");
    return await datevConnectClient.accounting.batchPostingProposalsOutgoing(
      this.context,
      authContext.clientId,
      authContext.fiscalYearId,
      batchData
    );
  }

  private async handleBatchCashRegister(authContext: AuthContext): Promise<JsonValue | undefined> {
    const batchDataRaw = this.context.getNodeParameter("batchData", this.itemIndex);
    const batchData: JsonValue = this.parseJsonParameter(batchDataRaw, "batchData");
    return await datevConnectClient.accounting.batchPostingProposalsCashRegister(
      this.context,
      authContext.clientId,  
      authContext.fiscalYearId,
      batchData
    );
  }
}