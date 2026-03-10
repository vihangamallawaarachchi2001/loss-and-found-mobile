# SLIIT Lost & Found Mobile (Expo)

Mobile app for reporting and matching lost/found items within SLIIT university boundaries.

## Tech Stack
- Expo + React Native + TypeScript
- Navigation: React Navigation (native stack + bottom tabs)
- State: Zustand
- Styling: NativeWind (Tailwind)
- Device features: image picker, datetime picker, local notifications

## Features
- One-time onboarding flow (AsyncStorage)
- Auth screens: login, signup, forgot/reset password
- Marketplace-style Home feed with recent lost/found items
- Lost/Found item listing pages
- Add Lost/Add Found forms with:
  - required field validation
  - date-time picker
  - image upload support (optional but recommended)
- Item detail view
- Matching flow:
  - text keyword similarity (Jaccard)
  - image similarity heuristic score
  - combined confidence
- Owner actions:
  - accept/reject potential match
  - mark as claimed (claim execution is outside the app)
- Profile:
  - editable user details
  - own lost/found submissions

## Environment Modes
The app behavior is controlled by `NATIVE_ENV`.

Set in `.env` (or `EXPO_PUBLIC_NATIVE_ENV`):

- `ui`:
  - uses frontend dummy data seed
  - API calls are mocked by feature flag helper
- `dev` / `prod`:
  - no dummy seed
  - real API calls enabled

Example `.env`:

```env
EXPO_PUBLIC_NATIVE_ENV=ui
```

## Local Setup
1. Install dependencies:
   - `pnpm install`
2. Start app:
   - `pnpm start`
3. Open on device/emulator:
   - `pnpm android` or `pnpm ios`

## Notifications Note (Expo Go)
For Android Expo Go (SDK 53+), remote push functionality is not available. The app is patched to avoid runtime crashes in Expo Go. For full push features, use a development build.

## Project Structure
- `src/navigation` - stack + tab navigation
- `src/screens` - page-level screens
- `src/components` - reusable UI/components
- `src/state` - app store/state management
- `src/utils` - matching + validation helpers
- `src/services` - API + notifications services
- `src/domain` - domain models/types

## Backend Integration Summary
This frontend is designed to integrate with:
1. **ASP.NET Web API Gateway** (HTTP facade for clients)
2. **Python gRPC service** (business logic, matching, persistence)

Full implementation guide is in:
- [API_SUPPORT.md](API_SUPPORT.md)

## Recommended Next Steps
- Implement ASP.NET gateway endpoints and auth/session strategy
- Implement Python gRPC service with protobuf contracts
- Add SQL schema migrations and data retention policies
- Enable end-to-end push notifications with backend token store
