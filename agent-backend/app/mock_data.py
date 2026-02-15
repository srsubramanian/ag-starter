"""Mock data generators for the FinOps Assistant.

These provide realistic fintech data when no real data source is connected.
"""
import random
from datetime import datetime, timedelta


def get_transaction_summary(tenant_id: str, date_range: str = "7d") -> dict:
    """Return mock transaction summary for a tenant."""
    days = int(date_range.replace("d", "")) if date_range.endswith("d") else 7

    base_volume = random.randint(850_000, 1_200_000)
    success_rate = round(random.uniform(97.2, 99.8), 2)
    avg_latency_ms = round(random.uniform(120, 280), 1)

    daily_volumes = []
    for i in range(days):
        date = (datetime.now() - timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
        volume = base_volume + random.randint(-100_000, 150_000)
        daily_volumes.append({"date": date, "volume": volume, "amount_usd": round(volume * random.uniform(42, 78), 2)})

    return {
        "tenant_id": tenant_id,
        "date_range": date_range,
        "total_transactions": sum(d["volume"] for d in daily_volumes),
        "total_amount_usd": round(sum(d["amount_usd"] for d in daily_volumes), 2),
        "success_rate_pct": success_rate,
        "avg_latency_ms": avg_latency_ms,
        "daily_breakdown": daily_volumes,
        "top_merchants": [
            {"name": "Stripe Connect", "volume": random.randint(200_000, 400_000), "amount_usd": round(random.uniform(8_000_000, 15_000_000), 2)},
            {"name": "PayPal Commerce", "volume": random.randint(150_000, 300_000), "amount_usd": round(random.uniform(5_000_000, 12_000_000), 2)},
            {"name": "Square POS", "volume": random.randint(100_000, 250_000), "amount_usd": round(random.uniform(3_000_000, 8_000_000), 2)},
            {"name": "Adyen Gateway", "volume": random.randint(80_000, 200_000), "amount_usd": round(random.uniform(4_000_000, 10_000_000), 2)},
            {"name": "Worldpay Direct", "volume": random.randint(50_000, 150_000), "amount_usd": round(random.uniform(2_000_000, 6_000_000), 2)},
        ],
    }


def get_sla_compliance(tenant_id: str) -> dict:
    """Return mock SLA compliance metrics."""
    return {
        "tenant_id": tenant_id,
        "period": "current_month",
        "uptime_pct": round(random.uniform(99.90, 99.99), 3),
        "p50_latency_ms": round(random.uniform(45, 85), 1),
        "p95_latency_ms": round(random.uniform(180, 350), 1),
        "p99_latency_ms": round(random.uniform(400, 800), 1),
        "error_rate_pct": round(random.uniform(0.01, 0.15), 3),
        "sla_targets": {
            "uptime_target_pct": 99.95,
            "p95_latency_target_ms": 300,
            "error_rate_target_pct": 0.10,
        },
        "compliance_status": {
            "uptime": "COMPLIANT",
            "latency": random.choice(["COMPLIANT", "COMPLIANT", "AT_RISK"]),
            "error_rate": random.choice(["COMPLIANT", "COMPLIANT", "NON_COMPLIANT"]),
        },
        "incidents_this_month": random.randint(0, 3),
    }


def get_payment_channel_breakdown(tenant_id: str) -> dict:
    """Return mock payment channel data."""
    channels = [
        {"channel": "Credit Card", "volume_pct": round(random.uniform(38, 48), 1), "avg_ticket_usd": round(random.uniform(65, 120), 2), "success_rate_pct": round(random.uniform(97, 99.5), 2)},
        {"channel": "Debit Card", "volume_pct": round(random.uniform(20, 30), 1), "avg_ticket_usd": round(random.uniform(35, 75), 2), "success_rate_pct": round(random.uniform(98, 99.8), 2)},
        {"channel": "ACH/Bank Transfer", "volume_pct": round(random.uniform(10, 18), 1), "avg_ticket_usd": round(random.uniform(250, 1200), 2), "success_rate_pct": round(random.uniform(99, 99.9), 2)},
        {"channel": "Digital Wallet", "volume_pct": round(random.uniform(8, 15), 1), "avg_ticket_usd": round(random.uniform(40, 90), 2), "success_rate_pct": round(random.uniform(98.5, 99.9), 2)},
        {"channel": "Wire Transfer", "volume_pct": round(random.uniform(2, 6), 1), "avg_ticket_usd": round(random.uniform(5000, 50000), 2), "success_rate_pct": round(random.uniform(99.5, 100), 2)},
    ]
    # Normalize percentages to sum to 100
    total = sum(c["volume_pct"] for c in channels)
    for c in channels:
        c["volume_pct"] = round(c["volume_pct"] / total * 100, 1)

    return {
        "tenant_id": tenant_id,
        "channels": channels,
        "total_channels_active": len(channels),
        "fastest_channel": "Digital Wallet",
        "highest_value_channel": "Wire Transfer",
    }
