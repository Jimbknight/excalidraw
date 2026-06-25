# Projektarbeit: Testen von Excalidraw

## Wer hat mitgemacht und womit?

**Team:**
- Bernhard Steps
- 

**KI-Tools die wir verwendet haben:**
- Antigravity (Google DeepMind Agent) – hat uns beim Analysieren der Codebasis und evaluieren was wir machen könnten geholfen.

---

## Warum Excalidraw?

Excalidraw kennt man vielleicht: Es ist dieses Online-Whiteboard, bei dem alles so aussieht, als hätte man es von Hand gezeichnet. Man kann damit super schnell Diagramme, Wireframes oder einfach Skizzen machen. Technisch steckt React und HTML5 Canvas dahinter, und es läuft komplett im Browser. Wer will, kann auch mit anderen gleichzeitig dran arbeiten (über WebSockets).

Wir haben uns für Excalidraw entschieden, weil es ein echtes, aktives Open-Source-Projekt ist – kein Spielzeug-Repo. Die Codebasis ist groß genug, dass man sinnvolle Tests schreiben kann, ohne sich was aus den Fingern zu saugen. Wir haben das offizielle Repo geforkt und unsere Tests dort eingebaut.

---

## Test-Aufbau

Pro Person waren mindestens 11 Tests gefordert. So haben wir das aufgeteilt:

| Kategorie | Anzahl | Wo? |
|---|---|---|
| Unit Tests | 5 | `packages/math/tests/triangle.test.ts` |
| Integration Tests | 3 | `packages/excalidraw/tests/customIntegration.test.tsx` |
| E2E Tests | 2 | `e2e-tests/tests/excalidraw.spec.ts` |
| Load Test | 1 | `load-tests/artillery.yml` |

### Welche Frameworks haben wir benutzt?

**Für Unit und Integration Tests: Vitest + Testing Library**
Excalidraw nutzt intern sowieso schon Vitest als Test-Runner. Das hat es uns leicht gemacht – wir konnten unsere Tests einfach ins bestehende Setup einklinken, ohne ein komplett neues Framework aufzusetzen. Für die Integration Tests haben wir dann `@testing-library/react` dazugenommen, womit man React-Komponenten rendern und mit ihnen interagieren kann.

**Für E2E Tests: Playwright**
Playwright war für uns die beste Wahl, weil es echte Browser steuert. Das heißt, unsere Tests machen wirklich das, was ein Nutzer auch machen würde: Seite öffnen, auf die Canvas klicken, Formen zeichnen. Das haben wir in einem separaten `e2e-tests`-Ordner aufgesetzt.

**Für Load Tests: Artillery**
Artillery ist im Grunde ein Tool, das ganz viele HTTP-Requests auf einmal losschickt, um zu schauen, ob der Server das packt. Es lässt sich einfach über npm installieren und man konfiguriert alles über eine YAML-Datei.

### Wie führt man die Tests aus?

Lokal geht das so:
```bash
# Unit + Integration Tests
yarn test:app

# E2E Tests
cd e2e-tests && npm test

# Load Test (Server muss vorher laufen!)
npx artillery run load-tests/artillery.yml
```

### CI/CD: GitHub Actions

Die Pipeline hat drei Schritte, die nacheinander ablaufen:
1. **Unit + Integration Tests** laufen zuerst, weil sie am schnellsten sind
2. **E2E Tests** kommen danach – dafür wird die App erst gebaut und ein Server gestartet, bevor Playwright loslegt
3. **Load Tests** ganz am Schluss – auch hier wird die App gestartet und dann von Artillery unter Last gesetzt

Das Gute daran: Wenn die Unit Tests schon fehlschlagen, werden die aufwändigeren E2E- und Load-Tests gar nicht erst gestartet. Das spart Zeit.

### Wie stellen wir sicher, dass sich Tests nicht gegenseitig stören?

Das Thema Test Isolation war uns wichtig, weil nichts nerviger ist als Tests, die nur manchmal grün sind:

- **Unit Tests:** Jeder einzelne Test erstellt sich seine eigenen Daten (Dreiecke, Punkte, Koordinaten). Nichts wird zwischen Tests geteilt.
- **Integration Tests:** Die Testing Library rendert für jeden `it()`-Block eine komplett frische React-App. Alter State von vorherigen Tests ist also weg.
- **E2E Tests:** Playwright öffnet für jeden Test quasi ein neues Inkognito-Fenster. Kein LocalStorage, keine Cookies, nichts von vorherigen Tests.

