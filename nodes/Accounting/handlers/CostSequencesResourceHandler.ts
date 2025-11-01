import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Cost Sequences operations
 * Manages operations related to cost accounting sequences
 */
export class CostSequencesResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getAll":
        return this.getAllCostSequences();
      case "get":
        return this.getCostSequence();
      case "create":
        return this.createCostSequence();
      case "getCostAccountingRecords":
        return this.getCostAccountingRecords();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getAllCostSequences(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costSequences = await datevConnectClient.accounting.getCostSequences(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        queryParams
      );
      return this.wrapData(costSequences as any);
    } catch (error) {
      this.handleApiError(error, "Get all cost sequences");
    }
  }

  private async getCostSequence(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const costSequenceId = this.executeFunctions.getNodeParameter("costSequenceId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costSequence = await datevConnectClient.accounting.getCostSequence(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        costSequenceId,
        queryParams
      );
      return this.wrapData(costSequence as any);
    } catch (error) {
      this.handleApiError(error, "Get cost sequence");
    }
  }

  private async createCostSequence(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const costSequenceId = this.executeFunctions.getNodeParameter("costSequenceId", 0) as string;
      const costSequenceData = this.executeFunctions.getNodeParameter("costSequenceData", 0) as object;
      const result = await datevConnectClient.accounting.createCostSequence(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        costSequenceId,
        costSequenceData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Create cost sequence");
    }
  }

  private async getCostAccountingRecords(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const costSystemId = this.executeFunctions.getNodeParameter("costSystemId", 0) as string;
      const costSequenceId = this.executeFunctions.getNodeParameter("costSequenceId", 0) as string;
      const queryParams = this.buildQueryParams();
      const costAccountingRecords = await datevConnectClient.accounting.getCostAccountingRecords(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        costSystemId,
        costSequenceId,
        queryParams
      );
      return this.wrapData(costAccountingRecords as any);
    } catch (error) {
      this.handleApiError(error, "Get cost accounting records");
    }
  }
}