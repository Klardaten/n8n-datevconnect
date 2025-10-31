import { describe, expect, spyOn, test, beforeEach, afterEach } from "bun:test";
import type { IExecuteFunctions } from "n8n-workflow";
import type { JsonValue } from "../../src/services/datevConnectClient";
import * as datevConnectClientModule from "../../src/services/datevConnectClient";

const { MasterData } = await import("../../nodes/MasterData/MasterData.node");

// Test spies
let authenticateSpy: any;
let fetchClientsSpy: any;
let fetchTaxAuthoritiesSpy: any;
let fetchRelationshipsSpy: any;

type InputItem = { json: Record<string, unknown> };

type ExecuteContextOptions = {
  items?: InputItem[];
  credentials?: Record<string, string> | null;
  parameters?: Record<string, Array<unknown> | unknown>;
  continueOnFail?: boolean;
};

function createExecuteContext(options: ExecuteContextOptions = {}) {
  const {
    items = [{ json: {} }],
    credentials = {
      host: "https://api.example.com",
      email: "user@example.com",
      password: "secret",
      clientInstanceId: "instance-1",
    },
    parameters = {},
    continueOnFail = false,
  } = options;

  const parameterValues = new Map<string, Array<unknown>>();

  for (const [name, value] of Object.entries(parameters)) {
    parameterValues.set(name, Array.isArray(value) ? value : [value]);
  }

  return {
    getInputData() {
      return items;
    },
    async getCredentials() {
      return credentials;
    },
    getNodeParameter(name: string, itemIndex: number, defaultValue?: unknown) {
      const values = parameterValues.get(name);
      if (!values || values[itemIndex] === undefined) {
        return defaultValue;
      }
      return values[itemIndex];
    },
    getNode() {
      return { name: "MasterData" };
    },
    helpers: {
      returnJsonArray(data: Array<Record<string, unknown>>) {
        return data.map((entry) => ({ json: entry }));
      },
      constructExecutionMetaData<T>(
        data: Array<{ json: Record<string, unknown> }> & T[],
        { itemData }: { itemData: { item: number } },
      ) {
        return data.map((entry) => ({
          ...entry,
          pairedItem: itemData,
        }));
      },
    },
    continueOnFail() {
      return continueOnFail;
    },
  };
}

describe("MasterData node", () => {
  beforeEach(() => {
    authenticateSpy = spyOn(datevConnectClientModule, "authenticate").mockImplementation(
      async () => ({ access_token: "token-123" }),
    );
    fetchClientsSpy = spyOn(datevConnectClientModule, "fetchClients").mockImplementation(
      async () => [] as JsonValue,
    );
    fetchTaxAuthoritiesSpy = spyOn(datevConnectClientModule, "fetchTaxAuthorities").mockImplementation(
      async () => [] as JsonValue,
    );
    fetchRelationshipsSpy = spyOn(datevConnectClientModule, "fetchRelationships").mockImplementation(
      async () => [] as JsonValue,
    );
  });

  afterEach(() => {
    authenticateSpy?.mockRestore();
    fetchClientsSpy?.mockRestore();
    fetchTaxAuthoritiesSpy?.mockRestore();
    fetchRelationshipsSpy?.mockRestore();
  });

  test("authenticates once and fetches clients for each input item", async () => {
    fetchClientsSpy.mockImplementationOnce(async () => [
      { id: 1, name: "First" },
      { id: 2, name: "Second" },
    ]);
    fetchClientsSpy.mockImplementationOnce(async () => "fallback value");

    const node = new MasterData();
    const context = createExecuteContext({
      items: [{ json: {} }, { json: {} }],
      parameters: {
        resource: ["client", "client"],
        operation: ["getAll", "getAll"],
        top: [50, 25],
        skip: [0, 10],
      },
    });

    const result = await node.execute.call(context as unknown as IExecuteFunctions);

    expect(authenticateSpy).toHaveBeenCalledTimes(1);
    expect(fetchClientsSpy).toHaveBeenCalledTimes(2);

    const [output] = result;
    expect(output).toBeDefined();
    expect(output.length).toBe(3); // 2 items from first call + 1 from second
    expect(output[0].json).toEqual({ id: 1, name: "First" });
    expect(output[1].json).toEqual({ id: 2, name: "Second" });
    expect(output[2].json).toEqual({ value: "fallback value" });
  });

  test("fetches tax authorities with select and filter", async () => {
    fetchTaxAuthoritiesSpy.mockImplementationOnce(async () => [
      { id: "9241", name: "Nürnberg-Zentral" },
    ]);

    const node = new MasterData();
    const context = createExecuteContext({
      parameters: {
        resource: "taxAuthority",
        operation: "getAll",
        select: "id,name",
        filter: "city eq 'Nuremberg'",
      },
    });

    const result = await node.execute.call(context as unknown as IExecuteFunctions);

    expect(fetchTaxAuthoritiesSpy).toHaveBeenCalledTimes(1);
    const [output] = result;
    expect(output[0].json).toEqual({ id: "9241", name: "Nürnberg-Zentral" });
  });

  test("fetches relationships with select and filter", async () => {
    fetchRelationshipsSpy.mockImplementationOnce(async () => [
      { id: "rel-1", name: "Has Member" },
    ]);

    const node = new MasterData();
    const context = createExecuteContext({
      parameters: {
        resource: "relationship",
        operation: "getAll",
        select: "id,name",
        filter: "type_id eq S00058",
      },
    });

    const result = await node.execute.call(context as unknown as IExecuteFunctions);

    expect(fetchRelationshipsSpy).toHaveBeenCalledTimes(1);
    const [output] = result;
    expect(output[0].json).toEqual({ id: "rel-1", name: "Has Member" });
  });

  test("returns error information when continueOnFail is enabled", async () => {
    fetchClientsSpy.mockImplementation(async () => {
      throw new Error("Request failed");
    });

    const node = new MasterData();
    const context = createExecuteContext({
      items: [{ json: {} }],
      parameters: {
        resource: "client",
        operation: "getAll",
      },
      continueOnFail: true,
    });

    const result = await node.execute.call(context as unknown as IExecuteFunctions);

    expect(result).toEqual([
      [
        {
          json: { error: "Request failed" },
          pairedItem: { item: 0 },
        },
      ],
    ]);
  });
});
