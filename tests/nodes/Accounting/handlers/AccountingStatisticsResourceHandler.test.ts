/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { AccountingStatisticsResourceHandler } from "../../../../nodes/Accounting/handlers/AccountingStatisticsResourceHandler";
import type { AuthContext } from "../../../../nodes/Accounting/types";
import { datevConnectClient } from "../../../../src/services/accountingClient";

// Test spies
let getAccountingStatisticsSpy: any;

// Mock data
const mockAccountingStatisticsData = [
  {
    period: "2023-01",
    total_revenue: 150000.00,
    total_expenses: 120000.00,
    net_income: 30000.00,
    transactions_count: 1250,
    active_customers: 89,
    active_suppliers: 34
  },
  {
    period: "2023-02",
    total_revenue: 165000.00,
    total_expenses: 135000.00,
    net_income: 30000.00,
    transactions_count: 1380,
    active_customers: 92,
    active_suppliers: 36
  },
  {
    period: "2023-03",
    total_revenue: 180000.00,
    total_expenses: 145000.00,
    net_income: 35000.00,
    transactions_count: 1450,
    active_customers: 95,
    active_suppliers: 38
  }
];

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
      "top": 50,
      "skip": 10,
      "select": "period,total_revenue,net_income",
      "filter": "period ge '2023-01'",
      "expand": "details",

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
  host: "https://api.example.com",
  token: "test-token",
  clientInstanceId: "instance-1",
  clientId: "client-123",
  fiscalYearId: "2023"
};

