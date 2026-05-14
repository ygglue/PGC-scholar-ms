"""add_performance_indexes

Revision ID: 64d9f2b1a0c7
Revises: 1516d15a1bef
Create Date: 2026-05-14 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '64d9f2b1a0c7'
down_revision: Union[str, Sequence[str], None] = '1516d15a1bef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Indexes for scholar filter queries
    op.create_index('ix_scholars_batch_number', 'scholars', ['batch_number'])
    op.create_index('ix_scholars_school', 'scholars', ['school'])
    op.create_index('ix_scholars_course', 'scholars', ['course'])
    op.create_index('ix_scholars_status', 'scholars', ['status'])
    op.create_index('ix_scholars_student_type', 'scholars', ['student_type'])
    op.create_index('ix_scholars_user_id', 'scholars', ['user_id'])

    # Indexes for FK joins
    op.create_index('ix_documents_scholar_id', 'documents', ['scholar_id'])
    op.create_index('ix_pending_changes_scholar_id', 'pending_changes', ['scholar_id'])
    op.create_index('ix_pending_changes_status', 'pending_changes', ['status'])
    op.create_index('ix_academic_records_scholar_id', 'academic_records', ['scholar_id'])


def downgrade() -> None:
    op.drop_index('ix_academic_records_scholar_id', table_name='academic_records')
    op.drop_index('ix_pending_changes_status', table_name='pending_changes')
    op.drop_index('ix_pending_changes_scholar_id', table_name='pending_changes')
    op.drop_index('ix_documents_scholar_id', table_name='documents')
    op.drop_index('ix_scholars_user_id', table_name='scholars')
    op.drop_index('ix_scholars_student_type', table_name='scholars')
    op.drop_index('ix_scholars_status', table_name='scholars')
    op.drop_index('ix_scholars_course', table_name='scholars')
    op.drop_index('ix_scholars_school', table_name='scholars')
    op.drop_index('ix_scholars_batch_number', table_name='scholars')
