import asyncio

from app.api.v1.dashboard import DEMO_TICKETS
from app.db.session import async_session
from app.services.analysis_service import AnalysisService
from app.services.ticket_service import TicketService


async def main() -> None:
    async with async_session() as session:
        ticket_service = TicketService(session)
        analysis_service = AnalysisService(session)
        tickets = []
        for data in DEMO_TICKETS:
            ticket = await ticket_service.create(data)
            analyzed = await analysis_service.analyze_ticket(ticket.id)
            tickets.append(analyzed or ticket)
        await session.commit()
        print(f"Seeded {len(tickets)} demo tickets.")
        for ticket in tickets:
            print(f"  - [{ticket.priority}] {ticket.category}: {ticket.title}")


if __name__ == "__main__":
    asyncio.run(main())
