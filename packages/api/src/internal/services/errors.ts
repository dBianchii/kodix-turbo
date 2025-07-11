export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export class EntityNotFoundError extends ServiceError {
  constructor(entity: string, identifier: string) {
    super(`${entity} not found: ${identifier}`, "NOT_FOUND");
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string) {
    super(message, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message = "Unauthorized access") {
    super(message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends ServiceError {
  constructor(message = "Forbidden access") {
    super(message, "FORBIDDEN");
  }
}
