# ICPEP PRMSU | Official Financial Transparency Portal

> **Institute of Computer Engineers of the Philippines - President Ramon Magsaysay State University Chapter**  
> Motto: *“ICPEP PRMSU, we serve you”*  
> Official Public Disclosure & Treasury Transparency Web Portal

---

## 🏛️ System Features

1. **3D Tagline Cinematic Intro:**
   - Powered by **Three.js** with interactive 3D golden rings, particle constellations, dynamic lighting, and mouse parallax.
   - Tagline: **“ICPEP PRMSU, we serve you”**.
   - Includes seamless transition to the official government dashboard, skip option (`ESC`), and a **"Replay 3D Intro"** button in the header.

2. **Official Government & State University Standard:**
   - Compliant with Republic of the Philippines / State University institutional web guidelines:
     - Real-time **Philippine Standard Time (PST)** clock.
     - Official Philippine Navy, Manila Sun Gold, and slate institutional aesthetic.
     - Transparency Seal / FOI (Freedom of Information) compliance layout.
     - Official COA (Commission on Audit) liquidation report print mode.

3. **Pristine Empty Initial State (No Dummy Data):**
   - The portal begins in an empty state: `₱0.00` collections, `0` entries, and waiting for real data ingestion.
   - An intuitive **Ingestion Center** lets you:
     - Drag & drop local Excel files (`.xlsx`, `.csv`) or Word documents (`.docx`).
     - Paste a live Google Sheets link for 60-second automated background polling.
     - *(Optional)* A demo toggle is available if you want to preview with sample ICpEP PRMSU data.

4. **Multi-Source Scanner & Reconciliation Engine:**
   - **SheetJS:** Parses Excel spreadsheets directly inside the client's browser (100% private, zero server upload).
   - **Mammoth.js:** Extracts structured discrepancy logs and disbursement minutes from `.docx` files.
   - **Discrepancy Resolver:** Detects duplicate transaction reference numbers (e.g. reused GCash receipts), underpayments, and unmapped student numbers.

---

## 📁 Repository Structure

```
├── index.html        # 3D Tagline intro + Government transparency dashboard
├── style.css         # Official institutional styling & COA print layout
├── app.js            # Three.js 3D engine, PST clock, auto-scanner, Chart.js managers
└── README.md         # Deployment & custom domain setup documentation
```

---

## 🚀 How to Ingest Your Records

1. Open `index.html` in your browser.
2. After the 3D intro, click **"Ingest Document / Sheet"** or drag your Excel file (e.g. `tanginang  gforms to.xlsx`) anywhere onto the window.
3. The dashboard instantly generates all infographics, status matrices, and search tables!
