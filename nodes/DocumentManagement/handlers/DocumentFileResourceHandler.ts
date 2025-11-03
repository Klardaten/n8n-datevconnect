import { NodeOperationError } from "n8n-workflow";
import type { JsonValue } from "../../../src/services/datevConnectClient";
import type { AuthContext, SendSuccessFunction } from "../types";
import { BaseResourceHandler } from "./BaseResourceHandler";

/**
 * Handler for document file operations
 * 
 * IMPORTANT: This handler deals with binary file transfers that require special headers:
 * - GET /document-files/{file-id}: Returns application/octet-stream binary data
 * - POST /document-files: Accepts application/octet-stream binary data
 * 
 * The DATEV Document Management API uses octet-stream for all file operations
 * as specified in the document management-2.3.1.yaml specification.
 */
export class DocumentFileResourceHandler extends BaseResourceHandler {
  protected async executeOperation(
    operation: string,
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    this.validateRequestContext(authContext);

    switch (operation) {
      case "get":
        await this.getDocumentFile(authContext, sendSuccess);
        break;
      case "upload":
        await this.uploadDocumentFile(authContext, sendSuccess);
        break;
      default:
        throw new NodeOperationError(
          this.context.getNode(),
          `The operation "${operation}" is not supported for document files`
        );
    }
  }

  private async getDocumentFile(
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    const documentFileId = this.getRequiredString("documentFileId");

    // TODO: Implement actual API call with application/octet-stream response
    // const response = await documentManagementClient.getDocumentFile({
    //   ...authContext,
    //   documentFileId,
    //   // Response will be application/octet-stream binary data
    //   headers: { 'Accept': 'application/octet-stream' }
    // });

    const mockResponse: JsonValue = {
      id: documentFileId,
      filename: "document.pdf",
      contentType: "application/octet-stream", // File downloads use octet-stream
      size: 1024,
      binaryData: "<streaming content>", // Binary file data
    };

    sendSuccess(mockResponse);
  }

  private async uploadDocumentFile(
    authContext: AuthContext,
    sendSuccess: SendSuccessFunction,
  ): Promise<void> {
    const binaryData = this.getRequiredString("binaryData");

    // TODO: Implement actual API call with application/octet-stream request
    // const response = await documentManagementClient.uploadDocumentFile({
    //   ...authContext,
    //   binaryData,
    //   // Request body must be application/octet-stream binary data
    //   headers: { 'Content-Type': 'application/octet-stream' },
    //   body: binaryData // Raw binary data as string/buffer
    // });

    const mockResponse: JsonValue = {
      id: "uploaded-file-123",
      success: true,
      contentType: "application/octet-stream", // Uploads use octet-stream
      size: binaryData.length,
    };

    sendSuccess(mockResponse);
  }
}