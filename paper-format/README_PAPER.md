<link rel="stylesheet" href="./paper.css">

<div class="ieee-page">

<!-- ================= JUDUL UTAMA ================= -->
<div class="ieee-title">Timekeeper: A High-Fidelity Reactive Timeline Management and Event Tracking Dashboard Built on Nuxt 4 and Pinia</div>
<div class="ieee-subtitle">*An elegant fusion of retro handwritten notebook ergonomics and robust modern web engineering</div>

<!-- ================= BLOK PENULIS (SINGLE AUTHOR CENTERED) ================= -->
<div class="ieee-authors-grid" style="display: block; text-align: center;">
  <div class="ieee-author">
    <div class="ieee-author-name" style="font-size: 12pt;"><b>Atio Haidar</b></div>
    <div class="ieee-author-aff">
      Lead Software Engineer & Creator<br>
      Timekeeper Project Workspace<br>
      [City, Country]<br>
      [Author Email]
    </div>
  </div>
</div>

<!-- ================= AREA KOLOM GANDA (DIMULAI LANGSUNG DI BAWAH PENULIS) ================= -->
<div class="ieee-columns">

<!-- ================= KOTAK ABSTRAK ================= -->
<div class="ieee-abstract-section">
    <span class="ieee-abstract-title"><i>Abstract</i>—</span><span class="ieee-abstract-text">This paper introduces <b>Timekeeper</b>, a reactive, high-performance personal productivity and timeline coordination dashboard engineered to resolve scheduling drift and tracking overhead in dynamic event rundown management. Developed on the robust framework of <b>Nuxt 4 (Vue 3)</b> and managed via a highly structured <b>Pinia</b> global store, Timekeeper features real-time cumulative timeline auto-recalculations, a high-fidelity clock simulation engine, complete undo/redo snapshot capabilities, and extensive CSV-based data portability. The visual architecture incorporates a premium retro handwritten "notebook-paper" aesthetic that delivers excellent user engagement without compromising professional ergonomics. System reliability is guaranteed via a comprehensive automated testing pipeline consisting of unit and integration tests powered by <b>Vitest</b> and <b>Vue Test Utils</b>, alongside End-to-End (E2E) browser automation managed via <b>Playwright</b>.</span>
    <br><br>
    <span class="ieee-keywords-title"><i>Index Terms</i>—</span><span class="ieee-keywords-text">Nuxt 4, Vue 3, Pinia State Management, Time Tracking, Notebook-Paper Aesthetic, E2E Testing, Playwright, Vitest.</span>
</div>

<h2 id="introduction">I. Introduction</h2>

<p>In event coordination, project execution, and personal schedule tracking, maintaining time synchronization is a critical challenge. Conventional rundown sheets—typically constructed using static formats such as physical papers or basic spreadsheets (e.g., Microsoft Excel or CSVs)—lack the ability to adjust dynamically. When a specific agenda item runs over its allocated time, subsequent items must be recalculate manually by the event coordinator, leading to human error and coordination failures.</p>

<p>To address this issue, we present <b>Timekeeper</b>, an advanced web application designed to bridge the gap between static timeline planning and dynamic live execution. Built using modern web technologies, Timekeeper calculates schedule changes dynamically, updates estimated completion times instantly, tracks ongoing agendas using reactive timers, and logs historical modifications in real time, all while maintaining an engaging visual experience.</p>

<h2 id="architecture">II. Technological Foundations & Folder Architecture</h2>

<p>The system is engineered on Vue 3 and the brand-new <b>Nuxt 4</b> directory and routing architecture, providing unmatched performance, developer experience, and scalability. The repository maintains a highly decoupled structure located in the <code>app/</code> folder, separating logic, components, layouts, and data layers cleanly as summarized below:</p>

