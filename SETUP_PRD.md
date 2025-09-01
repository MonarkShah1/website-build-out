# Product Requirements Document: Initial Project Setup

**Project:** Canadian Metal Fabricators (CMF) Corporate Website

**Author:** Gemini AI

**Version:** 1.0

**Date:** October 26, 2023

---

## 1. Overview & Objective

The objective of this phase is to establish a robust and modern technical foundation for the Canadian Metal Fabricators website. This setup will prioritize performance, developer experience, and SEO readiness. The final deliverable will be a new, initialized project repository configured with Astro, TypeScript, Tailwind CSS, and React, ready for component and page development.

## 2. Core Technologies

-   **Framework:** Astro (latest version)
-   **UI Library (for Islands):** React (latest version)
-   **Styling:** Tailwind CSS (latest version)
-   **Language:** TypeScript (configured to "Strict" mode)
-   **Package Manager:** npm
-   **Version Control:** Git

## 3. Functional Requirements & Step-by-Step Implementation

### 3.1. Version Control Setup

-   **FR-1.1:** Create a new root directory for the project named `cmf-website`.
-   **FR-1.2:** Initialize a Git repository within the `cmf-website` directory.
-   **FR-1.3:** Create a `.gitignore` file at the root. This file must include standard Node.js and Astro-specific patterns, such as:
    ```
    # Dependencies
    node_modules/

    # Build artifacts
    dist/
    .astro/

    # Logs
    *.log

    # Environment variables
    .env
    .env.*
    !.env.example
    ```

### 3.2. Astro Project Initialization

-   **FR-2.1:** Use the official Astro command-line interface (CLI) to scaffold a new project within the repository root.
    -   Command: `npm create astro@latest .` (the `.` will initialize in the current directory).
-   **FR-2.2:** During the interactive setup, adhere to the following selections:
    -   **Template:** "An empty project"
    -   **Install Dependencies:** Yes
    -   **TypeScript:** Yes
    -   **TypeScript Strictness:** "Strict (recommended)"

### 3.3. Integration of Tailwind CSS

-   **FR-3.1:** Add the official Astro Tailwind CSS integration.
    -   Command: `npx astro add tailwind`
-   **FR-3.2:** Confirm all installation steps prompted by the CLI, including installing required dependencies and creating the `tailwind.config.mjs` and `postcss.config.mjs` files.
-   **FR-3.3:** The `astro.config.mjs` file should be automatically updated to include the Tailwind integration. No manual configuration should be needed.

### 3.4. Integration of React

-   **FR-4.1:** Add the official Astro React integration to enable interactive UI components (Islands).
    -   Command: `npx astro add react`
-   **FR-4.2:** Confirm all installation steps prompted by the CLI.
-   **FR-4.3:** The `astro.config.mjs` file should be automatically updated to include the React integration.

### 3.5. Initial Commit

-   **FR-5.1:** After all files have been generated and dependencies installed, stage all untracked files in Git.
-   **FR-5.2:** Create the initial commit with a descriptive message.
    -   Commit Message: `feat: initial project setup with Astro, TypeScript, Tailwind, and React`

## 4. Acceptance Criteria

To be considered complete, the following conditions must be met:

-   **AC-1:** The project must be fully contained within a Git repository with a single, initial commit containing all setup files.
-   **AC-2:** All dependencies must be successfully installed in `node_modules/` by running `npm install`.
-   **AC-3:** The project must start without errors when running the command `npm run dev`.
-   **AC-4:** The `astro.config.mjs` file must show both `@astrojs/tailwind` and `@astrojs/react` integrations in its configuration.
-   **AC-5:** A basic test page (`src/pages/index.astro`) should successfully apply a Tailwind CSS class (e.g., changing the background color) and render a simple React component (e.g., `Hello.tsx`) using a `client:*` directive.

---