# Phase 0: Payload-First Security TDD

1. Data Invariants: 
   - A user profile cannot exist without a valid UID that matches the request.auth.uid.
   - Points must be >= 0.

2. The "Dirty Dozen" Payloads:
   - Missing required fields
   - Ghost fields (e.g., isAdmin)
   - Invalid UID (Spoofing)
   - Large avatar or displayName string
   - Editing createdAt
   - Modifying UID (Spoofing ownerId)
   - points < 0
   - Negative currentLevel
   - Non-timestamp updatedAt
   - Invalid document ID poisoning
   - Unauthenticated access
   - Read by unauthenticated users

3. Test verify.
