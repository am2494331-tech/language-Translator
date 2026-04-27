# 🌐 LinguaAI — Language Translator

A sleek, AI-powered language translation web app built with Python (Flask) and Google Translate NLP.

## Features
- 🔍 Auto language detection
- ⚡ Real-time translation (debounced auto-translate)
- 🌐 100+ languages supported
- 📋 One-click copy translation
- ⌨️ Keyboard shortcut (Ctrl+Enter)
- 🔄 Swap source ↔ target languages
- 📱 Fully responsive UI

## Tech Stack
- **Backend**: Python, Flask
- **NLP/Translation**: `deep-translator` (Google Translate API)
- **Language Detection**: `langdetect`
- **Frontend**: HTML, CSS, Vanilla JS

---

## Setup & Run in VS Code

### 1. Prerequisites
- Python 3.8+ installed
- VS Code with Python extension

### 2. Install Dependencies
Open a terminal in VS Code (`Ctrl+` ` `) and run:

```bash
pip install -r requirements.txt
```

### 3. Run the App
```bash
python app.py
```

### 4. Open in Browser
Visit: **http://127.0.0.1:5000**

---

## Project Structure
```
language-translator/
│
├── app.py                  # Flask backend + translation logic
├── requirements.txt        # Python dependencies
├── README.md
│
├── templates/
│   └── index.html          # Main HTML page
│
└── static/
    ├── css/
    │   └── style.css       # Styles
    └── js/
        └── main.js         # Frontend logic
```

---

## How It Works

1. User enters text in the **source pane**
2. Language is auto-detected using `langdetect`
3. Text is sent to `/translate` endpoint via Fetch API
4. Flask calls `deep-translator` → Google Translate
5. Translated text is returned and displayed instantly

---

## Notes
- Internet connection required (uses Google Translate API)
- Free to use, no API key needed
- Max 5000 characters per request
