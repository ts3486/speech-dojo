# Research: Upgrade Next.js + TanStack

**Feature**: specs/003-nextjs-tanstack-upgrade  
**Date**: 2026-01-17  
**Goal**: Resolve upgrade unknowns and pick defaults for the Next.js + TanStack Query upgrade while preserving behavior and performance.

## Decisions

### Next.js version target
- **Decision**: Upgrade to latest stable Next.js (v15.x at time of writing) with the App Router; keep routing structure identical to pre-upgrade pages.  
- **Rationale**: Latest stable brings security/perf fixes; avoids beta/RC risk.  
- **Alternatives considered**: Staying on current version (avoids change but blocks dependency security fixes); jumping to canary (too risky).

### React & TypeScript baselines
- **Decision**: React 18 stable with concurrent-safe patterns; TypeScript 5.x aligned with Next’s defaults.  
- **Rationale**: Matches Next support matrix; reduces type friction.  
- **Alternatives considered**: React 19 RC (not stable); TS 4.x (unsupported).

### TanStack Query
- **Decision**: TanStack Query v5 latest; keep existing cache keys/policies and update APIs to v5 signatures.  
- **Rationale**: Current stable; avoids deprecations and aligns with docs.  
- **Alternatives considered**: Pinning older v4 (delays security/bug fixes).

### Styling/build pipeline
- **Decision**: Keep Tailwind/PostCSS pipeline; update PostCSS config per Tailwind 4 guidance if needed; rely on Next build for CSS bundling.  
- **Rationale**: Minimizes styling drift while staying compatible.  
- **Alternatives considered**: Replacing Tailwind (out of scope).

### Testing approach
- **Decision**: Continue Vitest + Testing Library for component/integration coverage; add build/dev smoke checks post-upgrade.  
- **Rationale**: Current repo uses Vitest; fastest path to parity.  
- **Alternatives considered**: Jest migration (unnecessary churn).

### Performance guardrail
- **Decision**: Treat >10% regression in build time or bundle size as a blocker; capture pre/post numbers.  
- **Rationale**: Matches spec success criteria.  
- **Alternatives considered**: Allow larger regression (conflicts with spec).

### Environment and secrets
- **Decision**: Preserve env variable handling; ensure no secrets move client-side; keep server-minted tokens model.  
- **Rationale**: Constitution P1 and existing architecture.  
- **Alternatives considered**: None acceptable.

## Resolved Unknowns
- Target versions and testing stack clarified; no outstanding NEEDS CLARIFICATION items.
