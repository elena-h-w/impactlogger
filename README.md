# Impact Logger

AI-powered narrative system for structured impact tracking.

---

## Live Demo
🔗 [impactlogger.vercel.app](https://impactlogger.vercel.app)

---

## Overview

Impact Logger explores how structured performance logs can be transformed into clear, executive-ready narratives using LLM workflows.

The project began as a prototype built with Lovable, then evolved into a custom implementation using the Anthropic Claude API, GitHub, and Vercel for deployment.

The core question:  
Can structured inputs produce consistently high-quality professional narratives without excessive inference cost?

---

## Problem

Traditional impact tracking is fragmented and difficult to translate into performance-ready language.  

Professionals lose promotions and raises because they can't articulate their impact effectively.

Naïve single-pass LLM prompts often:
- Over-copy raw inputs
- Lack abstraction
- Produce generic output
- Increase inference cost without improving quality

---

## Approach

- Designed structured input fields to guide narrative abstraction
- Iterated from one-shot prompting to multi-step refinement logic
- Moved from Lovable prototype to custom Claude API integration
- Secured API key using Vercel serverless functions (prevents client-side exposure)
- Deployed via Vercel with environment-secured API keys

---

## Key Insights

- LLM output quality is highly dependent on input structure
- Multi-step abstraction improves narrative clarity
- Inference cost becomes a real product constraint at scale
- AI features require thoughtful system design, not just prompt engineering

---

## Architecture & Iteration

- Migrated from a Lovable-managed Supabase instance to a self-managed Supabase project for backend ownership.
- Implemented Row Level Security (RLS) to enforce per-user data isolation.
- Added database triggers to maintain `updated_at` integrity automatically.
- Separated client-safe Supabase keys from server-only Claude API credentials.
- Re-evaluated inference cost tradeoffs when scaling narrative generation.

---

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase (authentication & database)
- Anthropic Claude API
- Vercel (serverless functions & deployment)

---

## What I Would Improve Next

- Introduce caching layer to reduce repeated inference cost
- Explore smaller model variants for cost-performance balance
- Add structured tagging to improve narrative prioritization
- Experiment with streaming responses for UX improvement

---

## Why This Project Matters

This project deepened my understanding of:
- AI product architecture
- Model economics
- Workflow design
- The intersection of product, GTM, and technical implementation

It reflects my interest in AI-native product marketing and hands-on experimentation.
