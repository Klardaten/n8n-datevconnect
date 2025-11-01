import type { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { BaseResourceHandler } from "./BaseResourceHandler";
import { datevConnectClient } from "../../../src/services/accountingClient";

/**
 * Handler for Posting Proposals operations
 * Manages posting proposal rules and batch operations for invoices and cash register data
 */
export class PostingProposalsResourceHandler extends BaseResourceHandler {
  private operation: string;

  constructor(executeFunctions: IExecuteFunctions) {
    super(executeFunctions);
    this.operation = executeFunctions.getNodeParameter("operation", 0) as string;
  }

  async execute(): Promise<INodeExecutionData[]> {
    switch (this.operation) {
      case "getRulesIncoming":
        return this.getPostingProposalRulesIncoming();
      case "getRulesOutgoing":
        return this.getPostingProposalRulesOutgoing();
      case "getRulesCashRegister":
        return this.getPostingProposalRulesCashRegister();
      case "getRuleIncoming":  
        return this.getPostingProposalRuleIncoming();
      case "getRuleOutgoing":
        return this.getPostingProposalRuleOutgoing();
      case "getRuleCashRegister":
        return this.getPostingProposalRuleCashRegister();
      case "batchIncoming":
        return this.batchPostingProposalsIncoming();
      case "batchOutgoing":
        return this.batchPostingProposalsOutgoing();
      case "batchCashRegister":
        return this.batchPostingProposalsCashRegister();
      default:
        throw new Error(`Unknown operation: ${this.operation}`);
    }
  }

  private async getPostingProposalRulesIncoming(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const rules = await datevConnectClient.accounting.getPostingProposalRulesIncoming(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(rules as any);
    } catch (error) {
      this.handleApiError(error, "Get posting proposal rules for incoming invoices");
    }
  }

  private async getPostingProposalRulesOutgoing(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const rules = await datevConnectClient.accounting.getPostingProposalRulesOutgoing(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(rules as any);
    } catch (error) {
      this.handleApiError(error, "Get posting proposal rules for outgoing invoices");
    }
  }

  private async getPostingProposalRulesCashRegister(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const queryParams = this.buildQueryParams();
      const rules = await datevConnectClient.accounting.getPostingProposalRulesCashRegister(
        this.executeFunctions, 
        this.clientId,
        this.fiscalYearId,
        queryParams
      );
      return this.wrapData(rules as any);
    } catch (error) {
      this.handleApiError(error, "Get posting proposal rules for cash register");
    }
  }

  private async getPostingProposalRuleIncoming(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const ruleId = this.executeFunctions.getNodeParameter("postingProposalRuleId", 0) as string;
      const queryParams = this.buildQueryParams();
      const rule = await datevConnectClient.accounting.getPostingProposalRuleIncoming(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        ruleId,
        queryParams
      );
      return this.wrapData(rule as any);
    } catch (error) {
      this.handleApiError(error, "Get posting proposal rule for incoming invoice");
    }
  }

  private async getPostingProposalRuleOutgoing(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const ruleId = this.executeFunctions.getNodeParameter("postingProposalRuleId", 0) as string;
      const queryParams = this.buildQueryParams();
      const rule = await datevConnectClient.accounting.getPostingProposalRuleOutgoing(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        ruleId,
        queryParams
      );
      return this.wrapData(rule as any);
    } catch (error) {
      this.handleApiError(error, "Get posting proposal rule for outgoing invoice");
    }
  }

  private async getPostingProposalRuleCashRegister(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const ruleId = this.executeFunctions.getNodeParameter("postingProposalRuleId", 0) as string;
      const queryParams = this.buildQueryParams();
      const rule = await datevConnectClient.accounting.getPostingProposalRuleCashRegister(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        ruleId,
        queryParams
      );
      return this.wrapData(rule as any);
    } catch (error) {
      this.handleApiError(error, "Get posting proposal rule for cash register");
    }
  }

  private async batchPostingProposalsIncoming(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const batchData = this.executeFunctions.getNodeParameter("postingProposalData", 0) as any;
      const result = await datevConnectClient.accounting.batchPostingProposalsIncoming(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        batchData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Batch posting proposals for incoming invoices");
    }
  }

  private async batchPostingProposalsOutgoing(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const batchData = this.executeFunctions.getNodeParameter("postingProposalData", 0) as any;
      const result = await datevConnectClient.accounting.batchPostingProposalsOutgoing(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        batchData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Batch posting proposals for outgoing invoices");
    }
  }

  private async batchPostingProposalsCashRegister(): Promise<INodeExecutionData[]> {
    try {
      if (!this.clientId || !this.fiscalYearId) {
        throw new Error("Client ID and Fiscal Year ID are required");
      }
      const batchData = this.executeFunctions.getNodeParameter("postingProposalData", 0) as any;
      const result = await datevConnectClient.accounting.batchPostingProposalsCashRegister(
        this.executeFunctions,
        this.clientId,
        this.fiscalYearId,
        batchData
      );
      return this.wrapData(result as any);
    } catch (error) {
      this.handleApiError(error, "Batch posting proposals for cash register");
    }
  }
}