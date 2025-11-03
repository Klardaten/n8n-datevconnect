import { NodeOperationError } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import type { AuthContext, SendSuccessFunction } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for info operations
 */
export class InfoResourceHandler extends BaseResourceHandler {
  protected async executeOperation(
    operation: string,
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    this.validateRequestContext(authContext);

    switch (operation) {
      case "get":
        await this.getInfo(authContext, sendSuccess);
        break;
      default:
        throw new NodeOperationError(
          this.context.getNode(),
          `The operation "${operation}" is not supported for info`
        );
    }
  }

  private async getInfo(
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    // TODO: Implement actual API call
    // const response = await documentManagementClient.getInfo({
    //   ...authContext,
    // });

    const mockResponse: JsonValue = {
      environment: "Document Management API",
      version: {
        name: "2.3.1",
        number: "2.3.1",
      },
      application: "DATEV Document Management",
    };

    sendSuccess(mockResponse);
  }
}