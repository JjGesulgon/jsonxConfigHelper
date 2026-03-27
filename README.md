# JSONX Form Config Generator

### AI-Assisted Form Development Platform for Dash

---

## Executive Summary

The JSONX Form Config Generator is a platform that converts backend API responses into production-ready Dash JSONX form configurations in seconds.

It eliminates manual form development and enables:

* Faster delivery cycles
* Standardized UI across applications
* Scalable AI-assisted development

---

## Problem Statement

Form development today is:

* Repetitive and manual
* Time-consuming (hours per module)
* Inconsistent across teams

This results in:

* Slower delivery
* Increased QA effort
* Higher maintenance cost

---

## Solution

This tool automates the full pipeline:

```
API Response → Schema → UI Config → Ready-to-use Form
```

---

## Business Impact

### Speed

* Reduce development time from **hours → seconds**

### Consistency

* Enforces standardized UI patterns

### Scalability

* Faster onboarding for new developers

### AI Enablement

* Foundation for AI-assisted development

---

## AI Strategy Alignment

This tool follows a **controlled AI adoption model**:

* Deterministic core (rule engine)
* AI as enhancement layer (not replacement)
* Hybrid approach for production safety

```
Rule Engine → AI Review → Final Output
```

---

## High-Level Architecture

```
API → Schema Inference → Rule Engine → AI Layer → Config Output
```

### Key Principles

* Schema-driven system
* Centralized rule registry (Field Dictionary)
* Optional AI layer (non-blocking)
* Deterministic-first design

---

## Limitations

* Cannot infer business rules not present in API
* Requires structured API responses
* AI output may require validation

---

# Developer Guide

---

## Quick Start

```bash
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

Steps:

1. Paste API response
2. Select generation mode
3. Click Generate
4. Export config

---

## What It Generates

From a single API response:

* JSON Schema
* uiSchema
* JSONX Config Module

---

## Example Workflow

### Input

```json
{
  "billing_information": {
    "first_name": "John",
    "last_name": "Doe",
    "contact_number": "09171234567",
    "address_type": {
      "value": "home",
      "options": [
        { "label": "Home", "value": "home" },
        { "label": "Office", "value": "office" }
      ],
      "ui_type": "radio"
    }
  }
}
```

---

### Output

```ts
export const billingInformationSchema = { ... }
export const billingInformationUiSchema = { ... }

export const billing_information_config = {
  module: "billing_information",
  main_header: "Billing Information",
  schema: billingInformationSchema,
  uiSchema: billingInformationUiSchema
}
```

---

## Generation Modes

| Mode        | Description   | When to Use             |
| ----------- | ------------- | ----------------------- |
| Rule-Based  | Deterministic | Fast + predictable      |
| AI-Assisted | LLM-generated | Complex UI improvements |
| Hybrid      | Rule + AI     | Recommended           |

---

## Internal Flow

1. Extract `data` from API response
2. Infer JSON Schema recursively
3. Resolve field mappings via dictionary
4. Apply rules (pattern + schema)
5. Generate uiSchema
6. Build config module

---

## Core Concept: Field Dictionary

Central rule registry:

```js
contact_number: {
  widget: "CustomContactInputWidget",
  placeholder: "XXX-XXX-XXXX"
}
```

### Resolution Order

```
1. Exact match
2. Pattern match
3. Schema rules
4. Default fallback
```

---

## 🔌 Extending the Generator

To support new fields:

1. Update:

```
src/constants/fieldDictionary.js
```

2. Add mapping rules if needed
3. Run self tests

No core logic changes required

---

## Self Tests

Ensures:

* Schema correctness
* UI mapping accuracy
* Config integrity

Location:

```
src/tests/selfTests.js
```

---

## User Interface

### 1. Generation Mode

* Rule-based
* AI-assisted
* Hybrid

### 2. AI Settings

* Provider
* Model
* API Key

### 3. Input Panel

* Paste API response
* Automatically extracts `data` wrapper

### 4. Generated Output

| Tab             | Description                 |
| --------------- | --------------------------- |
| JSONX Config    | Generated TypeScript module |
| UI Schema       | Generated UI schema         |
| Resolved Schema | Inferred schema             |
| Self Tests      | Validation results          |

---

## Running the Tool

```bash
npm install
npm run dev
```

---

## Project Structure

```
src
 ├ components
 ├ hooks
 ├ constants
 ├ utils
 ├ services
 └ tests
```

---

## Roadmap

### Phase 1 (Current)

* UI Tool
* Rule + Hybrid generation

### Phase 2

* CLI generator

```
npx jsonx-config-gen api-response.json
```

### Phase 3

* VSCode Extension

### Phase 4

* Full AI-assisted Dash pipeline

```
API → Config → Module → Feature
```

---

## Strategic Positioning

This is not just a tool.

It is a **foundation layer for AI-assisted frontend development**.

It enables:

* Faster delivery
* Lower engineering cost
* Scalable UI architecture
* Controlled AI adoption

---

## License

Internal development tool.
