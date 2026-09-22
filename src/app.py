import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from db_config import init_db
from account_operations import (
    service_create_account,
    service_get_accounts,
    service_get_account,
    service_deposit,
    service_withdraw,
)

# Initialize Flask app
# Static and template folders point to the current src directory
app = Flask(__name__, template_folder="templates", static_folder="static")

# Automatically ensure database and accounts table exist on server boot
try:
    init_db()
except Exception as e:
    print(f"Database init warning: {e}")


@app.route("/")
def index():
    """Serves the main frontend dashboard."""
    return render_template("index.html")


# -------------------------------------------------------------
# REST API Endpoints
# -------------------------------------------------------------

@app.route("/api/accounts", methods=["GET"])
def get_accounts():
    """Retrieve all accounts from database."""
    try:
        accounts = service_get_accounts()
        return jsonify({"success": True, "accounts": accounts}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500


@app.route("/api/accounts", methods=["POST"])
def create_account():
    """Create a new account."""
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        balance_raw = data.get("balance", 0)

        if not name:
            return jsonify({"success": False, "message": "Customer name is required."}), 400
        if not email:
            return jsonify({"success": False, "message": "Email address is required."}), 400

        try:
            balance = float(balance_raw)
            if balance < 0:
                return jsonify({"success": False, "message": "Initial balance cannot be negative."}), 400
        except ValueError:
            return jsonify({"success": False, "message": "Invalid opening balance amount."}), 400

        result = service_create_account(name, email, balance)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"Error creating account: {str(e)}"}), 500


@app.route("/api/accounts/<int:acc_id>", methods=["GET"])
def get_account_detail(acc_id):
    """Retrieve details for a single account."""
    try:
        account = service_get_account(acc_id)
        if not account:
            return jsonify({"success": False, "message": f"Account #{acc_id} not found."}), 404
        return jsonify({"success": True, "account": account}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/api/deposit", methods=["POST"])
def deposit_money():
    """Deposit funds into an account."""
    try:
        data = request.get_json() or {}
        acc_id = data.get("account_id")
        amount_raw = data.get("amount")

        if not acc_id:
            return jsonify({"success": False, "message": "Account ID is required."}), 400

        try:
            acc_id = int(acc_id)
            amount = float(amount_raw)
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "Invalid account ID or deposit amount."}), 400

        result = service_deposit(acc_id, amount)
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/api/withdraw", methods=["POST"])
def withdraw_money():
    """Withdraw funds from an account."""
    try:
        data = request.get_json() or {}
        acc_id = data.get("account_id")
        amount_raw = data.get("amount")

        if not acc_id:
            return jsonify({"success": False, "message": "Account ID is required."}), 400

        try:
            acc_id = int(acc_id)
            amount = float(amount_raw)
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "Invalid account ID or withdrawal amount."}), 400

        result = service_withdraw(acc_id, amount)
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Provides high-level banking statistics."""
    try:
        accounts = service_get_accounts()
        total_balance = sum(acc["balance"] for acc in accounts)
        total_accounts = len(accounts)
        avg_balance = (total_balance / total_accounts) if total_accounts > 0 else 0
        top_account = max(accounts, key=lambda x: x["balance"]) if accounts else None

        return jsonify({
            "success": True,
            "stats": {
                "total_balance": total_balance,
                "total_accounts": total_accounts,
                "avg_balance": avg_balance,
                "top_account": top_account
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == "__main__":
    print("=====================================================")
    print("[*] Apex Bank Management Web Application")
    print("[*] Server running at: http://127.0.0.1:5000")
    print("=====================================================")
    app.run(debug=True, port=5000)
