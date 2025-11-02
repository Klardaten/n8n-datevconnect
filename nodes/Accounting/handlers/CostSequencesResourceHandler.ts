import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

type CostSequencesOperation = "getAll" | "get" | "create" | "getCostAccountingRecords";

interface AuthContext {
  clientId: string;
  fiscalYearId: string;
}

/**
 * Handler for Cost Sequences operations
 * Manages operations related to cost accounting sequences
 */
export class CostSequencesResourceHandler extends BaseResourceHandler {
  constructor(context: IExecuteFunctions, itemIndex: number) {
    super(context, itemIndex);
  }

  async execute(
    operation: CostSequencesOperation,
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
      case "create":
        await this.handleCreate(authContext, returnData);
        break;
      case "getCostAccountingRecords":
        await this.handleGetCostAccountingRecords(authContext, returnData);
        break;
      default:
        throw new NodeOperationError(this.context.getNode(), `Unknown operation: ${operation}`, {
          itemIndex: this.itemIndex,
        });
    }
  }

  private async handleGetAll(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const costSystemId = this.getRequiredString("costSystemId");
      const queryParams = this.buildQueryParams();
      const costSequences = await datevConnectClient.accounting.getCostSequences(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costSequences);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGet(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const costSystemId = this.getRequiredString("costSystemId");
      const costSequenceId = this.getRequiredString("costSequenceId");
      const queryParams = this.buildQueryParams();
      const costSequence = await datevConnectClient.accounting.getCostSequence(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        costSequenceId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costSequence);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleCreate(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const costSystemId = this.getRequiredString("costSystemId");
      const costSequenceId = this.getRequiredString("costSequenceId");
      const costSequenceDataRaw = this.context.getNodeParameter("costSequenceData", this.itemIndex);
      const costSequenceData = this.parseJsonParameter(costSequenceDataRaw, "costSequenceData");
      
      const result = await datevConnectClient.accounting.createCostSequence(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        costSequenceId,
        costSequenceData
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(result);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }

  private async handleGetCostAccountingRecords(authContext: AuthContext, returnData: INodeExecutionData[]): Promise<void> {
    try {
      const costSystemId = this.getRequiredString("costSystemId");
      const costSequenceId = this.getRequiredString("costSequenceId");
      const queryParams = this.buildQueryParams();
      const costAccountingRecords = await datevConnectClient.accounting.getCostAccountingRecords(
        this.context,
        authContext.clientId,
        authContext.fiscalYearId,
        costSystemId,
        costSequenceId,
        queryParams
      );
      
      const sendSuccess = this.createSendSuccess(returnData);
      sendSuccess(costAccountingRecords);
    } catch (error) {
      this.handleError(error, returnData);
    }
  }
}