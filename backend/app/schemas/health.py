from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class TableCountInfo(BaseModel):
    name: str
    count: int

class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Application status")
    database: str = Field(default="healthy", description="Database connection status")
    timestamp: str = Field(..., description="ISO 8601 current timestamp")
    environment: str = Field(default="development", description="Current runtime environment")
    version: str = Field(default="1.0.0", description="API version")
    tables: Optional[Dict[str, int]] = Field(default=None, description="Current row counts per table")

class DatabaseHealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Database connection status")
    database_type: str = Field(default="PostgreSQL", description="Database engine type")
    latency_ms: float = Field(..., description="Query round-trip latency in milliseconds")
    timestamp: str = Field(..., description="ISO 8601 current timestamp")
    tables_count: int = Field(..., description="Number of managed tables found in database")
    table_names: List[str] = Field(default_factory=list, description="List of recognized application tables")
    row_counts: Dict[str, int] = Field(default_factory=dict, description="Row count per table")
