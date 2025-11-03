import { NodeOperationError } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import type { AuthContext, SendSuccessFunction } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for document state operations
 */
export class DocumentStateResourceHandler extends BaseResourceHandler {
  protected async executeOperation(
    operation: string,
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    this.validateRequestContext(authContext);

    switch (operation) {
      case "getAll":
        await this.getDocumentStates(authContext, sendSuccess);
        break;
      case "get":
        await this.getDocumentState(authContext, sendSuccess);
        break;
      case "create":
        await this.createDocumentState(authContext, sendSuccess);
        break;
      default:
        throw new NodeOperationError(
          this.context.getNode(),
          `The operation "${operation}" is not supported for document states`
        );
    }
  }

  private async getDocumentStates(
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    const filter = this.getOptionalString("filter");

    const query = this.buildQueryParams({
      filter,
    });

    // TODO: Implement actual API call
    // const response = await documentManagementClient.getDocumentStates({
    //   ...authContext,
    //   ...query,
    // });

    const mockResponse: JsonValue = {
      states: [
        {
          id: "active",
          name: "Active",
          valid_document_classes: [1, 3],
        },
        {
          id: "archived",
          name: "Archived",
          valid_document_classes: [1, 3],
        },
      ],
    };

    sendSuccess(mockResponse);
  }

  private async getDocumentState(
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    const stateId = this.getRequiredString("stateId");

    // TODO: Implement actual API call
    // const response = await documentManagementClient.getDocumentState({
    //   ...authContext,
    //   stateId,
    // });

    const mockResponse: JsonValue = {
      id: stateId,
      name: "Active",
      valid_document_classes: [1, 3],
    };

    sendSuccess(mockResponse);
  }

  private async createDocumentState(
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    const stateData = this.getRequiredJsonData("stateData");

    // TODO: Implement actual API call
    // const response = await documentManagementClient.createDocumentState({
    //   ...authContext,
    //   stateData,
    // });

    const mockResponse: JsonValue = {
      id: "new-state-123",
      success: true,
    };

    sendSuccess(mockResponse);
  }
}