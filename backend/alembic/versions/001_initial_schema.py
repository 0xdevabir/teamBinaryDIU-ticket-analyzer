"""unified tickets schema

Revision ID: 001
Revises:
Create Date: 2026-06-19
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ticket_category = postgresql.ENUM(
    "Billing",
    "Technical",
    "Account",
    "Feature Request",
    "Other",
    name="ticket_category",
    create_type=False,
)
ticket_priority = postgresql.ENUM(
    "low",
    "medium",
    "high",
    "critical",
    name="ticket_priority",
    create_type=False,
)


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    ticket_category.create(op.get_bind(), checkfirst=True)
    ticket_priority.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "tickets",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", ticket_category, nullable=True),
        sa.Column("priority", ticket_priority, nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("ai_confidence", sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("char_length(trim(title)) >= 3", name="tickets_title_not_blank"),
        sa.CheckConstraint("char_length(trim(description)) >= 10", name="tickets_description_not_blank"),
        sa.CheckConstraint(
            "(category IS NULL AND priority IS NULL AND summary IS NULL AND ai_confidence IS NULL) "
            "OR (category IS NOT NULL AND priority IS NOT NULL AND summary IS NOT NULL "
            "AND ai_confidence IS NOT NULL)",
            name="tickets_analysis_consistency",
        ),
        sa.CheckConstraint(
            "ai_confidence >= 0 AND ai_confidence <= 1",
            name="tickets_ai_confidence_range",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("idx_tickets_category", "tickets", ["category"])
    op.create_index("idx_tickets_priority", "tickets", ["priority"])
    op.create_index("idx_tickets_created_at_desc", "tickets", ["created_at"], postgresql_ops={"created_at": "DESC"})
    op.create_index(
        "idx_tickets_pending",
        "tickets",
        ["created_at"],
        postgresql_where=sa.text("category IS NULL"),
        postgresql_ops={"created_at": "DESC"},
    )
    op.create_index(
        "idx_tickets_analyzed",
        "tickets",
        ["updated_at"],
        postgresql_where=sa.text("category IS NOT NULL"),
        postgresql_ops={"updated_at": "DESC"},
    )
    op.execute(
        """
        CREATE INDEX idx_tickets_fts ON tickets
        USING gin (to_tsvector('english', title || ' ' || description))
        """
    )

    op.execute(
        """
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_tickets_set_updated_at
        BEFORE UPDATE ON tickets
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at()
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_tickets_set_updated_at ON tickets")
    op.execute("DROP FUNCTION IF EXISTS set_updated_at()")
    op.drop_index("idx_tickets_fts", table_name="tickets")
    op.drop_index("idx_tickets_analyzed", table_name="tickets")
    op.drop_index("idx_tickets_pending", table_name="tickets")
    op.drop_index("idx_tickets_created_at_desc", table_name="tickets")
    op.drop_index("idx_tickets_priority", table_name="tickets")
    op.drop_index("idx_tickets_category", table_name="tickets")
    op.drop_table("tickets")
    op.execute("DROP TYPE IF EXISTS ticket_priority")
    op.execute("DROP TYPE IF EXISTS ticket_category")
