/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { AccountPostingResourceHandler } from "../../../../nodes/Accounting/handlers/AccountPostingResourceHandler";
import type { AuthContext } from "../../../../nodes/Accounting/types";
import { datevConnectClient } from "../../../../src/services/accountingClient";

// Test spies
let getAccountPostingsSpy: any;
let getAccountPostingSpy: any;

// Mock data
const mockAccountPostingData = [
  {
    id: "account-posting-123",
    account: "1200",
    amount: 1000.00,
    debit: true,
    credit: false
  },
  {
    id: "account-posting-456", 
    account: "4000",
    amount: 500.50,
    debit: false,
    credit: true
  }
];

const mockSingleAccountPosting = {
  id: "account-posting-123",
  account: "1200",
  amount: 1000.00,
  debit: true,
  credit: false,
  description: "Test account posting"
};

// Mock IExecuteFunctions
const createMockContext = (overrides: any = {}) => ({
  getCredentials: mock().mockResolvedValue({
    host: "https://api.example.com",
    email: "user@example.com",
    password: "secret",
    clientInstanceId: "instance-1",
    ...overrides.credentials,
  }),
  getNodeParameter: mock((name: string, itemIndex: number, defaultValue?: unknown) => {
    const mockParams: Record<string, unknown> = {
      "accountPostingId": "account-posting-123",
      "top": 50,
      "skip": 10,
      "select": "id,account,amount",
      "filter": "amount gt 100",
      "expand": "relationships",
      ...overrides.parameters,
    };
    return mockParams[name] !== undefined ? mockParams[name] : defaultValue;
  }),
  getNode: mock(() => ({ name: "TestNode" })),
  helpers: {
    returnJsonArray: mock((data: any[]) => data.map(entry => ({ json: entry }))),
    constructExecutionMetaData: mock((data: any[], meta: any) => 
      data.map(entry => ({ ...entry, pairedItem: meta.itemData }))
    ),
  },
  continueOnFail: mock(() => false),
  ...overrides.context,
});

const mockAuthContext: AuthContext = {
  host: "https://test.datev.de",
  token: "test-token",
  clientInstanceId: "test-instance",
  clientId: "client-123",
  fiscalYearId: "2023"
};