describe("AccountingStatisticsResourceHandler", () => {
  beforeEach(() => {
    getAccountingStatisticsSpy = spyOn(datevConnectClient.accounting, "getAccountingStatistics").mockResolvedValue(mockAccountingStatisticsData);
  });

  afterEach(() => {
    getAccountingStatisticsSpy?.mockRestore();
  });

  describe("getAll operation", () => {
    test("fetches accounting statistics with parameters", async () => {
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(context, "client-123", "2023", {
        top: 50,
        skip: 10,
        select: "period,total_revenue,net_income",
        filter: "period ge '2023-01'",
        expand: "details"
      });

      expect(returnData).toHaveLength(3);
      expect(returnData[0].json).toEqual({
        period: "2023-01",
        total_revenue: 150000.00,
        total_expenses: 120000.00,
        net_income: 30000.00,
        transactions_count: 1250,
        active_customers: 89,
        active_suppliers: 34
      });
    });

    test("handles empty results", async () => {
      getAccountingStatisticsSpy.mockResolvedValueOnce([]);
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(0);
    });

    test("handles null response", async () => {
      getAccountingStatisticsSpy.mockResolvedValueOnce(null);
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ success: true });
    });

    test("handles parameters with default values", async () => {
      const context = createMockContext({
        parameters: {
          "top": undefined,
          "skip": undefined,
          "select": undefined,
          "filter": undefined,
          "expand": undefined,
        }
      });
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(context, "client-123", "2023", {
        top: 100  // Default value when top is undefined
      });
    });

    test("handles custom query parameters", async () => {
      const context = createMockContext({
        parameters: {
          "top": 25,
          "skip": 5,
          "select": "period,net_income",
          "filter": "net_income gt 0",
          "expand": undefined  // Override default expand parameter
        }
      });
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(context, "client-123", "2023", {
        top: 25,
        skip: 5,
        select: "period,net_income",
        filter: "net_income gt 0"
      });
    });
  });

  describe("error handling", () => {
    test("throws NodeOperationError for unsupported operation", async () => {
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await expect(
        handler.execute("unsupportedOperation" as any, mockAuthContext, returnData)
      ).rejects.toThrow("Unknown operation: unsupportedOperation");
    });

    test("handles API errors gracefully when continueOnFail is true", async () => {
      getAccountingStatisticsSpy.mockRejectedValueOnce(new Error("API Error"));
      const context = createMockContext({
        context: {
          continueOnFail: mock(() => true)
        }
      });
      
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ error: "API Error" });
    });

    test("propagates error when continueOnFail is false", async () => {
      getAccountingStatisticsSpy.mockRejectedValueOnce(new Error("API Error"));
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await expect(
        handler.execute("getAll", mockAuthContext, returnData)
      ).rejects.toThrow("API Error");
    });

    test("handles network timeout errors", async () => {
      getAccountingStatisticsSpy.mockRejectedValueOnce(new Error("Network timeout"));
      const context = createMockContext({
        context: {
          continueOnFail: mock(() => true)
        }
      });
      
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ error: "Network timeout" });
    });

    test("handles authentication errors", async () => {
      getAccountingStatisticsSpy.mockRejectedValueOnce(new Error("Unauthorized"));
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await expect(
        handler.execute("getAll", mockAuthContext, returnData)
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("inheritance from BaseResourceHandler", () => {
    test("uses proper execution context", async () => {
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(
        context,
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );
    });

    test("handles metadata properly", async () => {
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData[0].json).toEqual(mockAccountingStatisticsData[0]);
    });

    test("respects item index in error handling", async () => {
      getAccountingStatisticsSpy.mockRejectedValueOnce(new Error("Test error"));
      const context = createMockContext({
        context: {
          continueOnFail: mock(() => true)
        }
      });
      
      const handler = new AccountingStatisticsResourceHandler(context, 5);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData[0].json).toEqual({ error: "Test error" });
    });

    test("constructs proper sendSuccess function", async () => {
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      // Verify that the handler constructs data properly through BaseResourceHandler
      expect(returnData).toHaveLength(3);
      expect(returnData.every(item => item.json !== undefined)).toBe(true);
    });
  });

  describe("parameter handling", () => {
    test("correctly retrieves select parameter", async () => {
      const context = createMockContext({
        parameters: { select: "period,total_revenue" }
      });
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(
        context,
        "client-123",
        "2023",
        expect.objectContaining({ select: "period,total_revenue" })
      );
    });

    test("correctly retrieves filter parameter", async () => {
      const context = createMockContext({
        parameters: { filter: "total_revenue gt 100000" }
      });
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(
        context,
        "client-123", 
        "2023",
        expect.objectContaining({ filter: "total_revenue gt 100000" })
      );
    });

    test("correctly retrieves top and skip parameters", async () => {
      const context = createMockContext({
        parameters: { top: 10, skip: 20 }
      });
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(
        context,
        "client-123",
        "2023",
        expect.objectContaining({ top: 10, skip: 20 })
      );
    });

    test("correctly retrieves expand parameter", async () => {
      const context = createMockContext({
        parameters: { expand: "financial_ratios" }
      });
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(getAccountingStatisticsSpy).toHaveBeenCalledWith(
        context,
        "client-123",
        "2023",
        expect.objectContaining({ expand: "financial_ratios" })
      );
    });
  });

  describe("data validation", () => {
    test("handles statistics data with various numeric formats", async () => {
      const mockDataWithVariousNumbers = [
        {
          period: "2023-01",
          total_revenue: 150000.50,
          total_expenses: 120000,
          net_income: 30000.5,
          transactions_count: 1250,
          percentage_growth: 15.75
        }
      ];
      
      getAccountingStatisticsSpy.mockResolvedValueOnce(mockDataWithVariousNumbers);
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData[0].json).toEqual({
        period: "2023-01",
        total_revenue: 150000.50,
        total_expenses: 120000,
        net_income: 30000.5,
        transactions_count: 1250,
        percentage_growth: 15.75
      });
    });

    test("handles statistics data with missing optional fields", async () => {
      const mockDataWithMissingFields = [
        {
          period: "2023-01",
          total_revenue: 150000.00,
          total_expenses: 120000.00,
          net_income: 30000.00
          // missing transactions_count, active_customers, active_suppliers
        }
      ];
      
      getAccountingStatisticsSpy.mockResolvedValueOnce(mockDataWithMissingFields);
      const context = createMockContext();
      const handler = new AccountingStatisticsResourceHandler(context, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData[0].json).toEqual({
        period: "2023-01",
        total_revenue: 150000.00,
        total_expenses: 120000.00,
        net_income: 30000.00
      });
    });
  });
});