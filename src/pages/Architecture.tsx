import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ServiceDetail = {
  name: string;
  summary: string;
  purpose: string[];
  apis: string[];
  ownedData: string[];
  integrations: string[];
  security: string[];
  idempotency: string[];
  observability: string[];
  assumptions?: string[];
};

type SequenceDetail = {
  id: string;
  title: string;
  actors: string[];
  preconditions: string[];
  happyPath: string[];
  edgeCases: string[];
  events: string[];
  idempotency: string[];
  observability: string[];
  bcNotes: string[];
};

type CrossCuttingDetail = {
  title: string;
  items: string[];
};

type EntityRecord = {
  entity: string;
  store: string;
  pii: string;
};

type AcronymRecord = {
  term: string;
  meaning: string;
};

type GlossaryRecord = {
  term: string;
  definition: string;
};

type MermaidSnippet = {
  title: string;
  code: string;
};

const serviceDetails: ServiceDetail[] = [
  {
    name: "Booking Service",
    summary:
      "Source of truth for bookings while coordinating availability holds, deposits, and downstream notifications.",
    purpose: [
      "Source of truth for the booking lifecycle (request → hold → confirmed → active → completed → cancelled).",
      "Enforces availability, refund windows, deposit pre-authorization orchestration, and marketplace policy rules.",
      "Drives notifications, insurance binding, and payout triggers across the platform.",
    ],
    apis: [
      "POST /bookings (idempotent via Idempotency-Key)",
      "GET /bookings/{id}",
      "POST /bookings/{id}/cancel",
      "POST /bookings/{id}/mark-completed",
    ],
    ownedData: [
      "Booking with status, monetary snapshot, participants, and captured policy/tax versions.",
      "AvailabilityHold and AvailabilitySlot references managed in coordination with Inventory.",
      "No primary card data; relies on tokens from Payments.",
    ],
    integrations: [
      "Reads/writes Inventory for holds and calendar updates.",
      "Invokes Payments for deposit pre-auths, captures, and refunds.",
      "Coordinates with Insurance for quotes/binding and Messaging for confirmations.",
      "Publishes Booking.Created, Booking.Updated, Booking.Cancelled, and Booking.Completed events.",
    ],
    security: [
      "RBAC ensures renters, owners, partners, and admins only access permitted actions.",
      "Critical actions (create, cancel, override) are immutably audited.",
      "Stores booking metadata only—PII is accessed through scoped Identity or Payments APIs.",
    ],
    idempotency: [
      "All mutations require an Idempotency-Key stored for 24–48 hours to deduplicate retries.",
      "Booking orchestration follows a saga pattern to release holds and deposit authorizations on failure.",
    ],
    observability: [
      "Monitors booking funnel conversion, hold versus confirm ratio, and cancellations by policy tier.",
      "Tracks deposit failures and provides distributed traces for createBooking flows and webhook callbacks.",
    ],
    assumptions: [
      "Refund policy versions are snapshot on each booking to prevent drift during later modifications.",
    ],
  },
  {
    name: "Payments & Payouts (+KYC) Service",
    summary:
      "Handles funds flow, deposits, refunds, payouts, and tax boundaries while enforcing KYC compliance for Canadian operations.",
    purpose: [
      "Manages marketplace payment intents, deposit holds, captures/releases, refunds, and split payouts.",
      "Calculates platform fees and GST/PST tax lines within the Canadian boundary.",
      "Maintains KYC onboarding and status for owners and partners, applying compliance holds as needed.",
    ],
    apis: [
      "POST /payments/intents",
      "POST /payments/deposits/preauth",
      "POST /payments/refunds",
      "POST /payouts/initiate",
      "POST /kyc/start and GET /kyc/{id}/status",
    ],
    ownedData: [
      "PaymentIntent, DepositHold, Refund, Payout, and TaxLine aggregates.",
      "Processor identifiers and tokens without storing primary account numbers.",
      "Cached KYC status and compliance notes scoped to the PII datastore.",
    ],
    integrations: [
      "Calls the payments processor for intents, authorizations, captures, refunds, and payouts with signed webhooks returning state changes.",
      "Starts and tracks KYC flows with the compliance provider via HTTPS and webhooks.",
      "Publishes Deposit.Authorized/Captured/Released/Refunded, Payout.Initiated/Settled/Failed, and KYC.Approved/Rejected events.",
      "Exposes administrative overrides to the Admin/Ops service for exceptional cases.",
    ],
    security: [
      "Minimizes PCI scope by storing processor tokens only and delegating payment data handling to the provider.",
      "PII (KYC artifacts) is isolated in the dedicated PII database accessible only to Identity and Payments services.",
      "Implements Canadian GST (5%) and BC PST (7%) rules with explicit versioning for tax governance.",
    ],
    idempotency: [
      "Webhook ingestion is idempotent with HMAC verification and event-id deduplication tables for replay safety.",
      "Retries external calls with exponential backoff and routes persistent failures to a DLQ for follow-up.",
    ],
    observability: [
      "Monitors authorization→capture success, refund latency, payout SLAs, KYC approval rates, and chargeback trends.",
      "Alerts on stuck payouts, repeated webhook retries, or mismatched tax calculations.",
    ],
    assumptions: [
      "Processor supports marketplace split payouts and independent deposit holds via a Connect-style product.",
    ],
  },
  {
    name: "Insurance Gateway",
    summary:
      "Mediates quotes, binding, and claims with the insurance provider while storing evidence references securely.",
    purpose: [
      "Provides per-booking insurance quotes and binds coverage once bookings confirm.",
      "Facilitates claims intake with structured evidence collection and provider status synchronization.",
      "Ensures claim lifecycle visibility for renters, owners, and internal teams.",
    ],
    apis: [
      "POST /insurance/quotes",
      "POST /insurance/bind",
      "POST /insurance/claims",
      "POST /insurance/claims/{id}/evidence",
    ],
    ownedData: [
      "InsurancePolicy records (provider IDs, premiums, terms).",
      "InsuranceClaim states with evidence metadata linked to object storage.",
    ],
    integrations: [
      "Calls the insurance provider for quotes, binding, and claim updates via HTTPS.",
      "Consumes signed webhooks relayed through the Webhook Handler to keep status current.",
      "Publishes Policy.Bound and Claim.Opened/Updated/Closed events for downstream consumers.",
      "Notifies Messaging about status changes that require renter or owner communication.",
    ],
    security: [
      "Evidence and documents are stored in object storage with short-lived signed URLs.",
      "Claim payloads may include PII, so only references are stored unless regulations require retention in the PII database.",
    ],
    idempotency: [
      "Webhook ingestion is idempotent with deduplication and DLQ fallbacks.",
      "Binding is enforced once per booking through unique constraints.",
    ],
    observability: [
      "Tracks quote coverage, bind success rates, claim open→close latency, and evidence upload success.",
    ],
    assumptions: [
      "Insurance partner supports per-booking pricing and webhook-driven status updates.",
    ],
  },
  {
    name: "Inventory & Listings Service",
    summary:
      "Manages supply onboarding, calendars, and media references while emitting updates for search indexing.",
    purpose: [
      "Supports P2P and B2P listing creation, partner catalogs, and CRUD for inventory records.",
      "Handles calendars, blackout windows, and availability adjustments for individual gear or pooled supply.",
      "Coordinates media ingestion workflows and search index synchronization.",
    ],
    apis: [
      "POST /listings",
      "PATCH /listings/{id}",
      "POST /listings/{id}/media",
      "POST /inventory/{id}/calendar/hold",
      "POST /inventory/{id}/calendar/release",
    ],
    ownedData: [
      "Listing, InventoryItem, AvailabilitySlot, and MediaAsset metadata.",
      "Partner associations and location references for hosted supply.",
    ],
    integrations: [
      "Publishes Listing.Updated and Calendar.Updated events for Search & Pricing.",
      "Stores binary assets in object storage via signed URLs and background processing.",
    ],
    security: [
      "Validates ownership (owner vs partner admin) before allowing edits.",
      "Supports lightweight media scanning prior to publishing listings.",
    ],
    idempotency: [
      "Calendar holds rely on compare-and-set semantics with unique constraints on item/time windows.",
      "API responses surface deterministic state so clients can safely retry.",
    ],
    observability: [
      "Tracks listing activation rates, media upload errors, and calendar contention.",
    ],
    assumptions: [
      "Availability is managed with slot-based granularity (hour/day) for the MVP.",
    ],
  },
  {
    name: "Search & Pricing Service",
    summary:
      "Delivers geo-aware search, pricing quotes, and tax/fee breakdowns backed by cache and search index layers.",
    purpose: [
      "Performs geo and facet-based search with availability hints sourced from cache and search index.",
      "Calculates pricing, platform fees, deposits, and delegates tax line computation to the Payments boundary.",
      "Provides responsive experiences by caching hot queries and estimates.",
    ],
    apis: [
      "POST /search",
      "POST /price/quote",
    ],
    ownedData: [
      "Maintains denormalized search documents and cache entries but no authoritative records.",
    ],
    integrations: [
      "Consumes Listing.Updated and Calendar.Updated events to refresh the search index.",
      "Calls Payments for tax lines and fee schedules with explicit versioning.",
      "Uses Maps/Geocoding for normalization and distance calculations.",
    ],
    security: [
      "Avoids storing PII; only geo coordinates and public listing data are indexed.",
    ],
    idempotency: [
      "Caches responses with TTL and downgrades gracefully to estimates if tax APIs are slow.",
    ],
    observability: [
      "Measures search latency (P95), cache hit rates, quote→booking conversion, and pricing errors.",
    ],
    assumptions: [
      "Deposit calculations follow configurable formulas with percentage and min/max boundaries.",
    ],
  },
  {
    name: "Messaging & Notifications Service",
    summary:
      "Hosts renter↔owner threads, notification delivery, and lightweight moderation signals routed to Admin/Ops.",
    purpose: [
      "Maintains in-app messaging threads with attachments and delivery receipts across push/SMS/email.",
      "Provides templated notifications with localization and channel fan-out.",
      "Runs lightweight moderation and abuse flagging for early detection of issues.",
    ],
    apis: [
      "POST /threads",
      "POST /threads/{id}/messages",
      "POST /notify",
    ],
    ownedData: [
      "MessageThread, Message, DeliveryReceipt, and Flag records with attachment references.",
    ],
    integrations: [
      "Sends outbound messages to the communications provider via HTTPS and consumes signed delivery webhooks.",
      "Publishes Message.Sent/Delivered and Message.Flagged events for analytics and trust workflows.",
      "Shares moderation outcomes with Reviews & Trust.",
    ],
    security: [
      "Implements retention windows, redaction tooling, and abuse reporting endpoints.",
    ],
    idempotency: [
      "Deduplicates client submissions using client_msg_id and retries downstream delivery with DLQ support.",
    ],
    observability: [
      "Tracks send success, delivery latency, spam/abuse flags, and template failures.",
    ],
    assumptions: [
      "Push notifications via FCM/APNs and SMS through a single vendor for the MVP.",
    ],
  },
  {
    name: "Reviews & Trust Service",
    summary:
      "Captures post-trip feedback, flags risky content, and routes disputes to Admin/Ops for moderation.",
    purpose: [
      "Collects ratings and reviews tied to completed bookings with optional weighting.",
      "Supports flagging of users/listings/content and runs simple risk scoring heuristics.",
      "Provides dispute hooks for Admin/Ops to adjudicate sensitive cases.",
    ],
    apis: [
      "POST /reviews",
      "GET /reviews",
      "POST /flags",
    ],
    ownedData: [
      "Review, Flag, RiskScore, and Dispute references (workflow handled in Admin/Ops).",
    ],
    integrations: [
      "Publishes Review.Submitted and Review.Flagged events for analytics and trust dashboards.",
      "Coordinates with Messaging for linking discussions to dispute tickets.",
    ],
    security: [
      "Prevents shilling by validating bookings/relationships and supports right-to-be-forgotten masking.",
    ],
    idempotency: [
      "Enforces one review per participant per completed booking through unique constraints.",
    ],
    observability: [
      "Monitors review rates, rating distributions, flag volumes, and moderation SLAs.",
    ],
    assumptions: [
      "MVP supports simple star ratings with short free-form text; advanced weighting arrives later.",
    ],
  },
  {
    name: "Identity/Auth Service",
    summary:
      "Acts as the OIDC provider with RBAC, MFA, age-of-majority enforcement, and a KYC status cache.",
    purpose: [
      "Issues JWTs via OIDC flows and maintains user roles for renters, owners, partners, and admins.",
      "Enforces MFA enrollment, credential policies, and the BC age-of-majority (19+) gate.",
      "Caches KYC statuses and payout account references for downstream verification.",
    ],
    apis: [
      "POST /auth/token",
      "GET /me",
      "POST /mfa/enroll",
      "POST /mfa/verify",
      "GET /kyc/status",
    ],
    ownedData: [
      "User directory records, credentials, and minimal profiles stored in the PII database.",
      "KYC status cache aligned with Payments for payout eligibility.",
    ],
    integrations: [
      "Initiates or queries KYC providers directly or via Payments.",
      "Publishes KYC.Approved/Rejected events for analytics and gating flows.",
    ],
    security: [
      "Applies strong password policies, MFA, and audits privilege/role changes.",
      "PII isolation ensures downstream services use scoped APIs instead of direct database access.",
    ],
    idempotency: [
      "Hardens token refresh paths and rate-limits repeated failures with lockouts/backoff.",
    ],
    observability: [
      "Tracks login success, MFA enrollment coverage, and suspicious IP/device anomalies.",
    ],
    assumptions: [
      "Single OIDC issuer serves mobile, web, and admin clients.",
    ],
  },
  {
    name: "Admin/Ops Service & Console",
    summary:
      "Provides internal tooling for refunds, overrides, moderation, incident response, and audit viewing.",
    purpose: [
      "Offers a dedicated Admin SPA with safe APIs for overrides, refunds, moderation, and incident workflows.",
      "Surfaces audit logs for sensitive actions and ensures traceable interventions.",
    ],
    apis: [
      "Admin console UI calling Admin API with admin-scoped JWTs.",
      "Domain-specific tools for booking refunds, payout retries, listing/user moderation, and claim follow-ups.",
    ],
    ownedData: [
      "Reads from core services but writes only through scoped admin endpoints; no new authoritative stores.",
      "Queries the append-only audit store for compliance review.",
    ],
    integrations: [
      "Publishes Admin.Action.* events for traceability and metrics.",
      "Collaborates with Messaging and Reviews for moderation cases.",
    ],
    security: [
      "Implements just-in-time access, break-glass workflows, mandatory MFA, and session meta-logging.",
    ],
    idempotency: [
      "Admin actions emit compensating events when feasible and require ticket references for accountability.",
    ],
    observability: [
      "Measures mean time to resolution, override counts, and moderation backlog/throughput.",
    ],
    assumptions: [
      "Sensitive capabilities are hidden behind feature flags and audited approvals.",
    ],
  },
  {
    name: "Webhook Handler",
    summary:
      "Centralizes signed webhook ingestion with idempotency, retries, and routing to internal services.",
    purpose: [
      "Provides hardened ingress endpoints for payments, KYC, insurance, and messaging provider callbacks.",
      "Validates signatures, deduplicates events, and routes payloads to downstream services with consistent semantics.",
    ],
    apis: [
      "POST /webhooks/payments",
      "POST /webhooks/kyc",
      "POST /webhooks/insurance",
      "POST /webhooks/messaging",
    ],
    ownedData: [
      "WebhookReceipt records including signature metadata, processing status, and DLQ references.",
    ],
    integrations: [
      "Forwards validated payloads to Payments, Identity, Insurance, and Messaging via internal RPC.",
      "Emits Webhook.DLQd when retries exhaust, enabling alerting and replay.",
    ],
    security: [
      "Verifies HMAC signatures and optionally enforces provider IP allowlists.",
      "Redacts sensitive payload fields in logs and traces.",
    ],
    idempotency: [
      "Guarantees exactly-once side effects using event-id tables and replay-safe processing.",
    ],
    observability: [
      "Tracks delivery success, retry counts, DLQ backlog, and provider-specific anomaly rates.",
    ],
  },
  {
    name: "Analytics / Event Ingest",
    summary:
      "Subscribes to domain events and pushes curated datasets to the BI warehouse with schema governance.",
    purpose: [
      "Ingests domain events for dashboards, KPIs, and investor reporting.",
      "Maintains event schema governance and redaction rules at the edge of the event bus.",
    ],
    apis: [
      "POST /events/batch (internal)",
      "Connectors streaming from the event bus into the BI warehouse.",
    ],
    ownedData: [
      "Event schemas, mapping configurations, and warehouse tables with aggregated insights.",
    ],
    integrations: [
      "Subscribes to all major domain events described in the container and component diagrams.",
    ],
    security: [
      "Ensures no raw PII leaves source systems—only minimal identifiers and faceted aggregates are exported.",
    ],
    idempotency: [
      "Handles replay and schema drift through governance controls and change alerts.",
    ],
    observability: [
      "Tracks event lag, drop rate, and schema drift notifications to protect KPI accuracy.",
    ],
    assumptions: [
      "BI warehouse is delivered as a managed service with low operational overhead.",
    ],
  },
];

