# SolveSphere AI Security Specification

## Data Invariants
1. A Solution must belong to an existing User.
2. A ChatMessage must be part of a user's own history.
3. Users cannot modify their own XP or badges directly; these should ideally be system-controlled, but for this MVP we'll allow updates with validation.

## The Dirty Dozen (Attack Scenarios)
1. Someone tries to read all solutions (`solutions` collection) without owning them.
2. Someone tries to modify another user's XP.
3. Someone tries to inject a massive string (1MB) into a query field.
4. Someone tries to delete a solution they don't own.
5. Someone tries to create a message in another user's subcollection.
6. Someone tries to change the `createdAt` of a solution after it's created.
7. Someone tries to update a solution with a non-matching `userId`.
8. Someone tries to inject an invalid `queryType`.
9. Someone tries to set an admin flag (if we had one, though not requested).
10. Someone tries to read private user data like email (if stored).
11. Someone tries to spoof the system as a "Tutor" role in a write.
12. Someone tries to use an invalid document ID (too long or junk characters).
