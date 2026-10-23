# Dev 2 (Admin UI) — Module 5 Implementation Checklist

**Role:** Admin Frontend Developer (React, Vite, TypeScript, Tailwind CSS, TanStack Query)  
**Strict Boundaries:** ONLY touch `apps/admin/src/pages/quotes/`, `apps/admin/src/pages/leads/components/LeadDetailDrawer.tsx`. NEVER touch `apps/api/` or `apps/web/`.

---

## Step-by-Step Execution Plan

### Step 1: Quotation Builder Modal / Page Layout

- [ ] Create `apps/admin/src/pages/quotes/QuotationBuilderModal.tsx` (or dedicated route `/admin/quotes/new`):
  - Pre-fill Lead details passed as props or query parameters:
    - Customer Name & Phone Number.
    - Service / Package context.
    - Travel Date & Number of Adults / Kids.
  - Validity Date input (defaults to 7 days in the future).
  - Internal Staff Notes input.

---

### Step 2: Dynamic Line-Item Repeater Component

- [ ] Build item repeater allowing the coordinator to add multiple line items:
  - Each row contains:
    - **Item Category:** Select (`FLIGHT`, `HOTEL`, `VISA`, `TRANSFER`, `ACTIVITY`, `OTHER`).
    - **Title:** Text input (e.g., _"IndiGo Return Flights BOM-DXB"_).
    - **Description:** Text input (e.g., _"20kg check-in, 7kg cabin"_).
    - **Quantity:** Number input (defaults to pax count).
    - **Supplier Net Cost (₹):** Number input (Flyora cost from supplier).
    - **Quoted Price (₹):** Number input (Amount quoted to customer).
    - **Row Margin Display:** Shows mini profit for that specific item.
    - **Delete Row Button:** Trash icon.
  - Quick "+ Add Flight", "+ Add Hotel", "+ Add Visa", "+ Add Transfer" shortcut buttons to rapidly add pre-typed rows.

---

### Step 3: Inclusions & Exclusions Checklist

- [ ] Add chip / tag input for Inclusions (e.g., _"Breakfast Included"_, _"Airport Transfers"_, _"4-Star Hotel Stay"_).
- [ ] Add chip / tag input for Exclusions (e.g., _"Personal Expenses"_, _"Tourism Dirham Fee"_, _"Travel Insurance"_).

---

### Step 4: Live Real-Time Margin Guard Component

- [ ] Build `MarginGuardSummaryCard.tsx` positioned prominently in the builder:
  - Real-time client-side calculation on every keystroke:
    - **Total Net Supplier Cost:** `₹XX,XXX`
    - **Total Quoted Package Price:** `₹XX,XXX`
    - **Gross Margin Amount:** `₹X,XXX`
    - **Margin Percentage:** `XX.X%`
    - **Service Target Threshold:** `service.minMarginPercent%` (e.g. 12%)
  - **Dynamic Visual Status:**
    - 🟢 **Healthy Margin:** Emerald badge with text _"Margin is healthy (+X.X% above target)"_.
    - 🔴 **Sub-Target Alert:** Red/Amber warning banner:
      > ⚠️ **Margin Below Target:** Current margin is **8.5%**, which is below the minimum required **12.0%**. You need to increase the total price by **₹4,200** to achieve minimum target.
  - Submit button disabled or shows confirmation warning dialog if margin is below target.

---

### Step 5: "Share Quote" Success Dialog & WhatsApp Dispatch

- [ ] On successful quote creation (`POST /quotes`):
  - Display celebration modal:
    - Quote Number: `FLY-2026-0042`
    - Customer Shareable Link: `https://flyora.com/quote/[shareToken]` with 1-click **"Copy Link"** button.
    - **"Copy WhatsApp Pitch"** button that copies a pre-formatted message to clipboard:
      ```text
      Hello [Customer Name]! Greetings from Flyora Travels.

      Here is your customized travel quotation for [Service/Destination]:
      - Travelers: 2 Adults
      - Total Package Price: ₹1,45,000 (All Inclusive)
      - Valid Until: 28 Oct 2026

      View your detailed day-by-day itinerary and package inclusions here:
      https://flyora.com/quote/[shareToken]

      Feel free to reply here if you'd like any customizations!
      ```
    - **"Open WhatsApp Directly"** button (`https://wa.me/[customerPhone]?text=...`).
    - **"Preview Proposal"** button (opens client link in new tab).

---

### Step 6: Integration into Coordinator Workspace

- [ ] In `apps/admin/src/pages/leads/LeadDetailDrawer.tsx`:
  - Wire the **"Create Quotation"** button to open `QuotationBuilderModal`.
  - Add a **"Quotations"** tab/section in the drawer showing:
    - History of quotes created for this lead.
    - Current status badge (`DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`).
    - Quick "Copy Link" and "Resend WhatsApp" actions.

---

### Step 7: Build Verification

- [ ] Verify `npm run build --workspace=@flyora/admin` compiles with 0 errors.