const sequenceDetails: SequenceDetail[] = [
  {
    id: "A",
    title: "Booking with deposit pre-authorization",
    actors: [
      "Renter (Mobile/Web)",
      "API Gateway/BFF",
      "Search & Pricing",
      "Inventory",
      "Payments & Payouts",
      "Identity/Auth",
      "Booking",
      "Insurance Gateway",
      "Messaging/Notifications",
    ],
    preconditions: [
      "Renter is authenticated with OIDC/JWT and passes the BC age-of-majority (19+) gate.",
      "Listing is active with owner or partner approved for payouts (KYC may be pending).",
    ],
    happyPath: [
      "Client searches listings via POST /search; Search & Pricing enriches results with availability and estimated fees/GST/PST/deposit.",
      "Client requests POST /price/quote; Search & Pricing calculates final fees and calls Payments for GST/PST tax lines (versioned).",
      "If compliance thresholds require it, the BFF triggers the Identity/KYC flow before booking proceeds.",
      "Client submits POST /bookings with an Idempotency-Key; Booking orchestrator holds inventory, pre-authorizes the deposit via Payments, and stores a booking snapshot.",
      "Insurance Gateway returns a quote alongside confirmation; Messaging notifies renter and owner across channels.",
      "Insurance binds the policy upon confirmation, emitting Policy.Bound for Booking to update records.",
    ],
    edgeCases: [
      "Tax service latency returns a quote with fallback estimates; background reconciliation ensures renters never pay more than approved totals.",
      "Availability hold conflicts respond with HTTP 409 and suggested alternatives.",
      "Deposit authorization declines return actionable errors, optionally allowing short-lived holds (deferred beyond MVP).",
      "Insurance quote failures continue booking but flag Admin/Ops for follow-up.",
    ],
    events: [
      "Booking.Created emitted when the saga starts, transitioning HELD → CONFIRMED as dependencies succeed.",
      "Deposit.Authorized from Payments records the renter hold prior to capture/release decisions.",
      "Policy.Bound confirms insurance attachment once provider acknowledgement arrives via webhook.",
      "Message.Sent/Delivered notifies renters and owners across in-app and external channels.",
    ],
    idempotency: [
      "POST /bookings requires an Idempotency-Key deduped by (key, user_id) with 24–48 hour TTL.",
      "Saga orchestration releases holds and deposit authorizations if downstream steps fail.",
    ],
    observability: [
      "Tracks search latency P95, quote→booking conversion, deposit authorization success, and KYC blockage rate.",
      "Monitors inventory hold contention and enforces an explicit error budget for the booking API surface.",
    ],
    bcNotes: [
      "GST 5% and BC PST 7% are computed by the Payments boundary with jurisdiction/version metadata.",
      "Identity service enforces age-of-majority with auditable records of the check.",
    ],
  },
  {
    id: "B",
    title: "Owner/Partner payout",
    actors: ["Worker/Cron", "Booking", "Payments & Payouts", "Identity/Auth", "Admin/Ops", "Event Bus"],
    preconditions: [
      "Booking has reached completion with any grace period elapsed.",
      "No blocking disputes or policy holds remain.",
    ],
    happyPath: [
      "Worker detects completed bookings ready for settlement.",
      "Booking replays stored fee/tax snapshots through Payments to avoid pricing drift.",
      "Payments verifies payee KYC status and initiates payout when approved.",
      "Payout events (Payout.Initiated and Payout.Settled) propagate to Booking and downstream analytics.",
    ],
    edgeCases: [
      "Compliance holds emit Payout.Initiated with hold_reason and alert Admin/Ops.",
      "Payout failures trigger retries with backoff and surface manual reissue tooling.",
      "Tax mismatches create anomaly logs and automatically open investigation tickets.",
    ],
    events: [
      "Payout.Initiated emitted when the transfer request is accepted by the processor.",
      "Payout.Settled or Payout.Failed communicates terminal state for downstream reconciliation.",
      "KYC.Approved/Rejected surfaced from Identity/Auth when payee status changes mid-flow.",
    ],
    idempotency: [
      "Payout initiation is uniquely keyed by (booking_id, payee_id) to make retries safe.",
    ],
    observability: [
      "Monitors payout SLA attainment, failure/hold rate, retry depth, and reconciliation discrepancies.",
    ],
    bcNotes: [
      "GST/PST reporting per booking/payout is preserved for CRA and BC compliance without storing card data.",
    ],
  },
  {
    id: "C",
    title: "Insurance attach and claim lifecycle",
    actors: ["Client", "Booking", "Insurance Gateway", "Webhook Handler", "Messaging"],
    preconditions: [
      "Booking exists with insurance provider configured for the listing/category.",
    ],
    happyPath: [
      "Booking requests quote(booking snapshot); Insurance returns premium/options.",
      "On booking confirmation, Booking calls bind and awaits Policy.Bound via webhook.",
      "Webhook Handler verifies HMAC, dedupes, and routes to Insurance/Booking for persistence.",
      "Client opens claims via Insurance Gateway, uploads evidence through signed URLs, and receives notifications on status updates.",
    ],
    edgeCases: [
      "Provider latency leaves policies pending; background sync ensures state convergence.",
      "Evidence upload failures allow clients to request new signed URLs; object lifecycle policies handle expiry.",
      "Claim spam is mitigated by rate limits and moderation flags for suspicious submissions.",
    ],
    events: [
      "Policy.Bound confirms coverage and is forwarded to Booking for record updates.",
      "Claim.Opened/Updated/Closed communicate lifecycle changes from the insurance provider.",
      "Webhook.DLQd alerts operations to signature errors or repeated delivery failures.",
    ],
    idempotency: [
      "Binding occurs once per booking enforced by unique constraints; webhooks dedupe by event_id with DLQ for bad signatures.",
    ],
    observability: [
      "Measures quote→bind conversion, webhook delivery success, claim cycle time, and evidence upload health.",
    ],
    bcNotes: [
      "Claims may include PII; only references and minimal metadata are stored with Canadian-region object storage where possible.",
    ],
  },
  {
    id: "D",
    title: "Cancellation and refund",
    actors: ["Client", "Booking", "Payments & Payouts", "Event Bus", "Messaging"],
    preconditions: [
      "Booking exists with refund policy snapshot recorded at confirmation.",
    ],
    happyPath: [
      "Client submits POST /bookings/{id}/cancel with Idempotency-Key.",
      "Booking evaluates policy tiers, timing windows, and overrides to determine refund outcomes.",
      "Payments processes refunds and deposit releases or captures per policy; events propagate to Booking and Messaging for receipts.",
    ],
    edgeCases: [
      "Late cancellations yield partial refunds or zero per policy definitions.",
      "Refund failures retry with escalating alerts to Admin/Ops.",
      "Deposit capture for damages may defer to insurance claims if not part of MVP scope.",
    ],
    events: [
      "Booking.Cancelled updates lifecycle state and informs downstream subscribers.",
      "Refund.Settled and Deposit.Released from Payments confirm money movement outcomes.",
      "Message.Sent delivers cancellation receipts to renters and owners.",
    ],
    idempotency: [
      "Cancel endpoint enforces Idempotency-Key usage and state machine prevents duplicate cancellations.",
    ],
    observability: [
      "Tracks cancellation reasons, policy tier utilization, refund latency, and refund failure rate.",
    ],
    bcNotes: [
      "Refunds include proportional GST/PST adjustments and align with tax reporting obligations.",
    ],
  },
  {
    id: "E",
    title: "Messaging and reviews with moderation",
    actors: ["User", "Messaging", "Comms Provider", "Reviews & Trust", "Admin/Ops"],
    preconditions: [
      "Users are authenticated with appropriate booking or listing context.",
    ],
    happyPath: [
      "Users create threads and send messages; Messaging fans out notifications via push/SMS/email and records delivery receipts.",
      "Post-trip, each participant submits a review linked to the completed booking.",
      "Reminder notifications encourage feedback and maintain engagement.",
    ],
    edgeCases: [
      "Delivery failures trigger retries or alternative channels.",
      "Abusive behaviour is throttled, muted, or escalated based on moderation heuristics.",
      "Duplicate reviews respond with conflict errors enforced by unique constraints.",
    ],
    events: [
      "Message.Sent/Delivered capture conversation activity for analytics and SLIs.",
      "Message.Flagged escalates potential abuse to Reviews & Trust and Admin/Ops queues.",
      "Review.Submitted/Flagged feed reputation signals and moderation workflows.",
    ],
    idempotency: [
      "Messages dedupe on client_msg_id; reviews enforce single submission per participant per booking.",
    ],
    observability: [
      "Monitors send/delivery success, median time to first owner response, review rates, and moderation backlog or SLA adherence.",
    ],
    bcNotes: [
      "Message retention and export/erasure tooling align with PIPEDA and BC PIPA requirements.",
    ],
  },
];

