/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { DocumentResourceHandler } from "../../../../nodes/DocumentManagement/handlers/DocumentResourceHandler";
import type { AuthContext } from "../../../../nodes/DocumentManagement/types";

let documentResourceHandler: DocumentResourceHandler;
let mockContext: any;

const mockAuthContext: AuthContext = {
  host: "localhost",
  token: "test-token",
  clientInstanceId: "test-client-id"
};

describe("DocumentResourceHandler", () => {
  beforeEach(() => {
    mockContext = {
      getNodeParameter: mock(() => undefined),
      continueOnFail: mock(() => false),
      getNode: mock(() => ({ type: "test-node" })),
      getCredentials: mock(() => null),
    };
    documentResourceHandler = new DocumentResourceHandler(mockContext, 0);
  });

  test("getAll operation fetches documents", async () => {
    mockContext.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case "filter":
          return "";
        case "top":
          return 10;
        case "skip":
          return 0;
        default:
          return undefined;
      }
    });

    const returnData: any[] = [];
    await documentResourceHandler.execute("getAll", mockAuthContext, returnData);

    expect(returnData).toHaveLength(1);
    expect(returnData[0].json.success).toBe(true);
    expect(returnData[0].json.documents).toBeDefined();
  });

  test("get operation fetches single document by ID", async () => {
    mockContext.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === "documentId") return "doc-123";
      return undefined;
    });

    const returnData: any[] = [];
    await documentResourceHandler.execute("get", mockAuthContext, returnData);

    expect(returnData).toHaveLength(1);
    expect(returnData[0].json.success).toBe(true);
    expect(returnData[0].json.id).toBe("doc-123");
  });

  test("create operation creates document with data", async () => {
    mockContext.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === "documentData") return JSON.stringify({
        description: "Test document",
        class: { id: 1 },
        state: { id: "active" },
      });
      return undefined;
    });

    const returnData: any[] = [];
    await documentResourceHandler.execute("create", mockAuthContext, returnData);

    expect(returnData).toHaveLength(1);
    expect(returnData[0].json.success).toBe(true);
    expect(returnData[0].json.id).toBeDefined();
  });

  test("delete operation deletes document by ID", async () => {
    mockContext.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === "documentId") return "doc-123";
      return undefined;
    });

    const returnData: any[] = [];
    await documentResourceHandler.execute("delete", mockAuthContext, returnData);

    expect(returnData).toHaveLength(1);
    expect(returnData[0].json.success).toBe(true);
    expect(returnData[0].json.documentId).toBe("doc-123");
    expect(returnData[0].json.deleted).toBe(true);
  });

  test("handles API errors gracefully when continueOnFail is true", async () => {
    mockContext.continueOnFail.mockReturnValue(true);
    mockContext.getNodeParameter.mockImplementation(() => {
      throw new Error("API Error");
    });

    const returnData: any[] = [];
    await documentResourceHandler.execute("getAll", mockAuthContext, returnData);

    expect(returnData).toHaveLength(1);
    expect(returnData[0].json.error).toBeDefined();
  });
});