<ul>
  <li><code>app/pages/</code>: Contains the main application routes. Timekeeper uses automatic routing via <code>index.vue</code>, serving as the central responsive dashboard.</li>
  <li><code>app/components/</code>: Holds highly modular UI elements, segregated into generic components (like <code>Button.vue</code> and <code>Card.vue</code>) and event-specific units inside the <code>timekeeper/</code> folder (e.g., <code>TimelineView.vue</code>, <code>AgendaTimer.vue</code>).</li>
  <li><code>app/composables/</code>: Houses shared reactives like <code>useTimer.ts</code> and <code>useToast.ts</code>, enabling auto-imported reusable utility methods.</li>
  <li><code>app/stores/</code>: Represents the primary data engine. The global Pinia store is defined in <code>timekeeper.ts</code>, which acts as the application's source of truth.</li>
</ul>

<p>For deployment flexibility, the application is configured as a client-side Single-Page Application (SPA) by setting <code>ssr: false</code> in <code>nuxt.config.ts</code>. This allows seamless serverless hosting on platforms like GitHub Pages while still maintaining complete routing reliability.</p>

<h2 id="core-features">III. Core System Features & Algorithms</h2>

<h3>A. Cumulative Timeline Auto-Recalculation</h3>
<p>The defining algorithm of Timekeeper is the automatic calculation of cumulative event times. Rather than treating agenda items as isolated entities, the system models them as a chain of dependencies. When a user creates or modifies an agenda's planned duration, the <code>recalculateStartTimes()</code> function propagates this change downstream:</p>

<table style="width: 100%; border: none; margin: 6px 0; border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 10pt;">
    <tr>
        <td style="text-align: center; width: 90%; border: none; padding: 0; font-style: italic;">PlannedStartTime<sub>j</sub> = PlannedStartTime<sub>j-1</sub> + PlannedDuration<sub>j-1</sub></td>
        <td style="text-align: right; width: 10%; border: none; padding: 0;">(1)</td>
    </tr>
</table>

<p class="no-indent">If an agenda's status is changed (e.g., started or completed), the estimated start times of all upcoming items are recomputed dynamically based on actual elapsed times using the formula (1). This ensures that the event director has an accurate, real-time estimate of the event's overall delay or advance status.</p>

<h3>B. State Snapshot and Persistence System</h3>
<p>To prevent data loss due to unexpected browser reloads and to enable a seamless editing workflow, Timekeeper incorporates a robust two-way persistence strategy:</p>

<ol>
  <li><i>Active LocalStorage Synchronization</i>: The system uses Vue watchers to monitor changes to the agendas state and automatically saves updates to client-side storage.</li>
  <li><i>Transaction Snapshot Stacking</i>: For complex event operations, the Pinia store manages a 50-deep transaction stack (<code>undoStack</code> and <code>redoStack</code>). Prior to any state-mutating action (e.g., importing data, shifting agendas, or starting timers), a JSON-serialized snapshot is pushed onto the stack, allowing instant, multi-level Undo/Redo commands without complex database rollback logic.</li>
</ol>

<h3>C. Time Simulation and Detachment Engine</h3>
<p>Event planning requires testing. Therefore, Timekeeper features a comprehensive clock simulation engine. Users can toggle simulated mode (<code>isSimulated = true</code>), allowing them to detach the interface from the system clock and set a customized simulation time (<code>setSimulationTime()</code>) or pause the clock (<code>togglePause()</code>) to test various rundown scenarios safely before the real event begins.</p>

<h3>D. Data Portability</h3>
<p>Timekeeper supports direct Excel and Google Sheets CSV integration. Users can export editable rundowns in a standardized 7-column CSV layout, or download a comprehensive post-event CSV report outlining planned versus actual starting times, real durations, and event logs.</p>

<h2 id="ux-improvements">IV. User Experience (UX) & Aesthetic System</h2>