const crossCuttingRequirements: CrossCuttingDetail[] = [
  {
    title: "PII boundary",
    items: [
      "Only Identity/Auth and Payments directly access the PII database; other services use scoped APIs.",
      "Object storage relies on time-boxed signed URLs for KYC and claim evidence uploads.",
    ],
  },
  {
    title: "Idempotency",
    items: [
      "All mutations supply Idempotency-Keys; webhooks store event identifiers for deduplication.",
      "Booking creation operates as a saga to coordinate holds, deposits, and compensating actions.",
    ],
  },
  {
    title: "Rate limiting & abuse",
    items: [
      "API Gateway enforces per-IP and per-JWT rate limits with tighter controls for search and messaging.",
    ],
  },
  {
    title: "Errors",
    items: [
      "REST errors follow consistent shapes (code, message, correlation_id) and document retry semantics for 5xx/429.",
    ],
  },
  {
    title: "Versioning",
    items: [
      "APIs change backward-compatibly; tax and refund policy versions persist on booking/payment snapshots.",
    ],
  },
  {
    title: "Operations",
    items: [
      "Logs, metrics, and traces enforce PII redaction and power alerting.",
      "Core and PII databases support backups with point-in-time recovery per retention policies.",
    ],
  },
  {
    title: "BC-specific notes",
    items: [
      "Age-of-majority (19+) check enforced in Identity/Auth and auditable.",
      "Payments produces GST/PST tax lines recorded per jurisdiction.",
    ],
  },
];

const coreEntities: EntityRecord[] = [
  { entity: "User", store: "PII DB", pii: "Yes" },
  { entity: "Partner", store: "Core DB", pii: "Limited (business contacts)" },
  { entity: "Listing", store: "Core DB + Search Index", pii: "No" },
  { entity: "InventoryItem", store: "Core DB", pii: "No" },
  { entity: "AvailabilitySlot", store: "Core DB + Cache", pii: "No" },
  { entity: "Booking", store: "Core DB", pii: "No" },
  { entity: "PaymentIntent", store: "Core DB", pii: "No (tokens only)" },
  { entity: "DepositHold", store: "Core DB", pii: "No" },
  { entity: "Payout", store: "Core DB", pii: "No" },
  { entity: "TaxLine", store: "Core DB", pii: "No" },
  { entity: "InsurancePolicy", store: "Core DB", pii: "No" },
  { entity: "InsuranceClaim", store: "Core DB + Object Storage", pii: "May include PII" },
  { entity: "MessageThread/Message", store: "Core DB + Object Storage", pii: "May include PII" },
  { entity: "Review", store: "Core DB", pii: "No" },
  { entity: "Dispute", store: "Core DB", pii: "May include PII" },
  { entity: "Refund", store: "Core DB", pii: "No" },
  { entity: "Location", store: "Core DB", pii: "No" },
  { entity: "MediaAsset", store: "Object Storage", pii: "No (metadata only)" },
  { entity: "AuditLog", store: "Audit Log Store", pii: "Redacted" },
  { entity: "Event", store: "Event Bus / BI Warehouse", pii: "No (schema governed)" },
];

const thirdPartyTouchpoints: string[] = [
  "Payments marketplace/connect platform for intents, holds, captures, refunds, and payouts via signed webhooks.",
  "KYC provider handling onboarding, document review, and sanctions screening with webhook status callbacks.",
  "Insurance provider/broker offering quotes, binding, and claim lifecycle updates with evidence storage via signed URLs.",
  "Maps/Geocoding services for spatial filtering, normalization, and geohash storage.",
  "SMS/Email/Push provider for notifications and delivery receipts.",
];

const eventCatalog: string[] = [
  "Booking.Created/Updated/Cancelled",
  "Deposit.Authorized/Captured/Released/Refunded",
  "Payout.Initiated/Settled/Failed",
  "Policy.Bound",
  "Claim.Opened/Updated/Closed",
  "Message.Sent/Flagged",
  "Review.Submitted/Flagged",
  "KYC.Approved/Rejected",
  "Admin.Action.*",
];

const acronyms: AcronymRecord[] = [
  { term: "API", meaning: "Application Programming Interface" },
  { term: "B2P", meaning: "Business-to-Partner (shops/clubs supplying inventory)" },
  { term: "BI", meaning: "Business Intelligence" },
  { term: "BFF", meaning: "Backend-for-Frontend" },
  { term: "CRA", meaning: "Canada Revenue Agency" },
  { term: "DLQ", meaning: "Dead-Letter Queue" },
  { term: "DR", meaning: "Disaster Recovery" },
  { term: "GST", meaning: "Goods and Services Tax (Canada, 5%)" },
  { term: "HMAC", meaning: "Hash-based Message Authentication Code" },
  { term: "JWT", meaning: "JSON Web Token" },
  { term: "KMS", meaning: "Key Management Service" },
  { term: "KPI", meaning: "Key Performance Indicator" },
  { term: "KYC", meaning: "Know Your Customer" },
  { term: "MFA", meaning: "Multi-Factor Authentication" },
  { term: "mTLS", meaning: "Mutual TLS" },
  { term: "OIDC", meaning: "OpenID Connect" },
  { term: "PII", meaning: "Personally Identifiable Information" },
  { term: "PIPEDA", meaning: "Personal Information Protection and Electronic Documents Act" },
  { term: "PIPA (BC)", meaning: "British Columbia's Personal Information Protection Act" },
  { term: "PITR", meaning: "Point-in-Time Recovery" },
  { term: "PST", meaning: "Provincial Sales Tax (BC, typically 7%)" },
  { term: "RBAC", meaning: "Role-Based Access Control" },
  { term: "SLI/SLO/SLA", meaning: "Service Level Indicator/Objectives/Agreement" },
  { term: "UTC", meaning: "Coordinated Universal Time" },
];

