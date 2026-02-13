# Impact Logger

AI-powered narrative system for structured impact tracking.

🔗 Live Demo: https://impactlogger.vercel.app

---

## Overview

Impact Logger explores how AI can help professionals articulate their impact more clearly — particularly in performance reviews, promotion cases, and role transitions.

The project began as a fast prototype built via Lovable to test whether structured inputs could meaningfully improve LLM output quality. After validating the idea, I rebuilt the core workflow using Claude API, Supabase, and Vercel to better understand how AI systems behave under real-world constraints.

The core question:

Can structured workflow design make AI outputs more valuable — not just more fluent?

---

## The Problem

Many professionals struggle to translate weekly work into compelling, executive-ready narratives.

Even with AI tools, outputs often:
- Sound generic
- Repeat inputs without abstraction
- Lack strategic framing
- Increase token usage without improving clarity

This suggested that the bottleneck wasn’t model capability — it was system design and input structure.

---

## What I Built

Impact Logger allows users to:

- Log weekly impact in structured fields
- Store entries securely with per-user data isolation
- Generate tailored narratives (performance review, promotion, or role change)
- Experiment with tone and positioning

The narrative generation runs server-side through Claude API to maintain key security and allow tighter control over inference behavior.

---

## What I Learned

- AI output quality improves significantly when inputs are structured intentionally.
- Prompt engineering alone is insufficient — workflow design matters.
- Cost and latency become real product constraints once prototypes move into production.
- Responsible AI products require backend ownership, not just frontend experimentation.

---

## Why This Project Matters

Impact Logger reflects my interest in bridging AI systems with real business workflows.

As a marketing leader, I don’t just want to talk about AI adoption — I want to understand how AI products behave under constraints: cost, security, usability, and measurable value.

This project represents that hands-on exploration.