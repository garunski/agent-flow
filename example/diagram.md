``` mermaid
flowchart TD
    %% Step 1
    A1[Analyzer Agent<br>Predicts impacted code areas] -->|Suggests| T1[Code Analysis Tool<br>Scans repo]
    T1 --> F1[Analysis Map Stored]

    %% Step 2
    A2[Documenter Agent<br>Predicts docs needed] -->|Suggests| T2[Web Search / Doc Retrieval Tool]
    T2 --> F2[Curated Documentation Stored]

    %% Step 3
    A3[Strategist Agent<br>Predicts integration plan] -->|Suggests| T3[New/Update File Tools]
    T3 --> F3[Integration Plan Created]

    %% Step 4
    A4[Schema Designer Agent<br>Predicts DB changes] -->|Suggests| T4[DB Migration & Logging Tools]
    T4 --> F4[DB Schema Updated]

    %% Step 5
    A5[Implementer Agent<br>Predicts code updates] -->|Suggests| T5[Edit/New/Run Tools]
    T5 --> F5[Code Updated, Partial Tests]

    %% Step 6
    A6[Checker Agent<br>Predicts validation steps] -->|Suggests| T6[Test Runner & Security Tools]
    T6 --> F6[Detected Gaps]

    %% Feedback Loop
    F6 --> A7[Strategist Agent<br>Revises plan] -->|Suggests| T7[Edit/New File Tools]
    T7 --> F7[Updated Plan Passed to Implementer]

    %% Step 8
    A8[Implementer Agent<br>Updates code/tests per plan] -->|Suggests| T8[Edit/New/Run Tools]
    T8 --> F8[Code & Tests Updated]

    %% Step 9
    A9[Strategist Agent<br>Updates docs & instructions] -->|Suggests| T9[Web Search / Edit Tools]
    T9 --> F9[Docs Enriched]

    %% Step 10
    A10[Analyzer & Documenter Agents<br>Full repo re-analysis] -->|Suggests| T10[Code Analysis & Doc Tools]
    T10 --> F10[Corrected Analysis & Docs]

    %% Step 11
    A11[Implementer Agent<br>Final implementation] -->|Suggests| T11[Edit/New/Run Tools]
    T11 --> F11[Fully Functional OAuth2 Module]

    %% Step 12
    A12[Checker & Verifier Agents<br>Final verification] -->|Suggests| T12[Test, Security, Audit Tools]
    T12 --> F12[Deployable OAuth2 Module]

    %% Iterative loops
    F5 --> A6
    F8 --> A9
```