const glossary: GlossaryRecord[] = [
  { term: "Admin/Ops (Console/Service)", definition: "Internal tooling for refunds, overrides, dispute handling, moderation, incident response, and audit viewing." },
  { term: "Age of Majority (19+)", definition: "Legal age gate for British Columbia enforced at sign-up or before high-risk transactions." },
  { term: "Analytics/Event Ingest", definition: "Service subscribing to domain events and exporting curated datasets to the BI warehouse for KPIs." },
  { term: "API Gateway / BFF", definition: "Single ingress for clients performing JWT validation, RBAC, rate limiting, response shaping, and webhook termination." },
  { term: "Audit Log (append-only)", definition: "Immutable record of sensitive actions such as refund overrides, role changes, and KYC updates." },
  { term: "Availability Hold / Slot", definition: "Temporary reservation of a listing's time window to prevent double bookings during confirmation." },
  { term: "B2P Partner", definition: "Business entity supplying inventory with contractual pricing, SLA, and payout terms." },
  { term: "BI Warehouse", definition: "Analytics datastore fed by event ingest for reporting KPIs such as conversion, cancellations, and payouts." },
  { term: "Booking Lifecycle", definition: "State machine covering requested/held → confirmed → active → completed → cancelled with downstream effects." },
  { term: "Break-Glass Access", definition: "Controlled emergency admin access path that is time-boxed and fully audited." },
  { term: "Cache", definition: "Low-latency store for popular search queries, availability hints, and pricing results." },
  { term: "Calendar (Inventory)", definition: "Availability and blackout model for each listing managed through holds and bookings." },
  { term: "Canadian Data Residency", definition: "Preference to host PII in Canadian regions to simplify compliance obligations." },
  { term: "Claim (Insurance)", definition: "Incident record linked to a booking containing status and evidence references in object storage." },
  { term: "Client (Mobile/Web)", definition: "Front-end applications used by renters, owners, partners, and admins communicating over HTTPS with JWTs." },
  { term: "Compliance Hold (Payouts)", definition: "Payments hold triggered by KYC/AML or partner verification that delays payout initiation." },
  { term: "Connect/Marketplace (Payments)", definition: "Payments model enabling split flows, deposit holds, refunds, and payouts for marketplace platforms." },
  { term: "Correlation ID / Trace ID", definition: "Identifier propagated across services and webhooks for distributed tracing." },
  { term: "Data Residency", definition: "Policy dictating where data—particularly PII—is stored and processed." },
  { term: "Deposit Hold (Pre-Auth)", definition: "Authorized amount held on renter's funding source to cover damages or compliance requirements." },
  { term: "DLQ (Dead-Letter Queue)", definition: "Queue storing failed webhook/process messages after retries for replay and diagnosis." },
  { term: "Domain Event", definition: "Immutable fact published on the Event Bus (e.g., Booking.Created, Deposit.Captured)." },
  { term: "DR (Disaster Recovery)", definition: "Strategy for restoring operations after major failures using backups and PITR." },
  { term: "Entity Snapshot", definition: "Copy of mutable references like fees or policies stored with bookings/payments to prevent drift." },
  { term: "Event Bus", definition: "Asynchronous backbone transporting domain events to subscribers." },
  { term: "Evidence (Insurance)", definition: "Photos or documents supporting claims stored via signed URLs in object storage." },
  { term: "Fee Schedule", definition: "Platform or partner fee configuration used by Payments for breakdowns and payouts." },
  { term: "Geofencing / Geohash", definition: "Spatial indexing used by Search & Pricing for map-based results and distance filtering." },
  { term: "GST/PST (Taxes)", definition: "Canadian and BC tax lines added to quotes and settlements with jurisdiction tagging." },
  { term: "HMAC-Signed Webhook", definition: "Provider callback signed with HMAC and verified by the Webhook Handler for authenticity." },
  { term: "Hold vs Capture", definition: "Authorization reserves funds (hold); capture transfers funds; release returns held funds." },
  { term: "Idempotency Key", definition: "Client-provided token ensuring a mutation executes once even if retried." },
  { term: "Identity/Auth Service", definition: "OIDC provider managing JWT issuance, roles, MFA, and KYC status cache." },
  { term: "Insurance Bind", definition: "Operation attaching a policy to a confirmed booking with webhook confirmation." },
  { term: "Inventory Item", definition: "Physical asset or pooled unit tied to a listing and availability schedule." },
  { term: "IP Allowlist", definition: "Optional provider IP ranges permitted to reach webhook endpoints as defense-in-depth." },
  { term: "JWT (JSON Web Token)", definition: "Signed token carrying identity/authorization claims used across the platform." },
  { term: "KMS (Keys)", definition: "Managed encryption key service securing secrets and at-rest data." },
  { term: "KYC (Know Your Customer)", definition: "Verification process enabling payouts through document checks and sanctions screening." },
  { term: "Ledger (Lightweight)", definition: "Payments' internal state for intents, holds, captures, refunds, and payouts reconciled with processor events." },
  { term: "Listing", definition: "Public offering describing gear, pricing, rules, and geo metadata." },
  { term: "Logs / Metrics / Traces", definition: "Observability triad used for detecting, triaging, and fixing issues with PII redaction." },
  { term: "Managed Services", definition: "Cloud-hosted databases, storage, queues, and identity selected to minimize ops burden." },
  { term: "Maps/Geocoding", definition: "Third-party service providing distance calculations and normalized coordinates." },
  { term: "MFA (Multi-Factor)", definition: "Additional authentication factor such as TOTP, push, or SMS for admins and sensitive flows." },
  { term: "Moderation (Messaging/Reviews)", definition: "Heuristics and routing to flag harmful content and escalate to Admin/Ops." },
  { term: "mTLS", definition: "Optional mutual TLS between services; JWT over HTTPS is primary for MVP." },
  { term: "Notification", definition: "Push/SMS/email delivery orchestrated by Messaging with stored receipts." },
  { term: "North-Star KPI", definition: "Primary metric indicating product health (e.g., successful bookings, on-time payouts)." },
  { term: "Object Storage", definition: "Blob storage for media, KYC files, and claim evidence accessed via signed URLs." },
  { term: "OIDC (OpenID Connect)", definition: "Identity protocol used for login and JWT issuance." },
  { term: "Owner (P2P)", definition: "Individual supplier who must pass KYC before receiving payouts." },
  { term: "Partner (B2P)", definition: "Business entity supplying gear with contract terms and SLAs." },
  { term: "Payment Intent", definition: "Processor object representing payment lifecycle steps." },
  { term: "PCI Scope (Minimized)", definition: "Strategy of storing tokens only, delegating card handling to the processor." },
  { term: "PII Boundary", definition: "Architectural separation restricting PII DB access to Identity/Auth and Payments services." },
  { term: "PII DB", definition: "Isolated datastore for emails, addresses, DOB, IDs, and KYC artifacts with encryption at rest." },
  { term: "PITR", definition: "Ability to restore databases to a specific timestamp for recovery." },
  { term: "Policy (Refund)", definition: "Versioned rules defining refund windows and fees stored with bookings." },
  { term: "Policy (Insurance)", definition: "Coverage terms attached to a booking once bound." },
  { term: "Pre-Authorization (Pre-Auth)", definition: "Temporary hold placed before or at confirmation and later captured or released." },
  { term: "Price Quote", definition: "Breakdown of base price, fees, taxes, and deposit produced by Search & Pricing with tax lines from Payments." },
  { term: "PST (BC)", definition: "Provincial Sales Tax tracked with jurisdiction codes and item-dependent rates." },
  { term: "Push Notification", definition: "Mobile notification delivered via FCM/APNs as part of Messaging." },
  { term: "Quote (Insurance)", definition: "Premium/options returned for a booking snapshot prior to binding." },
  { term: "RBAC (Roles)", definition: "Role-based access control enforced at the gateway and service APIs." },
  { term: "Refund", definition: "Payments operation returning captured amounts with proportional tax lines." },
  { term: "Relational DB (Core)", definition: "Primary store for bookings, listings, payments metadata, messages, and reviews." },
  { term: "Renter", definition: "Customer renting gear subject to age-of-majority and payment authorization rules." },
  { term: "Retry with Backoff", definition: "Exponential retry strategy for transient failures such as webhooks and provider calls." },
  { term: "Risk Score (Trust)", definition: "Simple heuristics identifying risky behaviour for prioritization." },
  { term: "Saga", definition: "Orchestrated multi-step workflow with compensating actions on failure (e.g., booking create)." },
  { term: "Search Index", definition: "Denormalized index optimized for listing discovery and geo queries." },
  { term: "Signed URL", definition: "Short-lived URL for secure upload/download to object storage." },
  { term: "SLA / SLO / SLI", definition: "Reliability commitments, targets, and measurements guiding operations." },
  { term: "Snapshotting (Versioning)", definition: "Persisting rule and tax versions on each booking/payment for accurate reconciliation." },
  { term: "Tax Line", definition: "Line item storing jurisdiction, rate, amount, and version metadata." },
  { term: "TTL (Time-to-Live)", definition: "Expiry period for idempotency keys, cache entries, and availability holds." },
  { term: "UTC", definition: "Time standard for stored timestamps rendered per user locale on clients." },
  { term: "User Directory", definition: "Canonical user records with roles and MFA state managed by Identity/Auth." },
  { term: "Versioning (APIs/Rules)", definition: "Backward-compatible API changes and explicit version storage for tax/refund rules." },
  { term: "Webhook", definition: "Provider-to-platform callback signed with HMAC for payments, KYC, insurance, or messaging." },
  { term: "Webhook Handler", definition: "Ingress pipeline verifying signatures, deduping events, retrying, and routing to services." },
  { term: "Worker/Cron", definition: "Background initiator for time-based jobs like payouts after trip completion." },
  { term: "Zero PII in Events", definition: "Guideline that domain events exclude direct PII and rely on stable identifiers." },
];
const mermaidSnippets: MermaidSnippet[] = [
  {
    title: "C4-1: Context",
    code: `flowchart LR
  subgraph CIKR["CiKr Platform"]
    direction TB
    C_Mobile["Mobile App (Renter/Owner)"]
    C_Web["Web App (Renter/Owner)"]
    C_Admin["Admin/Ops Console"]
    C_APIGW["API Gateway / BFF"]
  end

  Renter["Renter"]
  Owner["Owner (P2P)"]
  Partner["Partner (B2P: Shops/Clubs)"]
  AdminUser["Admin/Ops"]

  PaymentsTP["Payments Processor (Marketplace)"]
  KYCTP["KYC/Compliance Provider"]
  InsuranceTP["Insurance Provider/Broker"]
  MapsTP["Maps/Geocoding"]
  MsgTP["SMS/Email/Push"]
  AnalyticsTP["Analytics/BI"]

  Renter -->|HTTPS + OIDC/JWT| C_Mobile
  Renter -->|HTTPS + OIDC/JWT| C_Web
  Owner -->|HTTPS + OIDC/JWT| C_Mobile
  Owner -->|HTTPS + OIDC/JWT| C_Web
  Partner -->|HTTPS + OIDC/JWT| C_Web
  AdminUser -->|HTTPS + OIDC/JWT| C_Admin

  C_Mobile --> C_APIGW
  C_Web --> C_APIGW
  C_Admin --> C_APIGW

  C_APIGW -->|HTTPS + JWT| PaymentsTP
  C_APIGW -->|HTTPS + JWT| KYCTP
  C_APIGW -->|HTTPS + JWT| InsuranceTP
  C_APIGW -->|HTTPS + JWT| MapsTP
  C_APIGW -->|HTTPS + JWT| MsgTP
  C_APIGW -.->|Event stream| AnalyticsTP

  PaymentsTP -.->|Webhook + HMAC| C_APIGW
  InsuranceTP -.->|Webhook + HMAC| C_APIGW
  MsgTP -.->|Delivery receipts| C_APIGW`,
  },
  {
    title: "C4-2: Container",
    code: `flowchart TB
  subgraph Clients
    Mobile["Mobile App (Cross-platform)"]
    Web["Web App"]
    Admin["Admin/Ops Console"]
  end

  APIGW["API Gateway / BFF\n- AuthZ (OIDC/JWT)\n- Rate limiting\n- Request shaping\n- Webhook ingress"]

  subgraph Core["Core Services"]
    Identity["Identity/Auth Service\n- OIDC provider / JWT\n- Roles: renter, owner, partner, admin\n- MFA, age-of-majority"]
    Inventory["Inventory & Listings Service\n- Listings, InventoryItem\n- Calendars, Media refs"]
    SearchPrice["Search & Pricing Service\n- Geofiltering\n- Fee & deposit calc\n- Caching layer"]
    Booking["Booking Service\n- Availability\n- Booking lifecycle\n- Refund rules"]
    PaymentsSvc["Payments & Payouts Service\n- PaymentIntent, DepositHold\n- Payouts, compliance holds\n- Tax lines (GST/PST)"]
    InsuranceSvc["Insurance Gateway\n- Quote/Bind per booking\n- Claims intake & status\n- Webhook handler"]
    MessagingSvc["Messaging & Notifications Service\n- Threads\n- Push/SMS/Email\n- Templates"]
    ReviewsSvc["Reviews & Trust Service\n- Ratings, flags\n- Risk scoring\n- Dispute hooks"]
    AdminOpsSvc["Admin/Ops Service\n- Overrides, refunds\n- Incident response\n- Audit viewer"]
    AnalyticsSvc["Analytics/Event Ingest\n- Event schema\n- BI export"]
    WebhooksSvc["Webhook Handler\n- Idempotency keys\n- DLQ & retries"]
  end

  subgraph Data["Data & Infra"]
    RDBMS[("Relational DB (Core)\n- Bookings, Users, Listings, Payments, Reviews, Messages")]
    PII_DB[("PII DB (Scoped)\n- KYC profiles, IDs, addresses")]
    SearchIndex[("Search Index\n- Listings, geo fields")]
    Cache[("Cache\n- Availability, price calc")]
    ObjStore[("Object Storage\n- Media, KYC docs, claim evidence")]
    EventBus[("Event Bus\n- Booking.Created\n- Deposit.Authorized\n- Payout.Initiated\n- Claim.Opened")]
    Logs[("Observability\n- Logs/Metrics/Traces\n- Alerts")]
    Audit[("Audit Log Store\n- Immutable append-only")]
    BI[("Analytics/BI Warehouse\n- Aggregated events")]
  end

  subgraph ThirdParties["Third-party Providers"]
    PayTP["Payments Processor (Marketplace)"]
    KYCTP["KYC Provider"]
    InsTP["Insurance API/Broker"]
    MapsTP["Maps/Geocoding"]
    MsgTP["SMS/Email/Push"]
  end

  Mobile -- "HTTPS + OIDC/JWT" --> APIGW
  Web -- "HTTPS + OIDC/JWT" --> APIGW
  Admin -- "HTTPS + OIDC/JWT" --> APIGW

  APIGW --> Identity
  APIGW --> Inventory
  APIGW --> SearchPrice
  APIGW --> Booking
  APIGW --> PaymentsSvc
  APIGW --> InsuranceSvc
  APIGW --> MessagingSvc
  APIGW --> ReviewsSvc
  APIGW --> AdminOpsSvc
  APIGW --> AnalyticsSvc
  APIGW --> WebhooksSvc

  Identity --> PII_DB
  Inventory --> RDBMS
  SearchPrice --> SearchIndex
  SearchPrice --> Cache
  Booking --> RDBMS
  PaymentsSvc --> RDBMS
  PaymentsSvc --> PII_DB
  InsuranceSvc --> RDBMS
  MessagingSvc --> RDBMS
  MessagingSvc --> ObjStore
  ReviewsSvc --> RDBMS
  AdminOpsSvc --> RDBMS
  AnalyticsSvc --> BI
  WebhooksSvc --> EventBus

  Booking -- "publish Booking.Created/Updated" --> EventBus
  PaymentsSvc -- "publish Deposit.Authorized/Captured/Refunded\nPayout.Initiated/Settled" --> EventBus
  InsuranceSvc -- "publish Claim.Opened/Updated" --> EventBus
  MessagingSvc -- "publish Message.Sent/Delivered" --> EventBus
  ReviewsSvc -- "publish Review.Submitted/Flagged" --> EventBus
  AdminOpsSvc -- "publish Refund.Override/Dispute.Opened" --> EventBus
  Identity -- "publish KYC.Approved/Rejected" --> EventBus
  EventBus --> AnalyticsSvc

  Core --> Logs
  Core --> Audit

  PaymentsSvc -- "HTTPS + JWT" --> PayTP
  Identity -- "HTTPS + JWT" --> KYCTP
  InsuranceSvc -- "HTTPS + JWT" --> InsTP
  SearchPrice -- "HTTPS + JWT" --> MapsTP
  MessagingSvc -- "HTTPS + JWT" --> MsgTP
  PayTP -. "Webhook + HMAC" .-> WebhooksSvc
  KYCTP -. "Webhook + HMAC" .-> WebhooksSvc
  InsTP -. "Webhook + HMAC" .-> WebhooksSvc

  classDef pii fill:#ffe6e6,stroke:#c00,stroke-width:1.5px;
  PII_DB:::pii
  Identity:::pii
  PaymentsSvc:::pii`,
  },
  {
    title: "Booking Service component",
    code: `flowchart TB
  subgraph Booking["Booking Service"]
    API["REST/gRPC API\n(Idempotent endpoints)"]
    Avail["Availability Engine\n- Overlap checks\n- Holds\n- Race control"]
    Rules["Policy Engine\n- Refund window\n- Cancellation rules"]
    Dep["Deposit Coordinator\n- Pre-auth via Payments\n- Capture/release hooks"]
    Orchestrator["Booking Orchestrator\n- Saga for create/modify/cancel\n- Emits events"]
    Repo["Booking Repository"]
  end
  RDBMS_DB[("Relational DB\nBookings, AvailabilitySlot")]
  EventBus_B[("Event Bus")]
  PaymentsComponent["Payments Service"]
  InventoryComponent["Inventory & Listings Service"]
  IdentityComponent["Identity/Auth Service"]
  InsuranceComponent["Insurance Gateway"]
  MessagingComponent["Messaging/Notifications"]

  API --> Orchestrator
  Orchestrator --> Avail
  Orchestrator --> Rules
  Orchestrator --> Dep
  Orchestrator --> Repo
  Orchestrator -- "publish Booking.Created/Updated/Cancelled" --> EventBus_B

  Dep -- "HTTPS" --> PaymentsComponent
  Orchestrator -- "check calendars" --> InventoryComponent
  Orchestrator -- "role check (owner/renter)" --> IdentityComponent
  Orchestrator -- "bind policy on confirm" --> InsuranceComponent
  Orchestrator -- "send confirmations" --> MessagingComponent

  Repo --> RDBMS_DB`,
  },
  {
    title: "Payments & Payouts component",
    code: `flowchart LR
  subgraph Payments["Payments & Payouts Service"]
    API_Pay["REST API"]
    Ledger["Lightweight Ledger\n- intents, holds, captures\n- fee calc"]
    Tax["Tax Lines (GST/PST)\n- jurisdiction rules\n- versioned"]
    PayoutsEngine["Payout Engine\n- schedules\n- compliance holds"]
    KYCSub["KYC/Compliance Subcomponent\n- onboarding\n- status cache"]
    WebhookIngest["Webhook Ingest\n- idempotency\n- retries/DLQ"]
    Repo_Pay["Payments Repository"]
  end
  PayTPay[("Payments Processor")]
  KYCTPPay[("KYC Provider")]
  RDBMS_Pay[("Relational DB\nPaymentIntent, DepositHold, Payout, TaxLine")]
  EventBus_Pay[("Event Bus")]
  AdminOpsSvcPay["Admin/Ops Service"]

  API_Pay --> Ledger --> Repo_Pay --> RDBMS_Pay
  Ledger --> Tax
  PayoutsEngine --> Repo_Pay
  KYCSub --> Repo_Pay
  WebhookIngest --> Ledger
  WebhookIngest --> PayoutsEngine
  WebhookIngest --> KYCSub

  API_Pay -- "HTTPS + JWT" --> PayTPay
  KYCSub -- "HTTPS + JWT" --> KYCTPPay
  PayTPay -. "Webhook + HMAC" .-> WebhookIngest
  KYCTPPay -. "Webhook + HMAC" .-> WebhookIngest

  Ledger -- "publish Deposit.Authorized/Captured/Refunded" --> EventBus_Pay
  PayoutsEngine -- "publish Payout.Initiated/Settled/Failed" --> EventBus_Pay
  KYCSub -- "publish KYC.Approved/Rejected" --> EventBus_Pay
  AdminOpsSvcPay -- "refund override" --> Ledger`,
  },
  {
    title: "Insurance Gateway component",
    code: `flowchart LR
  subgraph Insurance["Insurance Gateway"]
    API_INS["REST API"]
    Quote["Quote Engine\n- per booking item\n- risk params"]
    Bind["Binder\n- policy attach\n- endorsements"]
    Claims["Claims Intake\n- evidence mgmt\n- status sync"]
    WebhookIn_INS["Webhook Ingest\n- idempotent\n- DLQ"]
    Repo_INS["Insurance Repository"]
  end
  InsTP_INS[("Insurance Provider/Broker")]
  RDBMS_INS[("Relational DB\nInsurancePolicy, InsuranceClaim")]
  Obj_INS[("Object Storage\nEvidence, docs")]
  EventBus_INS[("Event Bus")]
  Booking_INS["Booking Service"]
  Messaging_INS["Messaging/Notify"]

  API_INS --> Quote --> Repo_INS --> RDBMS_INS
  Quote --> Bind --> Repo_INS
  Claims --> Obj_INS
  Claims --> Repo_INS
  WebhookIn_INS --> Claims
  WebhookIn_INS --> Bind

  API_INS -- "HTTPS + JWT" --> InsTP_INS
  InsTP_INS -. "Webhook + HMAC" .-> WebhookIn_INS

  Bind -- "publish Policy.Bound" --> EventBus_INS
  Claims -- "publish Claim.Opened/Updated" --> EventBus_INS
  Booking_INS -- "on confirm -> bind" --> API_INS
  Messaging_INS -- "status updates" --> Claims`,
  },
  {
    title: "Inventory & Listings component",
    code: `flowchart TB
  subgraph InventorySvc["Inventory & Listings Service"]
    API_INV["REST API"]
    Listings["Listings Manager\n- CRUD, media refs\n- partner supply"]
    Calendars["Calendars/Availability\n- holds\n- blackout"]
    Media["Media Ingest\n- resize/transcode via worker"]
    Repo_INV["Inventory Repository"]
  end
  RDBMS_INV[("Relational DB\nListing, InventoryItem, AvailabilitySlot, MediaAsset")]
  Obj_INV[("Object Storage\nimages/videos")]
  Search_INV[("Search Index\nlisting docs")]
  EventBus_INV[("Event Bus")]
  SearchSvc_INV["Search & Pricing Service"]

  API_INV --> Listings --> Repo_INV --> RDBMS_INV
  API_INV --> Calendars --> Repo_INV
  Media --> Obj_INV
  Listings -- "publish Listing.Updated" --> EventBus_INV
  Calendars -- "publish Calendar.Updated" --> EventBus_INV
  EventBus_INV --> SearchSvc_INV
  Repo_INV --> Search_INV`,
  },
  {
    title: "Messaging & Notifications component",
    code: `flowchart LR
  subgraph MessagingSvcComponent["Messaging & Notifications Service"]
    API_MSG["REST API"]
    Threads["Thread Manager\n- participants\n- attachments"]
    Notify["Notification Orchestrator\n- push/SMS/email\n- templates\n- locale"]
    Moderation["Moderation\n- keyword/ML\n- flags"]
    Repo_MSG["Messaging Repository"]
  end
  RDBMS_MSG[("Relational DB\nMessageThread, Message, Flags")]
  Obj_MSG[("Object Storage\nattachments")]
  MsgTP_MSG[("SMS/Email/Push Provider")]
  EventBus_MSG[("Event Bus")]
  ReviewsSvc_MSG["Reviews & Trust Service"]

  API_MSG --> Threads --> Repo_MSG --> RDBMS_MSG
  Threads --> Obj_MSG
  Notify -- "HTTPS + JWT" --> MsgTP_MSG
  API_MSG --> Notify
  Moderation --> Repo_MSG
  Threads -- "publish Message.Sent/Flagged" --> EventBus_MSG
  ReviewsSvc_MSG -- "ingest flags" --> Moderation`,
  },
  {
    title: "Reviews & Trust component",
    code: `flowchart TB
  subgraph ReviewsSvcComponent["Reviews & Trust Service"]
    API_REV["REST API"]
    Ratings["Ratings/Reviews\n- post-trip\n- weighting"]
    Flags["Flagging\n- user/listing\n- thresholds"]
    Risk["Risk Scoring\n- simple rules MVP"]
    Dispute["Dispute Hooks\n- route to Admin/Ops"]
    Repo_REV["Reviews Repository"]
  end
  RDBMS_REV[("Relational DB\nReview, Flag, Dispute")]
  EventBus_REV[("Event Bus")]
  AdminOps_REV["Admin/Ops Service"]
  Messaging_REV["Messaging Service"]

  API_REV --> Ratings --> Repo_REV --> RDBMS_REV
  API_REV --> Flags --> Repo_REV
  API_REV --> Risk
  Flags -- "publish Review.Flagged" --> EventBus_REV
  Ratings -- "publish Review.Submitted" --> EventBus_REV
  Dispute --> AdminOps_REV
  Messaging_REV -- "thread link" --> Dispute`,
  },
  {
    title: "Search & Pricing component",
    code: `flowchart LR
  subgraph SearchPricing["Search & Pricing Service"]
    API_SVP["REST API"]
    Query["Search API\n- filters, facets\n- geo range"]
    Price["Pricing Calc\n- base + fees + taxes\n- deposit calc"]
    CacheLayer["Cache Layer\n- hot queries\n- availability hints"]
  end
  SearchIdx_SVP[("Search Index")]
  Maps_SVP[("Maps/Geocoding")]
  EventBus_SVP[("Event Bus")]
  Payments_SVP["Payments Service (tax rules)"]
  Inventory_SVP["Inventory Service"]

  API_SVP --> Query --> SearchIdx_SVP
  API_SVP --> Price --> Payments_SVP
  Query --> CacheLayer
  Inventory_SVP -- "Listing/Calendar updates" --> EventBus_SVP --> SearchPricing
  SearchPricing -- "sync index" --> SearchIdx_SVP
  Query -- "HTTPS + JWT" --> Maps_SVP`,
  },
  {
    title: "Identity/Auth component",
    code: `flowchart LR
  subgraph IdentitySvc["Identity/Auth Service"]
    OIDC["OIDC Provider\n- JWT issuance\n- OAuth flows"]
    Users["User Directory\n- renters/owners/partners/admins\n- MFA, age-of-majority"]
    RBAC["Role-based Access Control\n- policies\n- scopes"]
    KYCStatus["KYC Status Cache"]
  end
  PII_DB_ID[("PII DB\nemails, addresses, DOB, IDs")]
  KYCTP_ID[("KYC Provider")]
  EventBus_ID[("Event Bus")]

  OIDC --> Users --> PII_DB_ID
  Users --> RBAC
  KYCStatus --> PII_DB_ID
  Users -- "HTTPS + JWT" --> KYCTP_ID
  KYCTP_ID -. "Webhook + HMAC" .-> KYCStatus
  KYCStatus -- "publish KYC.Approved/Rejected" --> EventBus_ID`,
  },
  {
    title: "Admin/Ops component",
    code: `flowchart TB
  subgraph AdminOpsComponent["Admin/Ops Service & Console"]
    UI_Admin["Admin Console UI"]
    API_Admin["Admin API"]
    Tools["Toolbox\n- refunds, overrides\n- user/listing moderation\n- incident response"]
    AuditView["Audit Viewer\n- immutable logs"]
  end
  RDBMS_Admin[("Core DB (read)")]
  Audit_Admin[("Audit Log Store (append-only)")]
  EventBus_Admin[("Event Bus")]

  UI_Admin --> API_Admin --> Tools --> RDBMS_Admin
  AuditView --> Audit_Admin
  Tools -- "publish Admin.Action.*" --> EventBus_Admin`,
  },
  {
    title: "Sequence A: Booking with deposit pre-auth",
    code: `sequenceDiagram
  autonumber
  participant U as User (Renter)
  participant C as Mobile/Web Client
  participant GW as API Gateway/BFF
  participant S as Search & Pricing
  participant I as Identity/Auth
  participant INV as Inventory
  participant B as Booking
  participant P as Payments
  participant INS as Insurance
  participant M as Messaging/Notify

  U->>C: Browse gear (filters, geo)
  C->>GW: search(query) [HTTPS + JWT]
  GW->>S: search(query)
  S->>INV: get availability hints (cache/index)
  INV-->>S: slots
  S-->>GW: results + prices (incl. deposit est., taxes)
  GW-->>C: results

  U->>C: Select listing & dates
  C->>GW: priceQuote(listingId, dates, renter)
  GW->>S: priceQuote(...)
  S->>P: taxLines(listing, location)
  P-->>S: tax lines
  S-->>GW: final price + deposit
  GW-->>C: quote

  alt KYC required for payouts/deposit threshold
    C->>GW: startKYC()
    GW->>I: startKYC()
    I-->>C: KYC link/status
  end

  C->>GW: createBooking(request)
  GW->>B: createBooking
  B->>INV: hold availability
  B->>P: preauthDeposit(amount)
  P-->>B: Deposit.Authorized (event)
  B->>INS: quotePolicy(booking)
  INS-->>B: quote
  B-->>GW: bookingConfirmed + policy quote
  GW-->>C: confirmation
  B-->>M: notify(renter, owner) [push/email/SMS]`,
  },
  {
    title: "Sequence B: Owner/Partner payout",
    code: `sequenceDiagram
  autonumber
  participant Sys as System Cron/Worker
  participant B as Booking
  participant P as Payments
  participant I as Identity/Auth
  participant A as Admin/Ops
  participant E as EventBus

  Sys->>B: on trip completion
  B->>P: computeFeesAndTaxes(booking)
  P-->>B: fee breakdown + taxes
  B->>P: initiatePayouts(owner/partner)
  P->>I: verifyKYCStatus(payee)
  I-->>P: approved/hold
  alt compliance hold
    P-->>A: alertHoldRequired
  else payout
    P-->>E: Payout.Initiated
    P-->>B: payoutRef
  end
  P-->>E: Payout.Settled or Payout.Failed`,
  },
  {
    title: "Sequence C: Insurance attach + claim",
    code: `sequenceDiagram
  autonumber
  participant C as Client
  participant B as Booking
  participant INS as Insurance
  participant W as Webhook Handler
  participant M as Messaging

  C->>B: checkout(booking)
  B->>INS: quote(booking, renter, owner)
  INS-->>B: quote
  B->>INS: bind(on confirm)
  INS-->>W: webhook Policy.Bound
  W->>INS: ack (idempotent)
  W->>B: update policy details
  M-->>C: confirmation & policy docs

  Note over C,B: Later, incident occurs
  C->>INS: openClaim(booking, details)
  INS-->>W: webhook Claim.Opened
  W->>B: mark claim, link evidence bucket
  C->>INS: upload evidence (signed URL)
  INS-->>W: webhook Claim.Updated (status)
  W->>B: sync status
  M-->>C: status notifications`,
  },
  {
    title: "Sequence D: Cancellation & refund",
    code: `sequenceDiagram
  autonumber
  participant C as Client
  participant B as Booking
  participant P as Payments
  participant E as EventBus
  participant M as Messaging

  C->>B: cancelBooking(request)
  B->>B: evaluatePolicy(window, rules)
  alt full refund
    B->>P: refund(full) + releaseDeposit
  else partial refund
    B->>P: refund(partial) + adjustDeposit
  end
  P-->>E: Deposit.Released / Refund.Settled
  B-->>C: cancellationConfirmed
  M-->>C: email/SMS confirmations`,
  },
  {
    title: "Sequence E: Messaging & reviews",
    code: `sequenceDiagram
  autonumber
  participant U as User
  participant MSG as Messaging
  participant MTP as SMS/Email/Push
  participant REV as Reviews/Trust
  participant A as Admin/Ops

  U->>MSG: createThread(listing/booking)
  MSG->>MTP: notify other party
  U->>MSG: sendMessage(content)
  alt flagged by model/keywords
    MSG->>REV: flag(content)
    REV->>A: openModerationCase
  end

  Note over U,REV: Post-trip (on completion)
  U->>REV: submitReview(rating, text)
  alt flagged
    REV->>A: route to moderation
  end`,
  },
  {
    title: "Entity Relationship Diagram",
    code: `erDiagram
  %% === Identity & Access ===
  USER {
    uuid id PK
    string email UK
    string phone
    string legal_name
    string status  "active|disabled"
    timestamp created_at
    timestamp updated_at
  }


  ROLE {
    string code PK  "renter|owner|partner_admin|ops|support"
    string description
  }


  USER_ROLE {
    uuid user_id FK
    string role_code FK
    timestamp granted_at
  }


  KYC_VERIFICATION {
    uuid id PK
    uuid user_id FK
    string provider   "Persona/StripeID/etc"
    string status     "pending|approved|rejected|expired"
    string risk_score
    json   evidence_meta
    timestamp created_at
    timestamp updated_at
  }


  ADDRESS {
    uuid id PK
    string line1
    string line2
    string city
    string region   "BC"
    string country  "CA"
    string postal
    decimal lat
    decimal lng
  }


  USER ||--o{ USER_ROLE : has
  ROLE ||--o{ USER_ROLE : grants
  USER ||--o{ KYC_VERIFICATION : submits


  %% === Partners (B2P) ===
  PARTNER {
    uuid id PK
    string legal_name
    string doing_business_as
    string gst_number
    string pst_number
    string payout_account_ref  "Stripe/Adyen acct id"
    string status
    timestamp created_at
  }


  PARTNER_LOCATION {
    uuid id PK
    uuid partner_id FK
    uuid address_id FK
    string name
    string contact_phone
    string hours_spec  "JSON/OpeningHours"
    string pickup_instructions
  }


  PARTNER_USER {
    uuid partner_id FK
    uuid user_id FK
    string role     "admin|staff"
    timestamp added_at
  }


  PARTNER ||--o{ PARTNER_LOCATION : has
  PARTNER ||--o{ PARTNER_USER : includes
  USER ||--o{ PARTNER_USER : assigned_to
  ADDRESS ||--o{ PARTNER_LOCATION : locates


  %% === Listings, Inventory & Pricing ===
  LISTING {
    uuid id PK
    uuid owner_user_id FK "nullable for B2P"
    uuid partner_id FK   "nullable for P2P"
    uuid partner_location_id FK "optional"
    string title
    string category  "kayak|camp|bike|..."
    string description
    string inventory_model "unique|pooled"
    string status     "active|draft|suspended"
    string currency   "CAD"
    int    default_deposit_cents
    uuid   cancellation_policy_id
    timestamp created_at
    timestamp updated_at
  }


  LISTING_VARIANT {
    uuid id PK
    uuid listing_id FK
    string name     "size/model"
    int    max_qty_per_booking
    int    weight_grams
  }


  GEAR_UNIT {
    uuid id PK
    uuid listing_id FK
    uuid listing_variant_id FK
    string asset_tag
    string serial_number
    string condition "new|good|fair|needs_service"
    string state     "available|maintenance|retired"
  }


  PRICE_RULE {
    uuid id PK
    uuid listing_variant_id FK
    string rule_type  "base_daily|weekend|weekly_discount|seasonal"
    date   starts_on
    date   ends_on
    int    amount_cents        "base or override"
    decimal percent_off
    boolean stackable
  }


  AVAILABILITY_SLOT {
    uuid id PK
    uuid listing_id FK
    uuid gear_unit_id FK  "nullable for pooled"
    timestamp start_at
    timestamp end_at
    int    quantity        ">=1 for pooled, 1 for unique"
    string state           "open|blocked|reserved"
    string reason          "maintenance|owner_hold|..."
  }


  LISTING ||--o{ LISTING_VARIANT : offers
  LISTING ||--o{ GEAR_UNIT : contains
  LISTING_VARIANT ||--o{ PRICE_RULE : uses
  LISTING ||--o{ AVAILABILITY_SLOT : schedules
  GEAR_UNIT ||--o{ AVAILABILITY_SLOT : unit_holds
  USER ||--o{ LISTING : owns_P2P
  PARTNER ||--o{ LISTING : owns_B2P
  PARTNER_LOCATION ||--o{ LISTING : hosted_at


  %% === Booking Lifecycle ===
  BOOKING {
    uuid id PK
    uuid renter_user_id FK
    string status "pending|confirmed|picked_up|returned|canceled|no_show"
    timestamp start_at
    timestamp end_at
    uuid pickup_location_id FK
    uuid return_location_id FK
    string currency "CAD"
    int    subtotal_cents
    int    tax_cents
    int    fees_cents
    int    deposit_hold_cents
    int    total_cents
    uuid   rental_agreement_id
    timestamp created_at
    timestamp updated_at
  }


  BOOKING_ITEM {
    uuid id PK
    uuid booking_id FK
    uuid listing_id FK
    uuid listing_variant_id FK
    uuid gear_unit_id FK "nullable until assign at pickup for pooled"
    int  qty
    int  daily_price_cents
    int  days
    int  line_subtotal_cents
  }


  CANCELLATION_POLICY {
    uuid id PK
    string name
    string window_spec  "e.g., >=48h full refund"
    string terms_md
  }


  BOOKING ||--o{ BOOKING_ITEM : includes
  USER ||--o{ BOOKING : rents
  LISTING ||--o{ BOOKING_ITEM : is_booked
  LISTING_VARIANT ||--o{ BOOKING_ITEM : variant
  GEAR_UNIT ||--o{ BOOKING_ITEM : assigned
  ADDRESS ||--o{ BOOKING : pickup_at
  ADDRESS ||--o{ BOOKING : return_at
  CANCELLATION_POLICY ||--o{ LISTING : governs


  %% === Money: Payments, Deposits, Payouts, Refunds ===
  PAYMENT {
    uuid id PK
    uuid booking_id FK
    string provider          "Stripe/Adyen"
    string provider_intent_id
    string provider_charge_id
    string status            "requires_action|captured|failed"
    int    amount_cents
    timestamp authorized_at
    timestamp captured_at
    timestamp failed_at
  }


  SECURITY_DEPOSIT {
    uuid id PK
    uuid booking_id FK
    string provider
    string provider_hold_id
    string status  "held|partially_captured|released"
    int    hold_amount_cents
    int    captured_amount_cents
    timestamp held_at
    timestamp released_at
  }


  REFUND {
    uuid id PK
    uuid booking_id FK
    uuid payment_id FK
    string reason  "cancel|damage|goodwill"
    int    amount_cents
    string status  "pending|succeeded|failed"
    timestamp created_at
  }


  PAYOUT {
    uuid id PK
    uuid booking_id FK
    string recipient_type "user|partner"
    uuid   recipient_id
    string provider_transfer_id
    int    amount_cents
    string status "pending|paid|failed"
    timestamp created_at
  }


  BOOKING ||--o{ PAYMENT : has
  BOOKING ||--o{ SECURITY_DEPOSIT : holds
  BOOKING ||--o{ REFUND : may_issue
  BOOKING ||--o{ PAYOUT : triggers


  %% === Tax & Fees ===
  TAX_JURISDICTION {
    string code PK   "CA-BC"
    decimal gst_rate
    decimal pst_rate
    date   effective_from
    date   effective_to
  }


  FEE_SCHEDULE {
    uuid id PK
    string name
    decimal platform_fee_pct
    int     min_fee_cents
    int     insurance_fee_cents
    date    effective_from
    date    effective_to
  }


  %% === Legal & Documents ===
  DOCUMENT_CONSENT {
    uuid id PK
    uuid user_id FK
    string doc_type   "ToS|Privacy|OwnerTerms"
    string version
    timestamp consented_at
    string consent_ip
  }


  RENTAL_AGREEMENT {
    uuid id PK
    uuid booking_id FK
    string version
    string pdf_url
    timestamp signed_at
    uuid signer_user_id FK
  }


  USER ||--o{ DOCUMENT_CONSENT : accepts
  BOOKING ||--|| RENTAL_AGREEMENT : binds


  %% === Insurance & Incidents ===
  INSURANCE_POLICY {
    uuid id PK
    string provider
    string policy_number
    string coverage_type "marketplace_master|partner_rider|per_booking"
    timestamp active_from
    timestamp active_to
  }


  INCIDENT_REPORT {
    uuid id PK
    uuid booking_id FK
    uuid reporter_user_id FK
    string type    "damage|loss|injury|late_return"
    text   description
    json   photos_meta
    string status  "open|assessing|closed"
    timestamp created_at
  }


  INSURANCE_CLAIM {
    uuid id PK
    uuid booking_id FK
    uuid policy_id FK
    uuid incident_report_id FK
    string status "draft|submitted|approved|denied|paid"
    int    claim_amount_cents
    int    payout_amount_cents
    timestamp updated_at
  }


  BOOKING ||--o{ INCIDENT_REPORT : may_have
  USER ||--o{ INCIDENT_REPORT : files
  INSURANCE_POLICY ||--o{ INSURANCE_CLAIM : covers
  BOOKING ||--o{ INSURANCE_CLAIM : results_in
  INCIDENT_REPORT ||--|| INSURANCE_CLAIM : basis_for


  %% === Messaging & Reviews (Trust scaffold) ===
  CONVERSATION {
    uuid id PK
    uuid booking_id FK
    string subject
    timestamp created_at
  }


  MESSAGE {
    uuid id PK
    uuid conversation_id FK
    uuid sender_user_id FK
    text body
    timestamp sent_at
    boolean system_generated
  }


  REVIEW {
    uuid id PK
    uuid reviewer_user_id FK
    string subject_type "listing|user|partner"
    uuid subject_id
    int    rating  "1..5"
    text   comment
    timestamp created_at
  }


  BOOKING ||--|| CONVERSATION : threads
  CONVERSATION ||--o{ MESSAGE : contains
  USER ||--o{ MESSAGE : sends
  USER ||--o{ REVIEW : writes
  LISTING ||--o{ REVIEW : receives
  USER ||--o{ REVIEW : receives_as_subject
  PARTNER ||--o{ REVIEW : receives_as_subject`,
  },
];

