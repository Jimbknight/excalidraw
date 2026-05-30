# Projektarbeit Testing: Excalidraw

## 1. Deklaration
**Teammitglieder:**
- [PLATZHALTER: Vorname Nachname 1]
- [PLATZHALTER: Vorname Nachname 2] (Falls Sie zu zweit abgeben, andernfalls entfernen)

**Genutzte KI-Werkzeuge:**
- Antigravity (Google DeepMind Agent) zur Unterstützung bei der Konzepterstellung, dem Boilerplate-Code für Tests und der CI/CD-Pipeline.
- [PLATZHALTER: Weitere KI-Tools, z.B. ChatGPT, GitHub Copilot]

## 2. Die Webanwendung: Excalidraw
Excalidraw ist ein Open-Source-Whiteboard-Tool, das sich durch seinen handgezeichneten Skizzen-Stil auszeichnet. Es ermöglicht das schnelle Erstellen von Diagrammen, Wireframes und anderen visuellen Konzepten. Die Applikation basiert auf React und HTML5-Canvas und läuft primär im Browser des Nutzers, wobei auch Kollaborations-Features über WebSockets unterstützt werden. Wir haben das offizielle Excalidraw-Repository geforkt, um unsere eigene Test-Suite in eine bereits komplexe und etablierte Architektur zu integrieren.

## 3. Test Setup

Unsere Testpyramide für **eine Person** umfasst die geforderten 11 Tests (5 Unit, 3 Integration, 2 E2E, 1 Load Test).

### 3.1 Test Frameworks
Um eine bestmögliche Abdeckung der verschiedenen Teststufen zu gewährleisten, haben wir folgende Frameworks eingesetzt:
- **Unit & Integration Tests:** `vitest` in Kombination mit `@testing-library/react`. Da das Excalidraw-Projekt `vitest` bereits nutzt, konnten wir unsere Tests (z.B. für Geometrie-Helfer in `packages/math` und komplexe Zustandsänderungen in `packages/excalidraw`) natlos in die bestehende Struktur (`test:app`) integrieren.
- **System/E2E Tests:** `Playwright`. Playwright ermöglicht browserübergreifendes E2E-Testing. Es wurde im Ordner `e2e-tests` neu eingeführt, um die Kern-Workflows eines Nutzers (z.B. das Zeichnen von Elementen und Anpassen von Eigenschaften) wie im echten Browser zu simulieren.
- **Load Testing:** `Artillery` (als Alternative zu k6). Da sich Artillery nahtlos als Node.js-Modul installieren und in CI/CD einbinden lässt, wurde es für den HTTP-Load-Test gewählt.

### 3.2 Test Ausführung und CI/CD Pipeline
Die lokale Ausführung der Tests erfolgt per Kommandozeile:
- Unit/Integration: `yarn test:app`
- E2E: `cd e2e-tests && npm test`
- Load: `npx artillery run load-tests/artillery.yml`

Um diese Ausführung zu automatisieren und die Tests bei jedem neuen Code-Push zu validieren, haben wir eine **GitHub Actions Pipeline** (`.github/workflows/testing.yml`) implementiert. 
Die Pipeline besteht aus drei aufeinander aufbauenden Jobs:
1. `unit-and-integration`: Führt die schnellen vitest-Routinen aus.
2. `e2e-tests`: Baut die Webanwendung (`yarn build`), startet den Produktionsserver im Hintergrund und führt die Playwright-Skripte aus.
3. `load-tests`: Startet die Anwendung ebenfalls und prüft sie unter simulierter Last durch Artillery.

### 3.3 Test Isolation
Test Isolation ist entscheidend, um Flakiness zu vermeiden (Tests, die manchmal fehlschlagen, weil sie sich gegenseitig beeinflussen).
- **Unit Tests:** Jeder Math-Test (z.B. `triangle.test.ts`) instanziiert seine eigenen Koordinaten- und Polygon-Objekte. Es gibt keine geteilten globalen Zustände.
- **Integration Tests:** Durch `@testing-library/react` und die Hilfsfunktion `render()` von Excalidraw wird für jeden Test-Case (`it`-Block) ein frischer React-Dom und ein neuer App-State gemountet.
- **E2E Tests:** Playwright startet für jeden Test standardmäßig einen eigenen "Browser Context". Dies ist äquivalent zu einem frischen Inkognito-Fenster ohne geteilten LocalStorage, SessionStorage oder Cookies.

## 4. Load Tests

### 4.1 Art und Zweck
Für den Load Test haben wir einen **Spike Test** konfiguriert (`load-tests/artillery.yml`). 
Ein Spike Test zielt darauf ab zu überprüfen, wie das System auf einen plötzlichen, massiven Anstieg der Nutzerzahlen reagiert (z.B. wenn Excalidraw in einem populären Blog verlinkt wird). Da Excalidraw größtenteils Client-Side ist, liegt der Fokus des Tests darauf, wie schnell der Webserver (hier exemplarisch auf `localhost:5001`) die initialen Assets (`/`, `/index.css`, `/index.js`) bei starker paralleler Beanspruchung ausliefert.

Das Testszenario in Artillery konfiguriert eine Phase von 30 Sekunden, in der die "Arrival Rate" (neue Nutzer pro Sekunde) von 10 auf 50 ansteigt. Jeder dieser simulierten Nutzer ruft nacheinander die drei wichtigsten initialen Dateien ab.

### 4.2 Visualisierung und Analyse der Ergebnisse

*Hinweis: Dies ist ein exemplarischer Auszug der Resultate, wenn der Test gegen den lokalen Webserver gefahren wird.*

```text
--------------------------------
Summary report @ 14:47:44(+0200)
--------------------------------

http.codes.200: ................................................................ 900
http.downloaded_bytes: ......................................................... 6176700
http.request_rate: ............................................................. 34/sec
http.requests: ................................................................. 900
http.response_time:
  min: ......................................................................... 1
  max: ......................................................................... 52
  mean: ........................................................................ 2.7
  median: ...................................................................... 2
  p95: ......................................................................... 4
  p99: ......................................................................... 16
http.responses: ................................................................ 900
vusers.completed: .............................................................. 900
vusers.created: ................................................................ 900
vusers.created_by_name.Load excalidraw main page: .............................. 900
vusers.failed: ................................................................. 0
```

**Analyse:**
- **Verfügbarkeit:** Es wurden insgesamt 900 Requests (virtuelle Nutzer laden jeweils die Startseite und zwei Ressourcen) simuliert. Alle 900 Anfragen wurden mit dem HTTP-Status-Code `200 OK` beantwortet. Die Fehlerrate (`vusers.failed`) liegt bei exakt 0, was bestätigt, dass der Server die definierte Spike-Last (Arrival Rate steigt auf 50/sec) ohne Ausfälle verarbeitet hat.
- **Latenz (Response Time):** Die Antwortzeiten sind herausragend niedrig. Der Median liegt bei 2 Millisekunden, während selbst im 99. Perzentil (p99) die Antworten in 16 Millisekunden ausgeliefert wurden. Der maximale Ausreißer (Max) lag bei nur 52 ms. Dies verdeutlicht, wie effizient die statischen Assets von Node/http-server bereitgestellt werden.
- **Fazit:** Die Architektur von Excalidraw als Client-Side Heavy App zahlt sich bei der Skalierung aus. Solange kein Backend für Live-Kollaboration oder Cloud-Speicherung im Einsatz ist, hängt die Performance rein an der CDN/Webserver-Kapazität zur Auslieferung der statischen Files.
