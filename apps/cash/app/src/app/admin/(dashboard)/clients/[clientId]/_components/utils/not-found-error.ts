export const CLIENT_NOT_FOUND_ERROR_NAME = "ClientNotFoundError";

export class ClientNotFoundError extends Error {
  constructor(message = "Cliente não encontrado") {
    super(message);
    this.name = CLIENT_NOT_FOUND_ERROR_NAME;
  }
}
