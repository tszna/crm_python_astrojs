"""Inicjalna migracja

Revision ID: a3edc72b3734
Revises: e2fc4acca62f
Create Date: 2024-12-10 15:35:01.635653

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a3edc72b3734'
down_revision: Union[str, None] = 'e2fc4acca62f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_foreign_key(None, 'absences', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'time_sessions', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint(None, 'time_sessions', type_='foreignkey')
    op.drop_constraint(None, 'absences', type_='foreignkey')
