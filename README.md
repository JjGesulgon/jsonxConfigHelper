# JSONX Form Config Generator (UI Tool)

A developer tool that converts **API response payloads** into **Dash JSONX Form Config artifacts** used by the Dash Framework.

This UI tool automatically:

1. Infers a **JSON Schema** from an API response
2. Generates a **Dash-compatible `uiSchema`**
3. Generates the **complete JSONX config module**

The generator supports three generation strategies:

- **Rule-based** (deterministic engine)
- **AI-assisted** (LLM generated UI schema)
- **Hybrid** (rules + AI refinement)

---

# Architecture Overview

The tool converts API payloads into Dash JSONX form configuration using a layered pipeline.

## Visual Architecture Diagram

```
┌──────────────────────┐
│     API RESPONSE     │
│  (Backend Payload)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Payload Unwrapper  │
│  (extracts data obj) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Schema Inference    │
│  Engine              │
│  - detect types      │
│  - detect enums      │
│  - detect objects    │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────┐
│     Dash Field Dictionary   │
│  (central rule registry)    │
│                             │
│  contact_number → widget    │
│  email_address  → widget    │
│  state_province → select    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│      UI Schema Generator    │
│                             │
│  Resolution Order:          │
│  1. Field Dictionary        │
│  2. Pattern Rules           │
│  3. Schema Rules            │
│  4. Default Rules           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   Config Artifact Builder   │
│                             │
│  Generates:                 │
│  - schema                   │
│  - uiSchema                 │
│  - config                   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  TypeScript Module Output   │
│                             │
│ export const <name>Schema   │
│ export const <name>UiSchema │
│ export const <name>_config  │
└─────────────────────────────┘
```

The generated module always exports **three artifacts**:

```
export const <name>Schema
export const <name>UiSchema
export const <name>_config
```

These are the artifacts expected by th

---

# Example Workflow

### 1️⃣ Paste API Response

```json
{
  "billing_information": {
    "first_name": "John",
    "last_name": "Doe",
    "contact_number": "09171234567"
  }
}
```

### 2️⃣ Tool Infers Schema

```
billing_information
 ├ first_name
 ├ last_name
 └ contact_number
```

### 3️⃣ UI Schema Generation

The generator applies **Dash Field Dictionary rules**:

```
first_name → TextField
last_name → TextField
contact_number → CustomContactInputWidget
```

### 4️⃣ Generated JSONX Module

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

# Core Concept: Dash Field Dictionary

Instead of hardcoding UI rules across the generator, the system uses a **Dash Field Dictionary**.

This dictionary maps **field names or patterns** to their UI behavior.

Example:

```js
export const DASH_FIELD_DICTIONARY = {
  contact_number: {
    widget: "CustomContactInputWidget",
    placeholder: "XXX-XXX-XXXX"
  },

  email_address: {
    widget: "EmailInputWidget",
    placeholder: "Enter Email Address"
  },

  state_province: {
    widget: "SelectWidget",
    placeholder: "Select Region"
  }
}
```

Field resolution order:

```
1. Exact dictionary rule
2. Pattern rule
3. Schema rule
4. Default rule
```

This makes the generator **extensible without modifying core logic**.

---

# Generation Modes

## Rule-Based Mode

Uses the **Dash Field Dictionary + deterministic rules** to generate UI schema.

| Field Type | Generated Widget |
|------|------|
| enum | SelectWidget |
| contact_number | CustomContactInputWidget |
| string | TextField |

Example:

```
first_name → Enter First Name
state_province → Select Region
contact_number → CustomContactInputWidget
```

Benefits:

- deterministic
- fast
- no API dependency

---

## AI-Assisted Mode

Uses an **OpenAI-compatible API** to generate the `uiSchema`.

Supported providers:

- OpenAI
- Groq
- OpenRouter
- Ollama (local)
- Custom OpenAI-compatible endpoints

Expected AI response format:

```json
{
  "uiSchema": {},
  "notes": []
}
```

AI mode is useful for:

- improving layout
- suggesting widgets
- detecting patterns not covered by rules

---

## Hybrid Mode

Hybrid mode combines both approaches.

```
Rule Engine
     ↓
Generate Base UI Schema
     ↓
AI Review
     ↓
Refined UI Schema
```

Advantages:

- deterministic base structure
- AI improvements
- safer than full AI generation

---

# User Interface

The UI consists of four major sections.

## 1️⃣ Generation Mode

Select the generation strategy:

- Rule-based
- AI-assisted
- Hybrid

---

## 2️⃣ AI Settings

Configure AI provider and model.

Example models:

```
gpt-4.1-mini
gpt-4.1
gpt-4o-mini
llama-3.1-70b-versatile
llama3
```

Configuration fields:

```
Provider
Model
API Key
```

---

## 3️⃣ Input Panel

Paste your API response JSON.

Example:

```json
{
  "personal_information": {
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "email": "juan@email.com"
  }
}
```

If the API response contains a wrapper structure like:

```
status
message
data
```

The generator automatically extracts the **`data` object**.

---

## 4️⃣ Generated Output

The tool provides several output tabs.

| Tab | Description |
|----|----|
| JSONX Form Config | Generated Typescript module |
| UI Schema | Generated UI schema preview |
| Resolved Schema | Inferred JSON schema |
| Self Tests | Internal validation tests |

---

# Built-in Self Tests

The generator includes internal validation tests.

Example validations:

```
✓ Generates billing_information group
✓ Maps enum fields to SelectWidget
✓ Maps contact_number to CustomContactInputWidget
✓ Adds hidden submit_button
✓ Generates TypeScript exports
✓ Infers schema from API response
```

These tests ensure generator logic remains correct as rules evolve.

---

# Running the Tool

## Install dependencies

```
npm install
```

## Start development server

```
npm run dev
```

Open the application:

```
http://localhost:5173
```

---

# Export Generated Code

Click the **Export** button.

The tool downloads:

```
<exportName>.ts
```

Example output file:

```
billingInformation.ts
```

---

# Project Structure

```
src
 ├ components
 │   └ JsonxFormConfig
 │       └ JsonxFormConfigPage.jsx
 │
 ├ hooks
 │   └ useJsonxGenerator.js
 │
 ├ constants
 │   ├ samples.js
 │   ├ prompts.js
 │   ├ formProps.js
 │   └ fieldDictionary.js
 │
 ├ utils
 │   ├ naming.js
 │   ├ payload.js
 │   ├ schemaInference.js
 │   ├ uiSchemaGenerator.js
 │   └ codegen.js
 │
 ├ services
 │   └ aiClient.js
 │
 └ tests
     └ selfTests.js
```

---

# Future Roadmap

## CLI Generator

Generate configs directly from the terminal:

```
npx jsonx-config-gen api-response.json
```

Output:

```
schema
uiSchema
config
```

---

## VSCode Extension

Future version will allow developers to:

```
Right-click JSON response
→ Generate JSONX Form Config
```

---

## AI‑Assisted Dash Development

Future development pipeline:

```
API → Form Config → Dash Module
```

This enables **rapid form development across Dash applications**.

---

# Use Cases

This tool is designed for teams building applications using:

- Dash Framework
- JSONX Forms
- Schema-driven UI
- Mini‑app architecture

The generator reduces manual form configuration from **hours → seconds**.

---

# License

Internal development tool.
