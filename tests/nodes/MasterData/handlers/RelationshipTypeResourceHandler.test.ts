/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { RelationshipTypeResourceHandler } from "../../../../nodes/MasterData/handlers/RelationshipTypeResourceHandler";
import type { AuthContext } from "../../../../nodes/MasterData/types";
import * as datevConnectClientModule from "../../../../src/services/datevConnectClient";

// Test spies
let fetchRelationshipTypesSpy: any;

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
      // Relationship type operations parameters (only select and filter are used)
      "select": "id,name,abbreviation",
      "filter": "standard eq true",
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
};

describe("RelationshipTypeResourceHandler", () => {
  beforeEach(() => {
    fetchRelationshipTypesSpy = spyOn(datevConnectClientModule, "fetchRelationshipTypes").mockResolvedValue([]);
  });

  afterEach(() => {
    fetchRelationshipTypesSpy?.mockRestore();
  });

  describe("getAll operation", () => {
    test("fetches relationship types with parameters", async () => {
      const mockRelationshipTypes = [
        { id: "S00051", abbreviation: "GV", name: "Gesetzlicher Vertreter des Unternehmens", standard: true, type: 2 },
        { id: "S00052", abbreviation: "VP", name: "Vertretungsberechtigte Person", standard: true, type: 2 },
      ];
      fetchRelationshipTypesSpy.mockResolvedValueOnce(mockRelationshipTypes);

      const context = createMockContext();
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(fetchRelationshipTypesSpy).toHaveBeenCalledWith({
        ...mockAuthContext,
        select: "id,name,abbreviation",
        filter: "standard eq true",
      });

      expect(returnData).toHaveLength(2);
      expect(returnData[0].json).toEqual({ 
        id: "S00051", 
        abbreviation: "GV", 
        name: "Gesetzlicher Vertreter des Unternehmens", 
        standard: true, 
        type: 2 
      });
      expect(returnData[1].json).toEqual({ 
        id: "S00052", 
        abbreviation: "VP", 
        name: "Vertretungsberechtigte Person", 
        standard: true, 
        type: 2 
      });
    });

    test("handles empty results", async () => {
      fetchRelationshipTypesSpy.mockResolvedValueOnce([]);

      const context = createMockContext();
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(fetchRelationshipTypesSpy).toHaveBeenCalled();
      expect(returnData).toHaveLength(0);
    });

    test("handles parameters with default values", async () => {
      const mockRelationshipTypes = [{ 
        id: "S00051", 
        abbreviation: "GV", 
        name: "Gesetzlicher Vertreter des Unternehmens" 
      }];
      fetchRelationshipTypesSpy.mockResolvedValueOnce(mockRelationshipTypes);

      const context = createMockContext({
        parameters: {
          select: undefined,
          filter: undefined,
        },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(fetchRelationshipTypesSpy).toHaveBeenCalledWith({
        ...mockAuthContext,
        select: undefined,
        filter: undefined,
      });

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ 
        id: "S00051", 
        abbreviation: "GV", 
        name: "Gesetzlicher Vertreter des Unternehmens" 
      });
    });

    test("handles different filter combinations", async () => {
      const mockRelationshipTypes = [{ 
        id: "S00051", 
        abbreviation: "GV", 
        name: "Gesetzlicher Vertreter des Unternehmens",
        standard: false,
        type: 2
      }];
      fetchRelationshipTypesSpy.mockResolvedValueOnce(mockRelationshipTypes);

      const context = createMockContext({
        parameters: {
          select: "id,name,standard,type",
          filter: "type eq 2 and standard eq false",
        },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(fetchRelationshipTypesSpy).toHaveBeenCalledWith({
        ...mockAuthContext,
        select: "id,name,standard,type",
        filter: "type eq 2 and standard eq false",
      });

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ 
        id: "S00051", 
        abbreviation: "GV", 
        name: "Gesetzlicher Vertreter des Unternehmens",
        standard: false,
        type: 2
      });
    });
  });

  describe("error handling", () => {
    test("throws NodeApiError for unsupported operation", async () => {
      const context = createMockContext();
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await expect(
        handler.execute("unsupportedOp", mockAuthContext, returnData)
      ).rejects.toThrow("The operation \"unsupportedOp\" is not supported for resource \"relationshipType\".");
    });

    test("handles API errors gracefully when continueOnFail is true", async () => {
      fetchRelationshipTypesSpy.mockRejectedValueOnce(new Error("API Connection Failed"));

      const context = createMockContext({
        context: { continueOnFail: mock(() => true) },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ error: "API Connection Failed" });
      expect(returnData[0].pairedItem).toEqual({ item: 0 });
    });

    test("throws error when continueOnFail is false", async () => {
      fetchRelationshipTypesSpy.mockRejectedValueOnce(new Error("API Connection Failed"));

      const context = createMockContext({
        context: { continueOnFail: mock(() => false) },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await expect(
        handler.execute("getAll", mockAuthContext, returnData)
      ).rejects.toThrow("API Connection Failed");
    });

    test("handles DATEVconnect API errors with proper message", async () => {
      const apiError = new Error("DATEVconnect request failed (400 Bad Request): Invalid filter expression");
      fetchRelationshipTypesSpy.mockRejectedValueOnce(apiError);

      const context = createMockContext({
        context: { continueOnFail: mock(() => true) },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(1);
      expect(returnData[0].json).toEqual({ 
        error: "DATEVconnect request failed (400 Bad Request): Invalid filter expression" 
      });
    });
  });

  describe("inheritance from BaseResourceHandler", () => {
    test("uses proper authentication context", async () => {
      const mockRelationshipTypes = [{ 
        id: "S00051", 
        name: "Gesetzlicher Vertreter des Unternehmens" 
      }];
      fetchRelationshipTypesSpy.mockResolvedValueOnce(mockRelationshipTypes);

      const customAuthContext: AuthContext = {
        host: "https://custom.api.com",
        token: "custom-token",
        clientInstanceId: "custom-instance",
      };

      const context = createMockContext();
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", customAuthContext, returnData);

      expect(fetchRelationshipTypesSpy).toHaveBeenCalledWith({
        ...customAuthContext,
        select: "id,name,abbreviation",
        filter: "standard eq true",
      });
    });

    test("handles metadata properly", async () => {
      const mockRelationshipTypes = [{ 
        id: "S00051", 
        name: "Gesetzlicher Vertreter des Unternehmens" 
      }];
      fetchRelationshipTypesSpy.mockResolvedValueOnce(mockRelationshipTypes);

      const context = createMockContext();
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      // Verify metadata construction is called
      expect(context.helpers.constructExecutionMetaData).toHaveBeenCalledWith(
        [{ json: { id: "S00051", name: "Gesetzlicher Vertreter des Unternehmens" } }],
        { itemData: { item: 0 } }
      );
    });

    test("respects item index in error handling", async () => {
      fetchRelationshipTypesSpy.mockRejectedValueOnce(new Error("Test Error"));

      const context = createMockContext({
        context: { continueOnFail: mock(() => true) },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 2);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(returnData).toHaveLength(1);
      expect(returnData[0].pairedItem).toEqual({ item: 2 });
    });
  });

  describe("parameter handling", () => {
    test("correctly retrieves select parameter", async () => {
      const mockRelationshipTypes = [{ id: "S00051" }];
      fetchRelationshipTypesSpy.mockResolvedValueOnce(mockRelationshipTypes);

      const context = createMockContext({
        parameters: {
          select: "id,abbreviation,standard",
        },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(fetchRelationshipTypesSpy).toHaveBeenCalledWith({
        ...mockAuthContext,
        select: "id,abbreviation,standard",
        filter: "standard eq true",
      });
    });

    test("correctly retrieves filter parameter", async () => {
      const mockRelationshipTypes = [{ id: "S00051" }];
      fetchRelationshipTypesSpy.mockResolvedValueOnce(mockRelationshipTypes);

      const context = createMockContext({
        parameters: {
          filter: "contains(name, 'Vertreter')",
        },
      });
      const handler = new RelationshipTypeResourceHandler(context as any, 0);
      const returnData: any[] = [];

      await handler.execute("getAll", mockAuthContext, returnData);

      expect(fetchRelationshipTypesSpy).toHaveBeenCalledWith({
        ...mockAuthContext,
        select: "id,name,abbreviation",
        filter: "contains(name, 'Vertreter')",
      });
    });
  });
});