import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";

import { accountingNodeDescription } from "./Accounting.config";
import { 
  ClientResourceHandler,
  FiscalYearResourceHandler,
  AccountsReceivableResourceHandler,
  AccountsPayableResourceHandler,
  AccountPostingResourceHandler,
  AccountingSequenceResourceHandler,
  PostingProposalsResourceHandler,
  AccountingSumsAndBalancesResourceHandler,
  BusinessPartnersResourceHandler,
  GeneralLedgerAccountsResourceHandler,
} from "./handlers";

/**
 * DATEV Accounting node for n8n
 * 
 * This node provides access to DATEV Accounting API endpoints including:
 * - Clients management
 * - Fiscal years
 * - Accounts receivable
 * - Accounts payable
 * - Account postings
 * - Accounting sequences
 * - Posting proposals
 * - Accounting sums and balances
 * - Business partners (debitors/creditors)
 * - General ledger accounts
 */
export class Accounting implements INodeType {
  description: INodeTypeDescription = accountingNodeDescription;

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        // Get resource and operation from node parameters
        const resource = this.getNodeParameter("resource", itemIndex) as string;
        
        // Get the appropriate handler for this resource
        let handler;
        switch (resource) {
          case "client":
            handler = new ClientResourceHandler(this);
            break;
          case "fiscalYear":
            handler = new FiscalYearResourceHandler(this);
            break;
          case "accountsReceivable":
            handler = new AccountsReceivableResourceHandler(this);
            break;
          case "accountsPayable":
            handler = new AccountsPayableResourceHandler(this);
            break;
          case "accountPosting":
            handler = new AccountPostingResourceHandler(this);
            break;
          case "accountingSequence":
            handler = new AccountingSequenceResourceHandler(this);
            break;
          case "postingProposals":
            handler = new PostingProposalsResourceHandler(this);
            break;
          case "accountingSumsAndBalances":
            handler = new AccountingSumsAndBalancesResourceHandler(this);
            break;
          case "businessPartners":
            handler = new BusinessPartnersResourceHandler(this);
            break;
          case "generalLedgerAccounts":
            handler = new GeneralLedgerAccountsResourceHandler(this);
            break;
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }
        
        // Execute the handler and get results
        const results = await handler.execute();
        returnData.push(...results);
        
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            pairedItem: { item: itemIndex },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}