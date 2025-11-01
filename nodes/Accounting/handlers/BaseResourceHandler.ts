import type { IExecuteFunctions, INodeExecutionData, IDataObject } from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";

export abstract class BaseResourceHandler<T = IDataObject> {
  protected executeFunctions: IExecuteFunctions;
  protected clientId?: string;
  protected fiscalYearId?: string;

  constructor(executeFunctions: IExecuteFunctions) {
    this.executeFunctions = executeFunctions;
    this.clientId = executeFunctions.getNodeParameter("clientId", 0, "") as string;
    this.fiscalYearId = executeFunctions.getNodeParameter("fiscalYearId", 0, "") as string;
  }

  abstract execute(): Promise<INodeExecutionData[]>;

  protected buildQueryParams(additionalParams: IDataObject = {}): IDataObject {
    const params: IDataObject = {};

    // Add OData parameters
    const top = this.executeFunctions.getNodeParameter("top", 0, null) as number;
    const skip = this.executeFunctions.getNodeParameter("skip", 0, null) as number;
    const select = this.executeFunctions.getNodeParameter("select", 0, "") as string;
    const filter = this.executeFunctions.getNodeParameter("filter", 0, "") as string;
    const expand = this.executeFunctions.getNodeParameter("expand", 0, "") as string;

    if (top !== null && top > 0) {
      params.$top = top;
    }
    if (skip !== null && skip > 0) {
      params.$skip = skip;
    }
    if (select) {
      params.$select = select;
    }
    if (filter) {
      params.$filter = filter;
    }
    if (expand && expand !== "") {
      params.$expand = expand === "all" ? "*" : expand;
    }

    return { ...params, ...additionalParams };
  }

  protected buildUrl(path: string): string {
    const baseUrl = "/datev/api/accounting/v1";
    return `${baseUrl}${path}`;
  }

  protected wrapData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
    if (Array.isArray(data)) {
      return data.map((item) => ({ json: item }));
    }
    return [{ json: data }];
  }

  protected handleApiError(error: any, context: string): never {
    if (error.response) {
      const { status, statusText, data } = error.response;
      throw new NodeApiError(this.executeFunctions.getNode(), {
        message: `${context} failed: ${statusText}`,
        description: data?.message || `HTTP ${status}: ${statusText}`,
        httpCode: status.toString(),
      });
    }
    throw new NodeApiError(this.executeFunctions.getNode(), {
      message: `${context} failed`,
      description: error.message || "Unknown error occurred",
    });
  }
}