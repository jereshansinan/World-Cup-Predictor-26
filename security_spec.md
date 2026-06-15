# Firebase Firestore Security Specification

This document outlines the security invariants, vulnerability testing scenarios (the "Dirty Dozen"), and validation rules for our World Cup Predictor application.

## 1. Data Invariants
1. **User Identity Invariant**: A user profile document (`/users/{userId}`) can only be initially created by the authenticated owner (`request.auth.uid == userId`).
2. **Prediction Ownership**: Users can only create, update, or delete predictions associated with their own `userId` (`request.resource.data.userId == request.auth.uid`).
3. **Data Integrity**: Scores, points, and prediction values must be typed correctly (integers or null) and respect boundary limits (e.g., scores cannot be negative).
4. **Lock Constraints**: Locked matches cannot accept updates or new predictions from clients after 24 hours prior kickoff. (In client operations).

## 2. The "Dirty Dozen" (Vulnerability Payloads)

| Target Collection | Operation | Malicious Payload | Expected Result | Reason |
| :--- | :--- | :--- | :--- | :--- |
| `/users/user_abc` | `create` | `{ "id": "user_xyz", "name": "Hack", ... }` | `PERMISSION_DENIED` | Id spoofing (creating a user for someone else) |
| `/users/user_abc` | `update` | `{ "name": "Hack", "totalPoints": "infinite" }` | `PERMISSION_DENIED` | Invalid type for points |
| `/predictions/pred_1` | `create` | `{ "userId": "attacker_id", "matchId": "m1", ... }` | `PERMISSION_DENIED` | Creating predictions for other users |
| `/predictions/pred_1` | `update` | `{ "userId": "user_abc", "pointsEarned": 9999 }` | `PERMISSION_DENIED` | Elevating their own scores arbitrarily |
| `/matches/match_1` | `create` | `{ "homeTeam": false, "awayTeam": 123 }` | `PERMISSION_DENIED` | Invalid Types for national teams |
| `/users/user_abc` | `update` | `{ "supportedTeams": ["Spain", "Brazil", "Argentina", "France"] }` | `PERMISSION_DENIED` | More than 3 supported teams |
| `/predictions/pred_1` | `update`| `{ "homeScorePredicted": -1, "awayScorePredicted": 2 }` | `PERMISSION_DENIED` | Negative scores |
| `/users/user_abc` | `create` | `{ "id": "user_abc", "name": "A" * 200, ... }` | `PERMISSION_DENIED` | Excessive name string size |
| `/predictions/pred_1` | `delete` | Document owned by user_def, deleted by user_abc | `PERMISSION_DENIED` | Deleting other's prediction |
| `/matches/match_1` | `update` | `{ "status": "hack" }` | `PERMISSION_DENIED` | Status must be upcoming or finished |
| `/users/user_abc` | `create` | `{ "id": "user_abc", "name": "A", "extra_field": "ghost" }` | `PERMISSION_DENIED` | Shadow/Ghost fields |
| `/*` | `read` | Anonymous / Unsigned read | `PERMISSION_DENIED` | Standard read operations require auth |

## 3. Test Verification
The above rules are strictly implemented and verified inside `firestore.rules` and compiled via ESLint configuration.
