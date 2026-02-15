"""LangGraph tools for the FinOps Assistant agent."""
from langchain_core.tools import tool
from app.mock_data import (
    get_transaction_summary as _get_txn_summary,
    get_sla_compliance as _get_sla,
    get_payment_channel_breakdown as _get_channels,
)


@tool
def get_transaction_summary(tenant_id: str, date_range: str = "7d") -> dict:
    """Get transaction summary for a tenant over a date range.

    Args:
        tenant_id: The tenant identifier (e.g. 'tenant-demo-001')
        date_range: Time period like '7d', '14d', '30d'
    """
    return _get_txn_summary(tenant_id, date_range)


@tool
def get_sla_compliance(tenant_id: str) -> dict:
    """Get SLA compliance metrics for a tenant.

    Args:
        tenant_id: The tenant identifier
    """
    return _get_sla(tenant_id)


@tool
def get_payment_channel_breakdown(tenant_id: str) -> dict:
    """Get payment channel breakdown showing volume and success rates per channel.

    Args:
        tenant_id: The tenant identifier
    """
    return _get_channels(tenant_id)
