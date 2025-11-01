/**
 * Type definitions for DATEV Accounting API
 */

// Authentication context for API calls
export interface AuthContext {
  host: string;
  token: string;
  clientInstanceId: string;
}

// Supported accounting resources
export type AccountingResource = 
  | "client"
  | "fiscalYear" 
  | "accountsReceivable"
  | "accountPosting"
  | "accountingSequence";

// Operations for each resource
export type ClientOperation = "getAll" | "get";
export type FiscalYearOperation = "getAll" | "get";
export type AccountsReceivableOperation = "getAll" | "get" | "getCondensed";
export type AccountPostingOperation = "getAll" | "get";
export type AccountingSequenceOperation = "create" | "getAll" | "get";

// Union type for all operations
export type AccountingOperation = 
  | ClientOperation
  | FiscalYearOperation
  | AccountsReceivableOperation
  | AccountPostingOperation
  | AccountingSequenceOperation;

// Client entity types
export interface Client {
  id?: string;
  company_data?: CompanyData;
}

export interface CompanyData {
  creditor_identifier?: string;
  name?: string;
  address?: Address;
  communication?: Communication[];
}

export interface Address {
  id?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  address_usage_type?: AddressUsageType;
}

export interface AddressUsageType {
  is_correspondence_address?: boolean;
  is_main_address?: boolean;
}

export interface Communication {
  id?: string;
  type?: string;
  value?: string;
  communication_usage_type?: CommunicationUsageType;
}

export interface CommunicationUsageType {
  is_main_communication_usage_type?: boolean;
}

// Fiscal Year entity types
export interface FiscalYear {
  id?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

// Accounts Receivable entity types
export interface AccountsReceivable {
  id?: string;
  account_number?: string;
  document_field1?: string;
  date?: string;
  due_date?: string;
  amount?: number;
  open_balance_of_item?: number;
  is_cleared?: boolean;
  debit_credit_identifier?: string;
  additional_information?: AdditionalInformation[];
}

export interface AdditionalInformation {
  additional_information_type?: string;
  content?: string;
}

// Account Posting entity types
export interface AccountPosting {
  id?: string;
  account_number?: string;
  date?: string;
  amount?: number;
  currency?: string;
  description?: string;
  accounting_transaction_key?: string;
}

// Accounting Sequence entity types
export interface AccountingSequence {
  id?: string;
  date_from?: string;
  date_to?: string;
  accounting_reason?: string;
  description?: string;
  accounting_records?: AccountingRecord[];
}

export interface AccountingRecord {
  id?: string;
  account_number?: string;
  date?: string;
  amount?: number;
  description?: string;
  accounting_transaction_key?: string;
}

// Error response type
export interface ErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: any;
  };
}