<h3>A. Visual Design and Notebook Aesthetic</h3>
<p>The application breaks away from standard, sterile productivity dashboards by implementing a premium, high-visual-delight <b>notebook-paper aesthetic</b>. Driven by the <code>notebook.css</code> style layer, the interface mimics a physical paper rundown with red vertical margin rules, subtle blue horizontal lines, and handwritten typographies using Google Fonts: <i>Caveat</i>, <i>Patrick Hand</i>, and <i>Courier Prime</i>, creating a gorgeous and responsive tactile feel.</p>

<h3>B. Advanced UX Ergonomics</h3>
<p>To support high-stress live event environments, several advanced UX patterns have been integrated:</p>

<ul>
  <li><b>Toast Notifications</b>: Real-time, color-coded floating toasts (Success, Error, Info, Warning) with smooth slide-in and stacking animations for instant action feedback.</li>
  <li><b>Loading Skeletons</b>: Dynamic animated pulse components (<code>LoadingSkeleton.vue</code>) with variable shapes to represent agenda lists, detail panels, or status cards, reducing perceived latency during initialization.</li>
  <li><b>Destructive Action Modals</b>: Backdrop-blurred, smooth-scale confirmation overlays (<code>ConfirmationModal.vue</code>) for critical tasks, such as cancelling running items or deleting agenda blocks.</li>
  <li><b>Time Jump Navigation</b>: A specialized navbar (<code>TimeJumpNav.vue</code>) enabling quick keyboard navigation using hotkeys (Table I).</li>
  <li><b>Notion-Style Inline Edit</b>: Real-time, click-to-edit inputs (<code>InlineEdit.vue</code>) with built-in validation rules and save-on-blur.</li>
</ul>

<div class="ieee-table-container">
    <div class="ieee-table-title">Table I<br>Keyboard Shortcuts & Navigation Hotkeys</div>
    <table class="ieee-table">
        <thead>
            <tr>
                <th style="text-align: left;">Key Combination</th>
                <th>Target Component / Action</th>
                <th>Operation Mode</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: left;"><code>Ctrl/Cmd + ↑</code></td>
                <td>Time Jump Navigation</td>
                <td>Select Previous Agenda</td>
            </tr>
            <tr>
                <td style="text-align: left;"><code>Ctrl/Cmd + ↓</code></td>
                <td>Time Jump Navigation</td>
                <td>Select Next Agenda</td>
            </tr>
            <tr>
                <td style="text-align: left;"><code>Ctrl/Cmd + Home</code></td>
                <td>Time Jump Navigation</td>
                <td>Jump to Running Agenda</td>
            </tr>
            <tr>
                <td style="text-align: left;"><code>Escape</code></td>
                <td>Modals & Inputs</td>
                <td>Close Modal / Cancel Edit</td>
            </tr>
            <tr class="last-row">
                <td style="text-align: left;"><code>Enter</code></td>
                <td>Inline Edit Component</td>
                <td>Confirm & Auto-Save</td>
            </tr>
        </tbody>
    </table>
</div>

<h2 id="testing">V. Quality Assurance & Test Infrastructure</h2>

<p>To ensure high reliability under intensive live workloads, Timekeeper incorporates a multi-tiered test infrastructure combining <b>Unit, Integration, and End-to-End (E2E) testing</b>.</p>

<div class="ieee-figure-container">
    <div class="ieee-figure-placeholder">Virtual Headless Chrome - Playwright Test Runner</div>
    <div class="ieee-figure-caption"><i>Fig. 1.</i> Visual representation of Playwright's headless browser test orchestration, validating real-time DOM reactivity and keyboard navigation bindings during active rundown changes.</div>
</div>

<h3>A. Unit & Integration Testing</h3>
<p>Unit tests isolate business logic, focusing on reactivity. Composable timers (<code>useTimer.test.ts</code>) are validated for accurate millisecond increments, pauses, and resets. For integration tests, Vue Test Utils and JSDOM are utilized to check components such as <code>StatusCard.test.ts</code> and component-store interactions in <code>index.integration.test.ts</code>, validating that clicking buttons modifies stores and updates UI states correctly.</p>

