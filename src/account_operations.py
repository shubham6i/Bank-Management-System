from db_config import connect


# -------------------------------------------------------------
# Core Service Functions (Used by both Web API and CLI)
# -------------------------------------------------------------

def service_create_account(name: str, email: str, balance: float):
    db = connect()
    cursor = db.cursor()
    sql = "INSERT INTO accounts (name, email, balance) VALUES (%s, %s, %s)"
    cursor.execute(sql, (name, email, balance))
    db.commit()
    account_id = cursor.lastrowid
    db.close()
    return {
        "success": True,
        "message": "Account created successfully!",
        "account": {
            "id": account_id,
            "name": name,
            "email": email,
            "balance": float(balance)
        }
    }


def service_get_accounts():
    db = connect()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email, balance FROM accounts ORDER BY id DESC")
    rows = cursor.fetchall()
    db.close()
    return [
        {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "balance": float(row[3])
        }
        for row in rows
    ]


def service_get_account(acc_id: int):
    db = connect()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email, balance FROM accounts WHERE id = %s", (acc_id,))
    row = cursor.fetchone()
    db.close()
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "balance": float(row[3])
        }
    return None


def service_deposit(acc_id: int, amount: float):
    if amount <= 0:
        return {"success": False, "message": "Deposit amount must be greater than zero."}

    account = service_get_account(acc_id)
    if not account:
        return {"success": False, "message": f"Account with ID #{acc_id} not found."}

    db = connect()
    cursor = db.cursor()
    cursor.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (amount, acc_id))
    db.commit()
    db.close()

    updated_account = service_get_account(acc_id)
    return {
        "success": True,
        "message": f"Successfully deposited ${amount:,.2f} to Account #{acc_id}!",
        "account": updated_account
    }


def service_withdraw(acc_id: int, amount: float):
    if amount <= 0:
        return {"success": False, "message": "Withdrawal amount must be greater than zero."}

    account = service_get_account(acc_id)
    if not account:
        return {"success": False, "message": f"Account with ID #{acc_id} not found."}

    if account["balance"] < amount:
        return {
            "success": False,
            "message": f"Insufficient balance! Current balance is ${account['balance']:,.2f}."
        }

    db = connect()
    cursor = db.cursor()
    cursor.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (amount, acc_id))
    db.commit()
    db.close()

    updated_account = service_get_account(acc_id)
    return {
        "success": True,
        "message": f"Successfully withdrew ${amount:,.2f} from Account #{acc_id}!",
        "account": updated_account
    }


# -------------------------------------------------------------
# Terminal CLI Functions (Maintained for terminal menu compatibility)
# -------------------------------------------------------------

def create_account():
    name = input("Enter your First name = ")
    email = input("Enter your email address = ")
    balance = float(input("Enter your opening balance = "))
    res = service_create_account(name, email, balance)
    print(res["message"])


def view_accounts():
    accounts = service_get_accounts()
    print("\n--- All Accounts ---")
    if not accounts:
        print("No accounts found.")
    for acc in accounts:
        print(f"ID: {acc['id']}, Name: {acc['name']}, Email: {acc['email']}, Balance: {acc['balance']}")


def deposit_money():
    acc_id = int(input("Enter Account Id: "))
    amount = float(input("Enter deposit amount: "))
    res = service_deposit(acc_id, amount)
    print(res["message"])


def withdraw_money():
    acc_id = int(input("Enter Account Id: "))
    amount = float(input("Enter amount to withdraw: "))
    res = service_withdraw(acc_id, amount)
    print(res["message"])


def check_balance():
    acc_id = int(input("Enter Account Id: "))
    account = service_get_account(acc_id)
    if account:
        print(f"Account Holder : {account['name']}, Balance : {account['balance']}")
    else:
        print("Account not found")