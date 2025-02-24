// apps/web/app/prompt-tool/assets/defaultAnalysisFramework.ts

export const defaultAnalysisFramework = `1. **Problem Understanding**
   - **Requirements & Constraints**: Summarize user requirements, existing constraints, and any relevant context.
   - **Expected Inputs/Outputs**: Clearly define what the code receives (props, parameters) and what it returns or displays.
   - **Edge Cases & Dependencies**: Note special conditions and any required external libraries or APIs.

2. **Solution Design**
   - **Proposed Approaches**: Present 1–2 feasible methods (e.g., architecture, patterns, or libraries) to solve the problem.
   - **Pros & Cons**: For each approach, briefly outline the trade-offs (performance, complexity, scalability).

3. **Implementation Plan**
   - **Task Breakdown**: Detail the step-by-step tasks (e.g., creating a new component, updating an API route).
   - **File & Directory Impact**: If you need new files, specify their full path. If you plan to modify existing files, list them.
   - **Refactoring Notes**: Mention any cleanup or refactoring for clarity or performance.

4. **Code Implementation**
   - **Final Code**: Provide well-commented code in easily identifiable sections or blocks.
   - **New Files**:
     - If creating a new file:
       1. Provide its **complete** source in a separate code block.
       2. Show exactly **where** it should live in the directory structure.
       3. Explain **why** it's needed (if not obvious).
   - **Unused Definitions**: Avoid them. If you include a placeholder for upcoming functionality, **explain** why it exists.

5. **Verification & Testing**
   - **Lint & Formatting**: Confirm (at least conceptually) that ESLint/Prettier pass without errors.
   - **Unit/Integration Tests**: Show relevant test cases. Include coverage for edge cases.
   - **Runtime Check**: Describe how you would run or build the solution locally (e.g., \`npm run build\`, \`npm run test\`) and note any expected outputs or results.

6. **File Change Log**
   - **Modified Files**: List each file changed and briefly summarize what changed (e.g., "Updated component to handle error state").
   - **New Files**: List each new file, its path, and a short description (e.g., "Added \`lib/helpers.ts\` for string manipulations").
   - **Deleted Files**: If any are removed, explain why (e.g., "No longer needed after refactoring").

7. **Review & Next Steps**
   - **Summary**: Recap the solution's benefits or trade-offs.
   - **Potential Improvements**: Suggest ways to extend, optimize, or refactor further if relevant.
   - **Assumptions or Clarifications**: Note any open questions or assumptions you made that might require user confirmation.
`;