describe("AccountPostingResourceHandler", () => {
  let getAccountPostingsSpy: any;
  let getAccountPostingSpy: any;

  beforeEach(() => {
    getAccountPostingsSpy = spyOn(datevConnectClient.accounting, "getAccountPostings").mockResolvedValue(mockAccountPostingData);
    getAccountPostingSpy = spyOn(datevConnectClient.accounting, "getAccountPosting").mockResolvedValue(mockSingleAccountPosting);
  });

  afterEach(() => {
    getAccountPostingsSpy.mockRestore();
    getAccountPostingSpy.mockRestore();
  });

  describe("getAll operation", () => {
    test("fetches account postings with parameters", async () => {
      const context = createMockContext();
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountPostingsSpy).toHaveBeenCalledWith(context, "client-123", "2023", {
        top: 50,
        skip: 10,
        select: "id,account,amount",
        filter: "amount gt 100",
        expand: "relationships"
      });

      expect(returnData).toHaveLength(2);
      expect(returnData[0].json).toEqual({
        id: "account-posting-123",
        account: "1200",
        amount: 1000.00,
        debit: true,
        credit: false
      });
    });

    test("handles empty results", async () => {
      getAccountPostingsSpy.mockResolvedValueOnce([]);
      const context = createMockContext();
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(0);
    });

    test("handles parameters with default values", async () => {
      const context = createMockContext({
        parameters: {
          "top": undefined,
          "skip": undefined,
          "select": undefined,
          "filter": undefined,
        }
      });
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountPostingsSpy).toHaveBeenCalledWith(context, "client-123", "2023", {
        top: 100,  // Default value when top is undefined
        expand: "relationships"
      });
    });
  });

  describe("get operation", () => {
    test("fetches single account posting by ID", async () => {
      const context = createMockContext();
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("get", mockAuthContext, returnData);

      expect(getAccountPostingSpy).toHaveBeenCalledWith(context, "client-123", "2023", "account-posting-123", {
        top: 50,
        skip: 10,
        select: "id,account,amount",
        filter: "amount gt 100",
        expand: "relationships"
      });

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual(mockSingleAccountPosting);
    });

    test("handles parameters with default values for get", async () => {
      const context = createMockContext({
        parameters: {
          "top": undefined,
          "skip": undefined,
          "select": undefined,
          "filter": undefined,
          "accountPostingId": "test-account-posting-id"
        }
      });
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("get", mockAuthContext, returnData);

      expect(getAccountPostingSpy).toHaveBeenCalledWith(context, "client-123", "2023", "test-account-posting-id", {
        top: 100,  // Default value when top is undefined
        expand: "relationships"
      });
    });
  });

  describe("error handling", () => {
    test("throws NodeApiError for unsupported operation", async () => {
      const context = createMockContext();
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await expect(
        handler.execute("unsupportedOperation" as any, mockAuthContext, returnData)
      ).rejects.toThrow('The operation "unsupportedOperation" is not supported for resource "accountPosting".');
    });

    test("handles API errors gracefully when continueOnFail is true", async () => {
      getAccountPostingsSpy.mockRejectedValueOnce(new Error("API Error"));
      const context = createMockContext({
        context: {
          continueOnFail: mock(() => true)
        }
      });
      
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ error: "API Error" });
    });

    test("propagates error when continueOnFail is false", async () => {
      getAccountPostingsSpy.mockRejectedValueOnce(new Error("API Error"));
      const context = createMockContext();
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await expect(
        handler.execute("getAll", mockAuthContext, returnData)
      ).rejects.toThrow("API Error");
    });
  });

  describe("inheritance from BaseResourceHandler", () => {
    test("uses proper execution context", async () => {
      const context = createMockContext();
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountPostingsSpy).toHaveBeenCalledWith(
        context,
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );
    });

    test("handles metadata properly", async () => {
      const context = createMockContext();
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData[0].json).toEqual(mockAccountPostingData[0]);
    });

    test("respects item index in error handling", async () => {
      getAccountPostingsSpy.mockRejectedValueOnce(new Error("Test error"));
      const context = createMockContext({
        context: {
          continueOnFail: mock(() => true)
        }
      });
      
      const handler = new AccountPostingResourceHandler(context, 5);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData[0].json).toEqual({ error: "Test error" });
    });
  });

  describe("parameter handling", () => {
    test("correctly retrieves select parameter", async () => {
      const context = createMockContext({
        parameters: { select: "id,account,description" }
      });
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountPostingsSpy).toHaveBeenCalledWith(
        context,
        "client-123",
        "2023",
        expect.objectContaining({ select: "id,account,description" })
      );
    });

    test("correctly retrieves filter parameter", async () => {
      const context = createMockContext({
        parameters: { filter: "amount gt 500" }
      });
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountPostingsSpy).toHaveBeenCalledWith(
        context,
        "client-123", 
        "2023",
        expect.objectContaining({ filter: "amount gt 500" })
      );
    });

    test("correctly retrieves accountPostingId parameter", async () => {
      const context = createMockContext({
        parameters: { accountPostingId: "test-account-posting-id" }
      });
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("get", mockAuthContext, returnData);

      expect(getAccountPostingSpy).toHaveBeenCalledWith(
        context,
        "client-123",
        "2023", 
        "test-account-posting-id",
        expect.any(Object)
      );
    });

    test("correctly retrieves top and skip parameters", async () => {
      const context = createMockContext({
        parameters: { top: 25, skip: 5 }
      });
      const handler = new AccountPostingResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountPostingsSpy).toHaveBeenCalledWith(
        context,
        "client-123",
        "2023",
        expect.objectContaining({ top: 25, skip: 5 })
      );
    });
  });
});