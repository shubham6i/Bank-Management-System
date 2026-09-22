/**
 * APEX BANK MANAGEMENT SYSTEM - FRONTEND CLIENT
 * Handles asynchronous REST communication, interactive modals, live search, and DOM rendering.
 */

document.addEventListener("DOMContentLoaded", () => {
    // State
    let allAccounts = [];
    let activeCardAccountId = null;

    // DOM Elements - Metrics
    const kpiTotalBalance = document.getElementById("kpiTotalBalance");
    const kpiTotalAccounts = document.getElementById("kpiTotalAccounts");
    const kpiAvgBalance = document.getElementById("kpiAvgBalance");
    const kpiTopAccount = document.getElementById("kpiTopAccount");
    const kpiTopAmount = document.getElementById("kpiTopAmount");
    const ledgerCountBadge = document.getElementById("ledgerCountBadge");

    // DOM Elements - Table & Search
    const accountsTableBody = document.getElementById("accountsTableBody");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const btnRefresh = document.getElementById("btnRefresh");

    // DOM Elements - Modals
    const modalCreate = document.getElementById("modalCreate");
    const modalDeposit = document.getElementById("modalDeposit");
    const modalWithdraw = document.getElementById("modalWithdraw");
    const modalCard = document.getElementById("modalCard");

    // DOM Elements - Triggers
    const btnOpenCreateModal = document.getElementById("btnOpenCreateModal");
    const btnTileCreate = document.getElementById("btnTileCreate");
    const btnTileDeposit = document.getElementById("btnTileDeposit");
    const btnTileWithdraw = document.getElementById("btnTileWithdraw");
    const btnTileLookup = document.getElementById("btnTileLookup");
    const btnEmptyCreate = document.getElementById("btnEmptyCreate");

    // Forms
    const formCreateAccount = document.getElementById("formCreateAccount");
    const formDeposit = document.getElementById("formDeposit");
    const formWithdraw = document.getElementById("formWithdraw");

    // Modal Dropdowns & Inputs
    const depositAccountId = document.getElementById("depositAccountId");
    const withdrawAccountId = document.getElementById("withdrawAccountId");
    const withdrawAccountPreview = document.getElementById("withdrawAccountPreview");
    const withdrawAvailBalance = document.getElementById("withdrawAvailBalance");

    // Card Modal Elements
    const cardMockNumber = document.getElementById("cardMockNumber");
    const cardHolderName = document.getElementById("cardHolderName");
    const cardHolderBalance = document.getElementById("cardHolderBalance");
    const detailId = document.getElementById("detailId");
    const detailName = document.getElementById("detailName");
    const detailEmail = document.getElementById("detailEmail");
    const btnCardDeposit = document.getElementById("btnCardDeposit");
    const btnCardWithdraw = document.getElementById("btnCardWithdraw");

    // =========================================================================
    // INITIALIZATION & DATA LOADING
    // =========================================================================

    async function loadDashboardData() {
        await Promise.all([fetchAccounts(), fetchStats()]);
    }

    async function fetchAccounts() {
        try {
            const res = await fetch("/api/accounts");
            const data = await res.json();
            if (data.success) {
                allAccounts = data.accounts || [];
                renderAccountsTable(filterAccounts(searchInput.value.trim()));
                populateAccountSelects();
            } else {
                showToast(data.message || "Failed to load accounts", "error");
            }
        } catch (err) {
            console.error("Fetch accounts error:", err);
            showToast("Server connection error while loading accounts.", "error");
        }
    }

    async function fetchStats() {
        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            if (data.success && data.stats) {
                const s = data.stats;
                kpiTotalBalance.textContent = formatCurrency(s.total_balance);
                kpiTotalAccounts.textContent = s.total_accounts.toLocaleString();
                kpiAvgBalance.textContent = formatCurrency(s.avg_balance);
                ledgerCountBadge.textContent = `${s.total_accounts} Accounts`;

                if (s.top_account) {
                    kpiTopAccount.textContent = s.top_account.name;
                    kpiTopAmount.textContent = formatCurrency(s.top_account.balance);
                } else {
                    kpiTopAccount.textContent = "None";
                    kpiTopAmount.textContent = "$0.00";
                }
            }
        } catch (err) {
            console.error("Fetch stats error:", err);
        }
    }

    // =========================================================================
    // RENDERING
    // =========================================================================

    function filterAccounts(query) {
        if (!query) return allAccounts;
        const q = query.toLowerCase();
        return allAccounts.filter(acc =>
            acc.name.toLowerCase().includes(q) ||
            acc.email.toLowerCase().includes(q) ||
            String(acc.id).includes(q)
        );
    }

    function renderAccountsTable(accounts) {
        accountsTableBody.innerHTML = "";

        if (accounts.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        accounts.forEach(acc => {
            const tr = document.createElement("tr");

            // Compute Initials
            const initials = acc.name
                .split(" ")
                .map(part => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "AC";

            tr.innerHTML = `
                <td><span class="id-badge">#${acc.id.toString().padStart(4, "0")}</span></td>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${initials}</div>
                        <span class="customer-name">${escapeHtml(acc.name)}</span>
                    </div>
                </td>
                <td style="color: var(--text-secondary);">${escapeHtml(acc.email)}</td>
                <td><span class="balance-pill">${formatCurrency(acc.balance)}</span></td>
                <td><span class="status-tag">● Active</span></td>
                <td class="text-right">
                    <div class="row-actions">
                        <button class="btn-table btn-table-deposit" data-id="${acc.id}" title="Deposit">Deposit</button>
                        <button class="btn-table btn-table-withdraw" data-id="${acc.id}" title="Withdraw">Withdraw</button>
                        <button class="btn-table btn-table-view" data-id="${acc.id}" title="View Card">View Card</button>
                    </div>
                </td>
            `;

            // Row Action Event Listeners
            tr.querySelector(".btn-table-deposit").addEventListener("click", () => openDepositModal(acc.id));
            tr.querySelector(".btn-table-withdraw").addEventListener("click", () => openWithdrawModal(acc.id));
            tr.querySelector(".btn-table-view").addEventListener("click", () => openCardModal(acc.id));

            accountsTableBody.appendChild(tr);
        });
    }

    function populateAccountSelects() {
        const optionsHtml = `<option value="">-- Choose Account --</option>` +
            allAccounts.map(acc => `<option value="${acc.id}">#${acc.id} - ${escapeHtml(acc.name)} (${formatCurrency(acc.balance)})</option>`).join("");

        depositAccountId.innerHTML = optionsHtml;
        withdrawAccountId.innerHTML = optionsHtml;
    }

    // =========================================================================
    // SEARCH & FILTER
    // =========================================================================

    searchInput.addEventListener("input", (e) => {
        const filtered = filterAccounts(e.target.value.trim());
        renderAccountsTable(filtered);
    });

    btnRefresh.addEventListener("click", () => {
        loadDashboardData();
        showToast("Ledger refreshed from database", "info");
    });

    // =========================================================================
    // MODALS CONTROLLERS
    // =========================================================================

    function openModal(modal) {
        modal.classList.add("active");
    }

    function closeModal(modal) {
        modal.classList.remove("active");
    }

    // Close on backdrop click and [data-close] buttons
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) closeModal(backdrop);
        });
    });

    document.querySelectorAll("[data-close]").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-close");
            const targetModal = document.getElementById(targetId);
            if (targetModal) closeModal(targetModal);
        });
    });

    // Close on Escape key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-backdrop.active").forEach(closeModal);
        }
    });

    // Button Triggers
    btnOpenCreateModal.addEventListener("click", () => openModal(modalCreate));
    btnTileCreate.addEventListener("click", () => openModal(modalCreate));
    btnEmptyCreate.addEventListener("click", () => openModal(modalCreate));

    btnTileDeposit.addEventListener("click", () => openDepositModal());
    btnTileWithdraw.addEventListener("click", () => openWithdrawModal());
    btnTileLookup.addEventListener("click", () => {
        if (allAccounts.length > 0) {
            openCardModal(allAccounts[0].id);
        } else {
            showToast("No accounts created yet.", "info");
        }
    });

    function openDepositModal(accId = null) {
        populateAccountSelects();
        if (accId) {
            depositAccountId.value = accId;
        }
        document.getElementById("depositAmount").value = "";
        openModal(modalDeposit);
    }

    function openWithdrawModal(accId = null) {
        populateAccountSelects();
        withdrawAccountPreview.style.display = "none";
        if (accId) {
            withdrawAccountId.value = accId;
            updateWithdrawPreview(accId);
        }
        document.getElementById("withdrawAmount").value = "";
        openModal(modalWithdraw);
    }

    withdrawAccountId.addEventListener("change", (e) => {
        updateWithdrawPreview(e.target.value);
    });

    function updateWithdrawPreview(accId) {
        if (!accId) {
            withdrawAccountPreview.style.display = "none";
            return;
        }
        const account = allAccounts.find(a => String(a.id) === String(accId));
        if (account) {
            withdrawAvailBalance.textContent = formatCurrency(account.balance);
            withdrawAccountPreview.style.display = "flex";
        }
    }

    function openCardModal(accId) {
        const account = allAccounts.find(a => String(a.id) === String(accId));
        if (!account) return;

        activeCardAccountId = account.id;

        // Populate Card
        const paddedId = account.id.toString().padStart(4, "0");
        cardMockNumber.textContent = `4582 9901 3218 ${paddedId}`;
        cardHolderName.textContent = account.name;
        cardHolderBalance.textContent = formatCurrency(account.balance);

        // Populate Details
        detailId.textContent = `#${paddedId}`;
        detailName.textContent = account.name;
        detailEmail.textContent = account.email;

        openModal(modalCard);
    }

    btnCardDeposit.addEventListener("click", () => {
        closeModal(modalCard);
        if (activeCardAccountId) openDepositModal(activeCardAccountId);
    });

    btnCardWithdraw.addEventListener("click", () => {
        closeModal(modalCard);
        if (activeCardAccountId) openWithdrawModal(activeCardAccountId);
    });

    // Amount Preset Chips
    document.querySelectorAll(".amount-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const targetId = chip.getAttribute("data-target");
            const amount = parseFloat(chip.getAttribute("data-amount"));
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                targetInput.value = amount.toFixed(2);
            }
        });
    });

    // =========================================================================
    // FORM SUBMISSIONS & API CALLS
    // =========================================================================

    // Create Account Form
    formCreateAccount.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("btnSubmitCreate");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Creating...</span>`;
        submitBtn.disabled = true;

        const name = document.getElementById("createName").value.trim();
        const email = document.getElementById("createEmail").value.trim();
        const balance = parseFloat(document.getElementById("createBalance").value);

        try {
            const res = await fetch("/api/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, balance })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showToast(data.message, "success");
                formCreateAccount.reset();
                closeModal(modalCreate);
                await loadDashboardData();
            } else {
                showToast(data.message || "Failed to create account", "error");
            }
        } catch (err) {
            console.error("Create account error:", err);
            showToast("Network error occurred", "error");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Deposit Form
    formDeposit.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("btnSubmitDeposit");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Processing...</span>`;
        submitBtn.disabled = true;

        const account_id = depositAccountId.value;
        const amount = parseFloat(document.getElementById("depositAmount").value);

        try {
            const res = await fetch("/api/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account_id, amount })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showToast(data.message, "success");
                formDeposit.reset();
                closeModal(modalDeposit);
                await loadDashboardData();
            } else {
                showToast(data.message || "Deposit transaction failed", "error");
            }
        } catch (err) {
            console.error("Deposit error:", err);
            showToast("Network error occurred", "error");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Withdraw Form
    formWithdraw.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("btnSubmitWithdraw");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Processing...</span>`;
        submitBtn.disabled = true;

        const account_id = withdrawAccountId.value;
        const amount = parseFloat(document.getElementById("withdrawAmount").value);

        try {
            const res = await fetch("/api/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account_id, amount })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showToast(data.message, "success");
                formWithdraw.reset();
                closeModal(modalWithdraw);
                await loadDashboardData();
            } else {
                showToast(data.message || "Withdrawal failed", "error");
            }
        } catch (err) {
            console.error("Withdraw error:", err);
            showToast("Network error occurred", "error");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // =========================================================================
    // UTILITIES & NOTIFICATIONS
    // =========================================================================

    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        let iconSvg = "";
        if (type === "success") {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === "error") {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        } else {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        toast.innerHTML = `
            ${iconSvg}
            <span class="toast-message">${escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-exit");
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function formatCurrency(val) {
        const num = parseFloat(val) || 0;
        return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial Load
    loadDashboardData();
});