---

## Was testen wir genau?

### Unit Tests (5 Stück) – `triangle.test.ts`

Hier testen wir die Funktion `triangleIncludesPoint()` aus dem Math-Package. Die prüft, ob ein Punkt innerhalb eines Dreiecks liegt. Klingt simpel, ist aber eine Kernfunktion, die z.B. für Hit-Testing (Klick auf ein Element) gebraucht wird.

| # | Test | Was wird geprüft? |
|---|---|---|
| 1 | Punkt innerhalb des Dreiecks | Gibt `true` zurück |
| 2 | Punkt außerhalb des Dreiecks | Gibt `false` zurück |
| 3 | Punkt genau auf einer Kante | Gibt `true` zurück (Randfall) |
| 4 | Punkt genau auf einem Eckpunkt | Gibt `true` zurück (Randfall) |
| 5 | Dreieck mit negativen Koordinaten | Funktioniert auch mit negativen Werten |

### Integration Tests (3 Stück) – `customIntegration.test.tsx`

Bei den Integration Tests geht es darum, ob mehrere Teile der App zusammenspielen. Wir rendern die ganze Excalidraw-Komponente und simulieren dann Nutzer-Aktionen:

| # | Test | Was wird geprüft? |
|---|---|---|
| 1 | Rechteck zeichnen | Nach dem Zeichnen existiert ein Element vom Typ "rectangle" im App-State |
| 2 | Hintergrundfarbe ändern | Ein neues Element übernimmt die geänderte Farbe |
| 3 | Linienfarbe (Stroke) ändern | Die Stroke-Color wird korrekt auf neue Elemente angewendet |

### E2E Tests (2 Stück) – `excalidraw.spec.ts`

Die E2E Tests fahren einen echten Browser hoch und interagieren mit der laufenden App:

| # | Test | Was wird geprüft? |
|---|---|---|
| 1 | Rechteck auf Canvas zeichnen | Seite lädt, Titel stimmt, Rechteck-Tool + Maus-Interaktion funktionieren |
| 2 | Text-Element erstellen | Text-Tool auswählen, Text eingeben, ohne Absturz abschließen |

### Load Test (1 Stück) – `artillery.yml`

Siehe nächster Abschnitt.

---

## Load Test im Detail

### Was haben wir getestet und warum?

Wir haben einen **Spike Test** gemacht. Die Frage war: Was passiert, wenn plötzlich sehr viele Leute gleichzeitig auf Excalidraw zugreifen – z.B. weil es irgendwo viral geht?

Da Excalidraw eine Client-Side App ist (die ganze Logik läuft im Browser), geht es beim Server eigentlich nur darum, die statischen Dateien (HTML, CSS, JavaScript) auszuliefern. Genau das testen wir: Schafft der Server das auch unter Last?

**Die Konfiguration:**
- Dauer: 30 Sekunden
- Startlast: 10 neue User pro Sekunde
- Endlast: 50 neue User pro Sekunde (steigt linear an)
- Jeder User ruft 3 Seiten auf: `/`, `/index.css`, `/index.js`

### Ergebnisse

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

### Was bedeutet das?

**Null Fehler:** Alle 900 Requests kamen mit Status 200 zurück. Kein einziger ist fehlgeschlagen (`vusers.failed: 0`). Der Server hat den Spike also komplett durchgehalten.

**Extrem schnelle Antwortzeiten:** Die meisten Antworten kamen in 2ms (Median). Selbst die langsamsten 1% der Requests (p99) brauchten nur 16ms. Der absolute Worst Case lag bei 52ms – das ist immer noch blitzschnell.

**Was heißt das für die Praxis?** Excalidraw profitiert massiv davon, dass es eine Client-Side App ist. Der Server muss nur ein paar statische Dateien rausschicken, und das geht wahnsinnig schnell. Solange man kein Backend für Echtzeit-Kollaboration oder Cloud-Speicherung hat, ist die Skalierung kein Problem. In einer echten Produktionsumgebung würde man die Dateien sowieso über ein CDN ausliefern, was die Last vom Server noch weiter reduziert.
