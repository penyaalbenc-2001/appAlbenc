# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Penya L'Albenc is a web-based management system for a cultural/social organization (Penya) built with Python/Dash. It manages events, meals, meetings, shopping lists, and aggregates news from local sources.

## Tech Stack

- **Framework**: Dash (Python web framework) with Dash Bootstrap Components
- **Server**: Gunicorn (WSGI server, 3 workers, port 8050)
- **Database**: PostgreSQL via Supabase (SSL-secured remote connection)
- **ORM**: SQLAlchemy
- **Web Scraping**: BeautifulSoup4 for DiaDia.cat news aggregation
- **Notifications**: Telegram Bot API
- **PDF Generation**: ReportLab

## Build and Run Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py

# Run production server
gunicorn --config gunicorn.conf.py app:server

# Health checks
curl http://0.0.0.0:8050/health
curl http://0.0.0.0:8050/ping
curl http://0.0.0.0:8050/status

# Test database connection
python albenc.py
```

## Architecture

### Main Files

- **app.py** - Main Dash application (~2200 lines). Contains all pages, layouts, and 40+ callbacks
- **data_manager.py** - Database abstraction layer (DataManager class) for PostgreSQL/Supabase operations
- **scraper.py** - Web scraping functions for DiaDia.cat news and external events
- **enviar_resumen.py** / **enviar_telegram.py** - Telegram notification utilities
- **gunicorn.conf.py** - Production server configuration

### Multi-Page Structure (app.py)

Pages are created via `create_[page]_page()` functions:
- Home: News aggregation, upcoming events, maintenance info
- Comidas: Meal management (cooks, dates, types)
- Fiestas: Festival/party management with attendance tracking
- Reuniones: Meeting notes with Markdown support and PDF export
- Mantenimiento: Building maintenance and budget tracking
- Eventos: Special events calendar
- Lista Compra: Shared shopping list

### Data Flow

PostgreSQL → DataManager → Dash Store (session storage) → Dash Components

### Database Tables

comidas, fiestas, eventos, reuniones, lista_compra, cambios, noticias, agenda, mantenimiento

## Key Patterns

### Dash Callbacks
```python
@app.callback(
    [Output(...), Output(...)],
    [Input(...), State(...)]
)
def callback_function(input_val, state_val):
    ctx = callback_context  # Identify which input triggered
    ...
```

### DataManager Usage
```python
dm = DataManager()
dm.get_data("table_name")
dm.add_data("table_name", {"column": "value"})
dm.get_data_filtered("table_name", where="...", order_by="...", limit=N)
```

### Date Handling
- ISO format strings: 'YYYY-MM-DD' or 'YYYY-MM-DD - HH:MM'
- Use `pd.to_datetime()` with `dayfirst=True`

## Environment Variables (.env)

```
DATABASE_URL=postgresql://...@supabase.com
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
PORT=8050 (optional)
DASH_DEBUG=True/False (optional)
```

## REST Endpoints

- `GET /health` - Health check
- `GET /ping` - Triggers background scraping, returns "pong"
- `GET /status` - Database connection status

## Adding New Features

**New page**: Create `create_[page]_page()` function in app.py, add routing callback

**New database table**: Update `DataManager.init_tables()` with SQL schema in data_manager.py

**New scraper**: Extend scraper.py with new scraping function
