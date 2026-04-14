# Autograph Exchange Implementation Spec

## Goal
Deliver a premium, low-friction Autograph Exchange experience that makes two workflows obvious and fast:

1. Sign requests waiting for me (inbox)
2. Review signed requests (archive)

The page should feel intentional, calm, and high-trust while remaining performant and testable.

## Scope
- Refactor UI composition in `app/autograph-exchange/page.tsx`
- Add dedicated styling system in `app/autograph-exchange/autograph-exchange.css`
- Add UI interaction tests in `app/autograph-exchange/page.test.tsx`

## Information Architecture
- Hero summary row
  - Kicker + title
  - Three quick stats:
    - Pending for me
    - Signed archive
    - My outgoing
- Two-lane primary workspace (`data-testid=autograph-lanes`)
  - Left lane: Requests for You (pending inbox)
  - Right lane: Signed Archive
- Secondary section
  - Outgoing requests summary cards

## Core Interactions
### Inbox lane
- Each pending request renders as `pending-request-card`
- Card shows role pair, requested time, message, and status pill
- User can expand inline sign editor (`sign-editor`) with a dedicated toggle
- Editor includes:
  - Signature textarea
  - Character count
  - Confirm button
- On successful sign:
  - Card updates to signed state
  - Recently signed item receives temporary highlight style

### Archive lane
- Each signed item renders as `signed-request-card`
- Controls:
  - Free-text filter (requester, recipient, request text, signature)
  - Sort select (`Newest signed`, `Oldest signed`, `Newest requested`)
- Recently signed entry gets highlight ring/glow when moved into archive

### Outbox section
- Compact cards with request and state
- Signed items show signature excerpt; pending items show waiting state

## Visual System
- File: `app/autograph-exchange/autograph-exchange.css`
- Tokenized variables scoped in `.autograph-shell`
  - Separate lane backgrounds for pending and archive
  - Layered shadows (`soft`, `strong`)
  - Card, border, text, status token palette
- Motion
  - Subtle hover elevation on cards
  - Signed highlight emphasis without aggressive animation
- Responsive behavior
  - Two lanes collapse to one column on tablet/mobile
  - Hero stats collapse from 3 columns to 1 on narrow screens

## Accessibility and Semantics
- Preserve form labels for inputs/selects/textarea
- Keep button labels action-specific (`Sign`, `Hide`, `Confirm signature`)
- Use text contrast compatible with existing theme tokens
- Maintain keyboard-focus affordances on custom controls

## Performance Constraints
- Avoid extra API calls; use existing hook lifecycle
- Keep interactions local state driven
- Keep sort/filter logic computed from in-memory arrays
- CSS only; no runtime animation library

## Test Plan
Create `app/autograph-exchange/page.test.tsx` with mocked hook + auth session:

1. Renders two-lane workspace and summary header text
2. Inbox card allows opening sign editor and exposes textarea/confirm action
3. Archive filter narrows visible signed cards
4. Archive sort toggles ordering semantics without crashing
5. Outbox section renders signed/pending states consistently

## Acceptance Criteria
- Page visually presents hero + two-lane layout + outbox
- Pending requests are signable inline and transition to signed archive correctly
- Archive supports filter and sort controls
- Dedicated CSS file exists and is imported by page
- New UI tests pass with existing test runner
- Lint passes for touched files