const whatItShows = [
  "Actors: renter, owner, partner, admin.",
  "Containers: mobile app, web/admin, API gateway/BFF, backend services (Bookings, Payments/KYC, Insurance, Listings, Messaging, Reviews), data stores, and event bus.",
  "External services: payments, KYC, insurance, maps/geocoding, email/SMS/push providers.",
  "Flows & boundaries: booking with deposit pre-auth, protocols (HTTPS/webhooks), auth (OIDC/JWT, HMAC), and trust/PII boundaries.",
];

const whyItsUseful = [
  "Aligns the team on scope, responsibilities, and sequencing.",
  "Surfaces security, privacy, and compliance touchpoints (PIPEDA/BC PIPA, GST/PST).",
  "Supports planning for interfaces, vendor integrations, and future features.",
  "Accelerates onboarding plus investor or partner conversations by providing a single reference.",
];

const diagramTypes = [
  "Context: CiKr vs. users and third parties.",
  "Container: apps, services, and data stores.",
  "Component: internals of critical services (Booking, Payments+KYC, Insurance Gateway, etc.).",
  "Sequence diagrams: booking, payout, claim, refund, messaging flows.",
  "Data/ER view: core entities and where they live.",
  "Optional deployment views covering runtime environments.",
];

const whatItIsNot = [
  "Not code or UI mockups.",
  "Not a low-level network diagram unless producing a deployment view.",
];

