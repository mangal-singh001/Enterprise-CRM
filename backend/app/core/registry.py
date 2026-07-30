from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class FieldDefinition(BaseModel):
    key: str
    label: str
    type: str  # text, number, select, json, textarea, toggle
    required: bool = True
    read_only: bool = False
    options: Optional[List[Dict[str, str]]] = None  # For select fields
    default: Optional[Any] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None

class EntityDefinition(BaseModel):
    id: str
    name: str
    plural_name: str
    description: str
    product_id: str
    fields: List[FieldDefinition]
    table_columns: List[Dict[str, Any]]
    primary_key: str = "id"

class ProductDefinition(BaseModel):
    id: str
    name: str
    code: str
    description: str
    icon: str
    entities: List[EntityDefinition]

class EntityRegistry:
    """
    Central Registry for multi-product entity definitions.
    Enables low-code extensibility: adding a new product/entity requires adding its definition here.
    """
    def __init__(self):
        self._products: Dict[str, ProductDefinition] = {}
        self._register_default_products()

    def _register_default_products(self):
        # 1. EduPulse Product Registration
        edupulse_plans = EntityDefinition(
            id="subscription_plans",
            name="Subscription Plan",
            plural_name="Subscription Plans",
            description="Manage pricing plans, billing cycles, and feature configurations for EduPulse SaaS.",
            product_id="edupulse",
            primary_key="id",
            fields=[
                FieldDefinition(key="name", label="Plan Name", type="text", required=True, placeholder="e.g. Enterprise Tier"),
                FieldDefinition(key="price", label="Price ($)", type="number", required=True, placeholder="e.g. 199.99"),
                FieldDefinition(
                    key="billing_cycle",
                    label="Billing Cycle",
                    type="select",
                    required=True,
                    options=[
                        {"label": "Monthly", "value": "Monthly"},
                        {"label": "Quarterly", "value": "Quarterly"},
                        {"label": "Yearly", "value": "Yearly"},
                    ],
                    default="Monthly"
                ),
                FieldDefinition(
                    key="features",
                    label="Plan Features (Structured JSON)",
                    type="json",
                    required=False,
                    help_text="Custom key-value features dictionary, e.g. {'max_students': 1000, 'custom_domain': true}"
                )
            ],
            table_columns=[
                {"key": "id", "label": "ID", "sortable": True},
                {"key": "name", "label": "Plan Name", "sortable": True, "searchable": True},
                {"key": "price", "label": "Price ($)", "sortable": True, "format": "currency"},
                {"key": "billing_cycle", "label": "Billing Cycle", "sortable": True, "badge": True},
                {"key": "features", "label": "Configured Features", "format": "json_count"},
                {"key": "created_at", "label": "Created At", "sortable": True, "format": "datetime"},
            ]
        )

        edupulse_templates = EntityDefinition(
            id="message_templates",
            name="Message Template",
            plural_name="Message Templates",
            description="Configure transactional notification templates across Email, SMS, WhatsApp, and Push channels.",
            product_id="edupulse",
            primary_key="id",
            fields=[
                FieldDefinition(key="name", label="Template Name", type="text", required=True, placeholder="e.g. Welcome Email"),
                FieldDefinition(
                    key="channel",
                    label="Delivery Channel",
                    type="select",
                    required=True,
                    options=[
                        {"label": "Email", "value": "Email"},
                        {"label": "SMS", "value": "SMS"},
                        {"label": "WhatsApp", "value": "WhatsApp"},
                        {"label": "Push Notification", "value": "Push"},
                    ],
                    default="Email"
                ),
                FieldDefinition(
                    key="configuration",
                    label="Message Configuration (Channel Dependent)",
                    type="json",
                    required=True,
                    help_text="Channel specific config. Email: subject, html_body. SMS: text, sender_id."
                )
            ],
            table_columns=[
                {"key": "id", "label": "ID", "sortable": True},
                {"key": "name", "label": "Template Name", "sortable": True, "searchable": True},
                {"key": "channel", "label": "Delivery Channel", "sortable": True, "badge": True},
                {"key": "configuration", "label": "Config Preview", "format": "channel_config"},
                {"key": "updated_at", "label": "Last Updated", "sortable": True, "format": "datetime"},
            ]
        )

        edupulse = ProductDefinition(
            id="edupulse",
            name="EduPulse",
            code="EDUPULSE",
            description="Educational SaaS Platform for institution management, billing, and automated notifications.",
            icon="GraduationCap",
            entities=[edupulse_plans, edupulse_templates]
        )

        # 2. CloudMetric Product Registration
        cloudmetric_sites = EntityDefinition(
            id="client_sites",
            name="Client Site",
            plural_name="Client Sites",
            description="Manage client API keys, domain white-lists, status, and daily request quotas.",
            product_id="cloudmetric",
            primary_key="id",
            fields=[
                FieldDefinition(key="domain_name", label="Domain Name", type="text", required=True, placeholder="e.g. api.clientdomain.com"),
                FieldDefinition(key="api_key", label="API Key", type="text", required=True, placeholder="Auto-generated or custom key"),
                FieldDefinition(
                    key="status",
                    label="Status",
                    type="select",
                    required=True,
                    options=[
                        {"label": "Active", "value": "Active"},
                        {"label": "Suspended", "value": "Suspended"},
                        {"label": "Maintenance", "value": "Maintenance"},
                    ],
                    default="Active"
                ),
                FieldDefinition(key="daily_quota", label="Daily Request Quota", type="number", required=True, default=10000)
            ],
            table_columns=[
                {"key": "id", "label": "ID", "sortable": True},
                {"key": "domain_name", "label": "Domain Name", "sortable": True, "searchable": True},
                {"key": "api_key", "label": "API Key", "format": "masked_key"},
                {"key": "status", "label": "Status", "sortable": True, "badge": True},
                {"key": "daily_quota", "label": "Daily Quota", "sortable": True, "format": "number"},
                {"key": "created_at", "label": "Registered Date", "sortable": True, "format": "datetime"},
            ]
        )

        cloudmetric = ProductDefinition(
            id="cloudmetric",
            name="CloudMetric",
            code="CLOUDMETRIC",
            description="Cloud Performance Monitoring & API Metrics Analytics Suite.",
            icon="Activity",
            entities=[cloudmetric_sites]
        )

        self._products["edupulse"] = edupulse
        self._products["cloudmetric"] = cloudmetric

    def get_products(self) -> List[ProductDefinition]:
        return list(self._products.values())

    def get_product(self, product_id: str) -> Optional[ProductDefinition]:
        return self._products.get(product_id.lower())

    def get_entity(self, product_id: str, entity_id: str) -> Optional[EntityDefinition]:
        product = self.get_product(product_id)
        if not product:
            return None
        for entity in product.entities:
            if entity.id == entity_id:
                return entity
        return None

registry = EntityRegistry()
