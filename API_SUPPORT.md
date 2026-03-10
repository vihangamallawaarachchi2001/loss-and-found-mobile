# API Support & Full-System Integration Guide

This document defines what to build for a production backend around this mobile app.

---

## 1) ASP.NET Web API Gateway ("gate")

### Purpose
The ASP.NET gateway is the **single HTTP entry point** for mobile/web clients.
It should:
- validate requests
- authenticate/authorize users
- map REST requests to gRPC calls
- orchestrate response shaping
- hide internal Python service details

### Suggested Stack
- ASP.NET Core Web API (.NET 8)
- gRPC client (`Grpc.Net.Client`)
- JWT auth (or your identity provider)
- Serilog/OpenTelemetry for logging/tracing
- FluentValidation for request validation

### Responsibilities
1. **Auth + identity context**
   - issue/validate JWTs
   - attach current user identity to gRPC metadata
2. **Input validation**
   - validate DTOs before forwarding
3. **Transport mapping**
   - REST JSON ↔ protobuf messages
4. **Error normalization**
   - convert gRPC status codes to stable HTTP errors
5. **Versioning**
   - REST versioning (`/api/v1/...`)

### Gateway Endpoint Contract (recommended)
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/items/lost`
- `POST /api/v1/items/lost`
- `GET /api/v1/items/found`
- `POST /api/v1/items/found`
- `GET /api/v1/items/{id}`
- `POST /api/v1/matches/{lostId}/{foundId}/accept`
- `POST /api/v1/matches/{lostId}/{foundId}/reject`
- `POST /api/v1/matches/{lostId}/{foundId}/claim`
- `GET /api/v1/profile/me`
- `PUT /api/v1/profile/me`

### What to Implement in Gateway (minimum)
- REST controllers for all app flows
- request/response DTO models
- gRPC client adapters (typed service wrappers)
- auth middleware and policies
- correlation ID + structured logs
- health endpoint: `GET /healthz`

---

## 2) Python Service via gRPC + Protobuf + SQLAlchemy + SQL

### Purpose
The Python service is the **core domain engine**:
- item/report lifecycle
- match scoring logic
- claim workflow state transitions
- persistence to SQL database
- owner-alert generation order

### Suggested Stack
- Python 3.11+
- FastAPI (optional for ops/admin) + native gRPC server
- `grpcio`, `grpcio-tools`, `protobuf`
- SQLAlchemy 2.x + Alembic
- PostgreSQL (recommended) or MySQL

### Core Modules
- `auth_service.py` (if identity is internal)
- `item_service.py` (lost/found CRUD)
- `match_service.py` (text/image score + ranking)
- `claim_service.py` (accept/reject/claimed transitions)
- `notification_service.py` (event emit for push)

### Database Model (minimum)
- `users`
- `item_reports` (type: lost/found, status)
- `match_candidates` (scores, rank)
- `match_decisions` (pending/accepted/rejected/claimed)
- `device_tokens` (for push)
- `outbox_events` (recommended for reliable notifications)

### Matching Implementation
#### Text Matching (required)
- lowercase normalize
- strip punctuation + stop words
- keyword extraction
- Jaccard similarity:

$$
J(A,B)=\frac{|A\cap B|}{|A\cup B|}
$$

- threshold recommended: `0.55` (tune with data)

#### Image Matching (non-ML heuristic)
- color histogram similarity
- edge/shape similarity
- perceptual hash distance
- combine to image score

#### Combined Confidence
- if image exists:
  - `combined = text * 0.65 + image * 0.35`
- if no image:
  - `combined = text`

### gRPC Service Contract (high-level)
Create protobuf package, e.g. `lostfound.v1`:
- `AuthService`
  - `Login`, `Signup`, `ForgotPassword`, `ResetPassword`
- `ItemService`
  - `CreateLostItem`, `CreateFoundItem`, `ListLostItems`, `ListFoundItems`, `GetItem`
- `MatchService`
  - `ListOwnerAlerts`, `AcceptMatch`, `RejectMatch`, `MarkClaimed`
- `ProfileService`
  - `GetProfile`, `UpdateProfile`

Generate:
- Python server stubs
- C# gateway client stubs

---

## 3) End-to-End Integration Flow

1. Mobile app calls ASP.NET gateway via HTTP/JSON.
2. Gateway validates/authenticates request.
3. Gateway calls Python gRPC service using protobuf message.
4. Python service executes domain logic + SQLAlchemy DB transaction.
5. Python returns gRPC response.
6. Gateway maps response to REST DTO and returns to client.

### Notification Escalation Flow
When top-confidence owner rejects:
1. mark decision as rejected
2. resolve next eligible owner by confidence order
3. emit notification event
4. push via Expo notification provider (through your backend worker)

---

## 4) Suggested Repository Layout (Backend)

### Gateway (.NET)
- `src/Gateway.Api`
- `src/Gateway.Application`
- `src/Gateway.Infrastructure`
- `src/Gateway.GrpcClients`

### Python Service
- `services/lostfound_grpc`
- `services/lostfound_grpc/proto`
- `services/lostfound_grpc/domain`
- `services/lostfound_grpc/repositories`
- `services/lostfound_grpc/migrations`

---

## 5) Development Checklist

### Gateway
- [ ] REST endpoints implemented
- [ ] DTO validation + error mapping
- [ ] gRPC client integration
- [ ] auth middleware + policies
- [ ] OpenAPI docs

### Python gRPC
- [ ] protobuf contracts finalized
- [ ] SQLAlchemy models + Alembic migrations
- [ ] matching engine implementation
- [ ] decision workflow implementation
- [ ] unit/integration tests

### Integration
- [ ] env configs (dev/stage/prod)
- [ ] tracing IDs across HTTP→gRPC
- [ ] retry/timeouts/circuit-breaker
- [ ] push-token registration + notification worker

---

## 6) Frontend Integration Notes

Current frontend is already aligned with:
- auth flow screens
- lost/found create/list/details
- profile updates
- owner alert/accept/reject/claimed transitions

Update `src/services/api.ts` base URL and auth headers once gateway is ready.

For `NATIVE_ENV=ui`, frontend intentionally uses mock API + seed data.
For `NATIVE_ENV=dev|prod`, backend integration is expected.