const highlights = [
  "Region & tax: Explicit GST/PST boundary, Canadian-ready structure, BC first.",
  "Compliance & privacy: PIPEDA/BC PIPA noted with a PII boundary and immutable audit log.",
  "Security: OIDC/JWT, RBAC, encryption in transit/at rest, signed webhooks, least-privilege data access.",
  "Operations: Observability, idempotency keys, retries and DLQs on webhooks, gateway rate limiting.",
  "Scale & cost: Managed services for relational data, object storage, search index, cache, and event bus.",
  "Bounded contexts: Bookings, Payments & KYC, Insurance, Inventory/Listings, Messaging, Reviews/Trust, Identity/Auth, Admin/Ops, Analytics.",
  "Analytics hooks: Domain events routed to Analytics/Event Ingest and BI warehouse.",
];

const complianceNotes = [
  "PIPEDA & BC PIPA compliance with purpose limitation, collection minimization, and consent flows.",
  "Age-of-majority (19+) gating for BC residents.",
  "Data residency preference for Canadian regions when handling PII.",
];

const assumptionList = [
  "Mobile app is a cross-platform client; renter/owner web plus admin console are separate SPAs.",
  "Payments provider supports marketplace-style split payouts, deposit pre-auths, and refunds.",
  "Insurance provider offers quote/bind APIs, claim webhooks, and signed URL evidence upload.",
  "Managed services keep operations light for the MVP (DB, storage, queue/bus, search, observability).",
  "Scale target: internal alpha with 10–15 bookings and 3–5 B2P pilots.",
];

