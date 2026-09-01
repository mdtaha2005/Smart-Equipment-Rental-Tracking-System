"""initial_schema_all_8_tables

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-01 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Sites Table
    op.create_table(
        'sites',
        sa.Column('site_id', sa.String(length=50), nullable=False),
        sa.Column('site_name', sa.String(length=255), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('latitude', sa.Numeric(precision=10, scale=6), nullable=True),
        sa.Column('longitude', sa.Numeric(precision=10, scale=6), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('site_id')
    )
    op.create_index(op.f('ix_sites_site_id'), 'sites', ['site_id'], unique=False)

    # 2. Operators Table
    op.create_table(
        'operators',
        sa.Column('operator_id', sa.String(length=50), nullable=False),
        sa.Column('operator_name', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('operator_id')
    )
    op.create_index(op.f('ix_operators_operator_id'), 'operators', ['operator_id'], unique=False)
    op.create_index(op.f('ix_operators_status'), 'operators', ['status'], unique=False)

    # 3. Equipment Table
    op.create_table(
        'equipment',
        sa.Column('equipment_id', sa.String(length=50), nullable=False),
        sa.Column('equipment_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='AVAILABLE'),
        sa.Column('current_site_id', sa.String(length=50), nullable=True),
        sa.Column('current_operator_id', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['current_operator_id'], ['operators.operator_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['current_site_id'], ['sites.site_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('equipment_id')
    )
    op.create_index(op.f('ix_equipment_equipment_id'), 'equipment', ['equipment_id'], unique=False)
    op.create_index(op.f('ix_equipment_equipment_type'), 'equipment', ['equipment_type'], unique=False)
    op.create_index(op.f('ix_equipment_status'), 'equipment', ['status'], unique=False)
    op.create_index(op.f('ix_equipment_current_site_id'), 'equipment', ['current_site_id'], unique=False)
    op.create_index(op.f('ix_equipment_current_operator_id'), 'equipment', ['current_operator_id'], unique=False)

    # 4. Rentals Table
    op.create_table(
        'rentals',
        sa.Column('rental_id', sa.String(length=50), nullable=False),
        sa.Column('equipment_id', sa.String(length=50), nullable=False),
        sa.Column('site_id', sa.String(length=50), nullable=True),
        sa.Column('operator_id', sa.String(length=50), nullable=True),
        sa.Column('checkout_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expected_checkin_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('actual_checkin_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['equipment_id'], ['equipment.equipment_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['operator_id'], ['operators.operator_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['site_id'], ['sites.site_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('rental_id')
    )
    op.create_index(op.f('ix_rentals_rental_id'), 'rentals', ['rental_id'], unique=False)
    op.create_index(op.f('ix_rentals_equipment_id'), 'rentals', ['equipment_id'], unique=False)
    op.create_index(op.f('ix_rentals_site_id'), 'rentals', ['site_id'], unique=False)
    op.create_index(op.f('ix_rentals_operator_id'), 'rentals', ['operator_id'], unique=False)
    op.create_index(op.f('ix_rentals_checkout_date'), 'rentals', ['checkout_date'], unique=False)
    op.create_index(op.f('ix_rentals_status'), 'rentals', ['status'], unique=False)

    # 5. Usage Logs Table
    op.create_table(
        'usage_logs',
        sa.Column('usage_id', sa.String(length=50), nullable=False),
        sa.Column('equipment_id', sa.String(length=50), nullable=False),
        sa.Column('rental_id', sa.String(length=50), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('engine_hours', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('idle_hours', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('fuel_used', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('latitude', sa.Numeric(precision=10, scale=6), nullable=True),
        sa.Column('longitude', sa.Numeric(precision=10, scale=6), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['equipment_id'], ['equipment.equipment_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rental_id'], ['rentals.rental_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('usage_id')
    )
    op.create_index(op.f('ix_usage_logs_usage_id'), 'usage_logs', ['usage_id'], unique=False)
    op.create_index(op.f('ix_usage_logs_equipment_id'), 'usage_logs', ['equipment_id'], unique=False)
    op.create_index(op.f('ix_usage_logs_rental_id'), 'usage_logs', ['rental_id'], unique=False)
    op.create_index(op.f('ix_usage_logs_timestamp'), 'usage_logs', ['timestamp'], unique=False)

    # 6. Alerts Table
    op.create_table(
        'alerts',
        sa.Column('alert_id', sa.String(length=50), nullable=False),
        sa.Column('equipment_id', sa.String(length=50), nullable=False),
        sa.Column('alert_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False, server_default='MEDIUM'),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('detected_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['equipment_id'], ['equipment.equipment_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('alert_id')
    )
    op.create_index(op.f('ix_alerts_alert_id'), 'alerts', ['alert_id'], unique=False)
    op.create_index(op.f('ix_alerts_equipment_id'), 'alerts', ['equipment_id'], unique=False)
    op.create_index(op.f('ix_alerts_alert_type'), 'alerts', ['alert_type'], unique=False)
    op.create_index(op.f('ix_alerts_severity'), 'alerts', ['severity'], unique=False)
    op.create_index(op.f('ix_alerts_detected_at'), 'alerts', ['detected_at'], unique=False)
    op.create_index(op.f('ix_alerts_resolved'), 'alerts', ['resolved'], unique=False)

    # 7. Forecast Data Table
    op.create_table(
        'forecast_data',
        sa.Column('forecast_id', sa.String(length=50), nullable=False),
        sa.Column('site_id', sa.String(length=50), nullable=False),
        sa.Column('equipment_type', sa.String(length=100), nullable=False),
        sa.Column('forecast_date', sa.Date(), nullable=False),
        sa.Column('predicted_demand', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('confidence', sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['site_id'], ['sites.site_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('forecast_id')
    )
    op.create_index(op.f('ix_forecast_data_forecast_id'), 'forecast_data', ['forecast_id'], unique=False)
    op.create_index(op.f('ix_forecast_data_site_id'), 'forecast_data', ['site_id'], unique=False)
    op.create_index(op.f('ix_forecast_data_equipment_type'), 'forecast_data', ['equipment_type'], unique=False)
    op.create_index(op.f('ix_forecast_data_forecast_date'), 'forecast_data', ['forecast_date'], unique=False)

    # 8. Recommendations Table
    op.create_table(
        'recommendations',
        sa.Column('recommendation_id', sa.String(length=50), nullable=False),
        sa.Column('equipment_id', sa.String(length=50), nullable=False),
        sa.Column('current_site_id', sa.String(length=50), nullable=True),
        sa.Column('recommended_site_id', sa.String(length=50), nullable=True),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('expected_utilization_gain', sa.Numeric(precision=8, scale=2), nullable=True),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='MEDIUM'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['current_site_id'], ['sites.site_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['equipment_id'], ['equipment.equipment_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recommended_site_id'], ['sites.site_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('recommendation_id')
    )
    op.create_index(op.f('ix_recommendations_recommendation_id'), 'recommendations', ['recommendation_id'], unique=False)
    op.create_index(op.f('ix_recommendations_equipment_id'), 'recommendations', ['equipment_id'], unique=False)
    op.create_index(op.f('ix_recommendations_current_site_id'), 'recommendations', ['current_site_id'], unique=False)
    op.create_index(op.f('ix_recommendations_recommended_site_id'), 'recommendations', ['recommended_site_id'], unique=False)
    op.create_index(op.f('ix_recommendations_priority'), 'recommendations', ['priority'], unique=False)
    op.create_index(op.f('ix_recommendations_status'), 'recommendations', ['status'], unique=False)


def downgrade() -> None:
    op.drop_table('recommendations')
    op.drop_table('forecast_data')
    op.drop_table('alerts')
    op.drop_table('usage_logs')
    op.drop_table('rentals')
    op.drop_table('equipment')
    op.drop_table('operators')
    op.drop_table('sites')
