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
  TermsOfPaymentResourceHandler,
  StocktakingDataResourceHandler,
  CostSystemsResourceHandler,
  CostCentersUnitsResourceHandler,
  CostCenterPropertiesResourceHandler,
  InternalCostServicesResourceHandler,
  CostSequencesResourceHandler,
  AccountingStatisticsResourceHandler,
  AccountingTransactionKeysResourceHandler,
  VariousAddressesResourceHandler,
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
 * - Terms of payment
 * - Stocktaking data
 * - Cost systems
 * - Cost centers/units
 * - Cost center properties
 * - Internal cost services
 * - Cost sequences
 * - Accounting statistics
 * - Accounting transaction keys
 * - Various addresses
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
          case "termsOfPayment":
            handler = new TermsOfPaymentResourceHandler(this);
            break;
          case "stocktakingData":
            handler = new StocktakingDataResourceHandler(this);
            break;
          case "costSystems":
            handler = new CostSystemsResourceHandler(this);
            break;
          case "costCentersUnits":
            handler = new CostCentersUnitsResourceHandler(this);
            break;
          case "costCenterProperties":
            handler = new CostCenterPropertiesResourceHandler(this);
            break;
          case "internalCostServices":
            handler = new InternalCostServicesResourceHandler(this);
            break;
          case "costSequences":
            handler = new CostSequencesResourceHandler(this);
            break;
          case "accountingStatistics":
            handler = new AccountingStatisticsResourceHandler(this);
            break;
          case "accountingTransactionKeys":
            handler = new AccountingTransactionKeysResourceHandler(this);
            break;
          case "variousAddresses":
            handler = new VariousAddressesResourceHandler(this);
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