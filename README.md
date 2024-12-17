# Summ<span style="color: #00ffff;">AI</span>ze - Web Frontend and Backend

Please use Node v22

## Developer set up

To set up the SummAIze Web project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/SummAize/SummAIze_Web.git
   ```

2. Change directory into the `summaize-web` folder and install the project dependencies:

   ```bash
   cd "summaize-web/summaize-backend"
   npm install
   cd "summaize-web/summaize-frontend"
   npm install
   cd summaize-web
   npm install
   ```


3. Develop and Test

   - Starting the App (Front and Backend)

   ```bash
   npm start
   ```

That's it! You are now ready to start developing on the SummAIze Web Frontend project.

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
