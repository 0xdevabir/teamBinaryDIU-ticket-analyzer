"""Seed the database with demo tickets."""

import asyncio

from app.db.session import async_session
from app.services.ticket_service import DEMO_TICKETS, TicketService


async def main() -> None:
    async with async_session() as session:
        service = TicketService(session)
        tickets = []
        for data in DEMO_TICKETS:
            ticket = await service.create_and_analyze(data)
            tickets.append(ticket)
        await session.commit()
        print(f"Seeded {len(tickets)} demo tickets.")
        for ticket in tickets:
            print(f"  - [{ticket.priority}] {ticket.category}: {ticket.title}")


if __name__ == "__main__":
    asyncio.run(main())
