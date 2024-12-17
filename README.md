# Summ<span style="color: #00ffff;">AI</span>ze - Web Frontend und Backend

Bitte verwende Node v22.

## Entwickler-Setup

Um das SummAIze Web-Projekt einzurichten, folge diesen Schritten:

1. Klone das Repository:

   ```bash
   git clone https://github.com/SummAize/SummAIze_Web.git
   ```

2. Wechsel in das `summaize-web` Verzeichnis und installiere die Projekt-Abhängigkeiten:

   ```bash
   cd "summaize-web/summaize-backend"
   npm install
   cd "summaize-web/summaize-frontend"
   npm install
   cd summaize-web
   npm install
   ```

3. Entwickeln und Testen

   - Starte die App (Frontend und Backend):

   ```bash
   npm start
   ```

Das war's! Du bist jetzt bereit, mit der Entwicklung des SummAIze Web Frontend-Projekts zu beginnen.

---------------
## Branch-Namenskonvention

Für eine klare und strukturierte Arbeit im Team verwenden wir folgende Branch-Namenskonventionen:

* **`main`**:  
   Der stabile, produktive Code. Dieser Branch sollte nur den neuesten **fertigen** und **geprüften** Code enthalten.

* **`develop`**:  
   Der Entwicklungs-Branch, in dem neue Features und Bugfixes zusammengeführt werden, bevor sie in `main` gemerged werden.

* **`feature/<name>`**:  
   Branches für die Entwicklung neuer Funktionen.  
   **Beispiel**: `feature/login-page`, `feature/user-profile`.

* **`bugfix/<name>`**:  
   Branches für die Behebung von Fehlern oder Bugs.  
   **Beispiel**: `bugfix/login-error`, `bugfix/navbar-crash`.

* **`task/<name>`**:  
   Branches für allgemeine Aufgaben wie Refactoring, Dokumentation oder kleinere Verbesserungen.  
   **Beispiel**: `task/refactor-authentication`, `task/update-readme`.