const renderList = (items: string[]) => (
  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
    {items.map((item, index) => (
      <li key={`${item}-${index}`}>{item}</li>
    ))}
  </ul>
);

const Architecture = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">System Diagram & ERD Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <p>
                  A system diagram visualizes AdventureRent end-to-end: who uses the platform, the services that power
                  it, the trusted boundaries, and how data flows between first- and third-party systems.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">What it shows</h3>
                    {renderList(whatItShows)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Why it&apos;s useful</h3>
                    {renderList(whyItsUseful)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Common diagram types</h3>
                    {renderList(diagramTypes)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">What it isn&apos;t</h3>
                    {renderList(whatItIsNot)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 bg-background p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="components">Services</TabsTrigger>
              <TabsTrigger value="sequences">Sequences</TabsTrigger>
              <TabsTrigger value="data">Data &amp; Integrations</TabsTrigger>
              <TabsTrigger value="glossary">Glossary</TabsTrigger>
              <TabsTrigger value="mermaid">Mermaid Snippets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scope highlights &amp; constraints</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderList(highlights)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Compliance &amp; regional notes</CardTitle>
                </CardHeader>
                <CardContent>{renderList(complianceNotes)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cross-cutting requirements</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {crossCuttingRequirements.map((item) => (
                    <div key={item.title} className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        {item.title}
                      </h3>
                      {renderList(item.items)}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>MVP assumptions</CardTitle>
                </CardHeader>
                <CardContent>{renderList(assumptionList)}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components">
              <Accordion type="multiple" className="space-y-4">
                {serviceDetails.map((service) => (
                  <AccordionItem value={service.name} key={service.name} className="border border-border rounded-xl px-4">
                    <AccordionTrigger className="flex flex-col items-start gap-2 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">{service.name}</span>
                        <Badge variant="secondary">Bounded Context</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground text-left">{service.summary}</p>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Purpose &amp; Scope</h3>
                          {renderList(service.purpose)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">APIs</h3>
                          {renderList(service.apis)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Owned Data</h3>
                          {renderList(service.ownedData)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Integrations &amp; Events</h3>
                          {renderList(service.integrations)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Security &amp; Compliance</h3>
                          {renderList(service.security)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Idempotency &amp; Error Handling</h3>
                          {renderList(service.idempotency)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Observability &amp; KPIs</h3>
                          {renderList(service.observability)}
                        </div>
                        {service.assumptions ? (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Assumptions</h3>
                            {renderList(service.assumptions)}
                          </div>
                        ) : null}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="sequences" className="space-y-6">
              {sequenceDetails.map((sequence) => (
                <Card key={sequence.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center">
                        {sequence.id}
                      </Badge>
                      <CardTitle>{sequence.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Actors &amp; systems</h3>
                      {renderList(sequence.actors)}
                      <Separator className="my-4" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Preconditions</h3>
                      {renderList(sequence.preconditions)}
                      <Separator className="my-4" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Edge cases &amp; failures</h3>
                      {renderList(sequence.edgeCases)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Happy path</h3>
                      {renderList(sequence.happyPath)}
                      <Separator className="my-4" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Events &amp; state transitions</h3>
                      {renderList(sequence.events)}
                      <Separator className="my-4" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Idempotency &amp; correctness</h3>
                      {renderList(sequence.idempotency)}
                      <Separator className="my-4" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Observability &amp; KPIs</h3>
                      {renderList(sequence.observability)}
                      <Separator className="my-4" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">BC notes</h3>
                      {renderList(sequence.bcNotes)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Core entities &amp; primary stores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead className="bg-muted/50 text-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Entity</th>
                          <th className="px-4 py-2 text-left font-semibold">Primary store</th>
                          <th className="px-4 py-2 text-left font-semibold">PII</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {coreEntities.map((entity) => (
                          <tr key={entity.entity} className="text-muted-foreground">
                            <td className="px-4 py-2 align-top">{entity.entity}</td>
                            <td className="px-4 py-2 align-top">{entity.store}</td>
                            <td className="px-4 py-2 align-top">{entity.pii}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Third-party touchpoints</CardTitle>
                </CardHeader>
                <CardContent>{renderList(thirdPartyTouchpoints)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Event catalog for MVP KPIs</CardTitle>
                </CardHeader>
                <CardContent>{renderList(eventCatalog)}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="glossary">
              <Card>
                <CardHeader>
                  <CardTitle>Acronyms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead className="bg-muted/50 text-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Term</th>
                          <th className="px-4 py-2 text-left font-semibold">Meaning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {acronyms.map((entry) => (
                          <tr key={entry.term} className="text-muted-foreground">
                            <td className="px-4 py-2 align-top">{entry.term}</td>
                            <td className="px-4 py-2 align-top">{entry.meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Glossary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[28rem] pr-4">
                    <dl className="space-y-4">
                      {glossary.map((entry) => (
                        <div key={entry.term}>
                          <dt className="font-semibold text-foreground">{entry.term}</dt>
                          <dd className="text-sm text-muted-foreground">{entry.definition}</dd>
                        </div>
                      ))}
                    </dl>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mermaid" className="space-y-6">
              {mermaidSnippets.map((snippet) => (
                <Card key={snippet.title}>
                  <CardHeader>
                    <CardTitle>{snippet.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-96">
                      <pre className="bg-muted rounded-md p-4 text-xs text-foreground whitespace-pre-wrap">
                        <code>{snippet.code}</code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Architecture;
