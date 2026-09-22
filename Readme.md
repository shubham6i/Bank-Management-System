# 🏦 Apex Bank Management System

A modern, full-stack Bank Management System built with **Python**, **MySQL**, and a responsive **HTML5 / CSS3 / JavaScript** frontend dashboard.

---

## ✨ Features

- **FinTech Web Dashboard**:
  - **Live KPI Metrics**: Real-time total liquidity, registered accounts, average balance, and top-tier customer highlight.
  - **Accounts Ledger**: Interactive table with avatar badges, formatted currency, and live search filtering (by Name, ID, or Email).
  - **Open New Account**: Create customer accounts with validation.
  - **Instant Deposits & Withdrawals**: Interactive modals with quick amount preset chips (+$50, +$100, -$20, etc.) and balance guardrails.
  - **Virtual Debit Card**: Inspection modal displaying a holographic digital debit card with customer credentials.
  - **Toast Notifications**: Smooth, color-coded feedback popups for operations and errors.
- **Terminal CLI Mode**:
  - Classic console interactive menu (`python src/main.py`) for command-line banking.
- **Security & Privacy**:
  - Credentials stored safely in `.env` and excluded from source control via `.gitignore`.
  - Automatic database and table creation (`init_db()`).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

Open your terminal in the project root and install the required packages:

```bash
pip install -r requirments.txt
```

*(Packages: `mysql-connector-python`, `python-dotenv`, `flask`)*

---

### 2. Configure Database Credentials

Ensure your `.env` file in the root folder has your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tiger
DB_NAME=bank_system
```

---

### 3. Launch the Web Frontend Application

Run the Flask server:

```bash
python src/app.py
```

Then open your browser and navigate to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

### 4. (Optional) Run the Terminal CLI Mode

If you prefer running via the terminal prompt:

```bash
python src/main.py
```

---

## 📁 Project Structure

```
Bank Managmen System/
│
├── .env                         # Secret MySQL credentials (ignored by git)
├── .gitignore                    # Git rules to hide sensitive files
├── requirments.txt               # Project dependencies
├── Readme.md                     # Documentation
│
└── src/
    ├── app.py                   # Flask REST API backend & static server
    ├── db_config.py             # Database connection & auto-table init
    ├── account_operations.py    # Service methods & CLI banking operations
    ├── menu.py                  # CLI interactive terminal menu
    ├── main.py                  # CLI entry point
    │
    ├── templates/
    │   └── index.html           # Modern FinTech Web UI
    │
    └── static/
        ├── css/
        │   └── style.css        # Custom responsive dark-mode styling
        └── js/
            └── app.js           # Client-side API calls, search, and modals
```