<h3>B. End-to-End (E2E) Testing</h3>
<p>Playwright manages the E2E suite, simulating user interactions inside real web browsers (Fig. 1). It tests critical user journeys, including: initial page render, starting/pausing rundown items, deleting agendas, and verifying route transfers. The test execution statistics are illustrated in Table II.</p>

<div class="ieee-table-container">
    <div class="ieee-table-title">Table II<br>Test Suite Execution & Coverage Report</div>
    <table class="ieee-table">
        <thead>
            <tr>
                <th style="text-align: left;">Test Tier</th>
                <th>Files Under Test</th>
                <th>Passed Test Cases</th>
                <th>Execution Environment</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: left;">Unit Testing</td>
                <td>[Number of Files]</td>
                <td>[Passed Cases]</td>
                <td>Vitest + Setup Script</td>
            </tr>
            <tr>
                <td style="text-align: left;">Integration Testing</td>
                <td>[Number of Files]</td>
                <td>[Passed Cases]</td>
                <td>Vitest + JSDOM + VTU</td>
            </tr>
            <tr class="last-row">
                <td style="text-align: left;">E2E Testing</td>
                <td>[Number of Files]</td>
                <td>[Passed Cases]</td>
                <td>Playwright (Chromium)</td>
            </tr>
        </tbody>
    </table>
</div>

<h2 id="conclusion">VI. Conclusion & Future Enhancements</h2>

<p>Timekeeper succeeds in proving that robust event rundown management can be both reactive and visually stunning. By utilizing Nuxt 4's modern architecture, Pinia's snapshot state engine, and an elegant paper-notebook visual theme, the application minimizes user friction, prevents scheduling math errors, and provides high reliability verified through its rigorous automated testing pipeline.</p>

<p>Future work includes implementing interactive drag-and-drop timeline manipulation, live WebSockets-based synchronization for multi-user coordination, and integrated SMS/Email alerts triggered automatically by scheduled division reminders.</p>

<h2 class="references-heading">References</h2>

<div class="references-list">

<p>[1] A. Haidar, “Catatan Konsep Belajar Nuxt 4,” *Timekeeper Repository Internal Documentation*, 2026. [Online]. Available: [Konsep.md](file:///d:/Project/timekeeper/Konsep.md).</p>

<p>[2] A. Haidar, “Testing di Nuxt 4 (Timekeeper Project),” *Timekeeper Repository Internal Documentation*, 2026. [Online]. Available: [Testing.md](file:///d:/Project/timekeeper/Testing.md).</p>

<p>[3] A. Haidar, “UX Improvements Implementation Summary,” *Timekeeper Repository Internal Documentation*, 2026. [Online]. Available: [UX_IMPROVEMENTS.md](file:///d:/Project/timekeeper/UX_IMPROVEMENTS.md).</p>

<p>[4] A. Haidar, “Tailwind CSS Integration Guide,” *Timekeeper Repository Internal Documentation*, 2026. [Online]. Available: [Tailwind.md](file:///d:/Project/timekeeper/Tailwind.md).</p>

<p>[5] A. Haidar, “Nuxt 4 Migration and Setup Notes,” *Timekeeper Repository Internal Documentation*, 2026. [Online]. Available: [Nuxt4.md](file:///d:/Project/timekeeper/Nuxt4.md).</p>

<p>[6] A. Haidar, “Production Build and Deployment Instructions,” *Timekeeper Repository Internal Documentation*, 2026. [Online]. Available: [Production.md](file:///d:/Project/timekeeper/Production.md).</p>

</div>

</div>

<!-- ================= FOOTNOTE ================= -->
<div class="ieee-footnote">
  *This paper represents the formal technical documentation of the Timekeeper application. The software repository is maintained locally in the user's workspace at <code>atiohaidar/timekeeper</code>.
</div>

</div>
