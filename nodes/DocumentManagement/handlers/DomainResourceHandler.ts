import { NodeOperationError } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import type { AuthContext, SendSuccessFunction } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for domain operations
 */
export class DomainResourceHandler extends BaseResourceHandler {
  protected async executeOperation(
    operation: string,
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    this.validateRequestContext(authContext);

    switch (operation) {
      case "getAll":
        await this.getDomains(authContext, sendSuccess);
        break;
      default:
        throw new NodeOperationError(
          this.context.getNode(),
          `The operation "${operation}" is not supported for domains`
        );
    }
  }

  private async getDomains(
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    const filter = this.getOptionalString("filter");

    const query = this.buildQueryParams({
      filter,
    });

    // TODO: Implement actual API call
    // const response = await documentManagementClient.getDomains({
    //   ...authContext,
    //   ...query,
    // });

    const mockResponse: JsonValue = {
      domains: [
        {
          id: 1,
          name: "Client Documents",
          is_selected: true,
          folders: [
            {
              id: 1,
              name: "Incoming",
              registers: [],
            },
          ],
        },
      ],
    };

    sendSuccess(mockResponse);
  }
}