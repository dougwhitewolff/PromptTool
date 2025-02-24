// apps/web/app/prompt-tool/assets/defaultAnalysisFramework.ts

export const defaultAnalysisFramework = `
I. Problem Understanding
Follow a step-by-step approach to clarify the problem:

1. Core Requirements
   - What specific functionality or feature is needed?
   - What are the key constraints or limitations?
   - What are the expected inputs and outputs?
   (Reason through each requirement individually and justify their inclusion in the solution.)

2. Technical Context
   - Which existing systems/components are involved?
   - What frameworks/libraries are relevant?
   - What architectural patterns should be considered?
   (Analyze the technical context systematically, ensuring no relevant dependencies are overlooked.)

---

II. Solution Design
Use step-by-step reasoning to develop and evaluate potential solutions:

1. Architecture Considerations
   - Component structure
   - Data flow
   - Integration points
   (Consider each aspect sequentially, explaining dependencies and trade-offs.)

2. Implementation Approaches
   - List 2-3 potential approaches.
   (For each, reason through feasibility, complexity, maintainability, performance implications, and testing strategy.)

3. Selected Approach
   - Justify the chosen solution.
   - Address potential challenges.
   - Outline mitigation strategies.
   (Articulate why this solution is optimal, using a structured rationale.)

---

III. Implementation Plan
Develop a clear, ordered plan, using a chain-of-thought methodology:

1. Component Breakdown
   - List all required components/files.
   - Define interfaces and dependencies.
   - Specify any new types/interfaces needed.

2. Testing Strategy
   - Unit test approach
   - Integration test requirements
   - Edge cases to consider
   (Explain how each testing method validates specific aspects of the solution.)

3. Implementation Steps
   - Ordered list of development tasks.
   - Critical considerations for each step.
   - Validation checkpoints.
   (Provide a rationale for the sequence and critical dependencies between tasks.)

---

IV. Code Implementation
Ensure code is developed sequentially and includes:

1. Complete code for all components, including file paths.
2. Comprehensive comments for each section, explaining their purpose and logic.
3. Adherence to project style guidelines.

---

V. Review & Validation
Adopt a step-by-step process to review and validate the solution:

1. Code Review Checklist
   - Performance considerations.
   - Security implications.
   - Accessibility requirements.
   - Best practices compliance.

2. Testing Confirmation
   - Verify test coverage.
   - Confirm edge cases.
   - Validate error handling.

3. Next Steps
   - Additional improvements.
   - Future considerations.
   - Documentation needs.
   (Explain each improvement or consideration logically, based on identified gaps or limitations.)

Your output must follow the structure of the Analysis Framework, explicitly reasoning through each step and including intermediate conclusions and justifications for all decisions made.
`;
