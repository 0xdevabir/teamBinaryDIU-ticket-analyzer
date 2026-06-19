"""Application-wide exceptions."""


class AppError(Exception):
    """Base application error."""

    status_code: int = 400

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404

    def __init__(self, resource: str, identifier: str) -> None:
        super().__init__(f"{resource} not found: {identifier}")
        self.resource = resource
        self.identifier = identifier


class TicketNotFoundError(NotFoundError):
    def __init__(self, ticket_id: str) -> None:
        super().__init__("Ticket", ticket_id)


class ValidationError(AppError):
    status_code = 422

    def __init__(self, message: str) -> None:
        super().__init__(message)
