# Student Finance Transparency Portal & Auto-Scanner

> **24/7 Online Student Organization Financial Integrity Engine**  
> Built for Computer Engineering student orgs, class treasurers, and student councils.

---

## ⚡ What This System Does

- **Dynamic Visual Infographics:** Real-time KPI summary cards (Total Collections, Expenses, Vault Balance), donut compliance charts, audited expense category breakdowns, and collection influx timelines.
- **Automated Multi-Source Scanner:**
  1. **Live Google Sheets Auto-Sync:** Connect your Google Sheet (linked to Google Forms). When anyone submits a payment or you edit the sheet, the dashboard polls and updates infographics automatically every 60 seconds.
  2. **In-Browser Document Scanner:** Drag and drop `.xlsx`, `.csv`, or `.docx` directly into the web interface. Instant parsing using SheetJS and Mammoth with zero third-party server exposure.
- **Student Transparency Search Portal:** Students can search their Student ID or Name to verify clearance, view payment timestamps, and see their receipt status.
- **Discrepancy Resolution Engine:** Automatically flags duplicate transaction references (reused GCash receipts), underpayments, or unmatched master list names.
- **Zero-Downtime 24/7 Hosting:** Client-side architecture ready to run on custom domains with free automatic SSL.

---

## 📁 Repository Structure

```
├── index.html        # Public transparency dashboard & student dues search
├── style.css         # Cyber-glass theme & official print report styles
├── app.js            # Auto-scanner engine, Chart.js managers & discrepancy logic
└── README.md         # Deployment & custom domain setup documentation
```

---

## 🌐 Linking Your Own Custom Domain

This web application requires zero server backend and runs 100% on the edge. You can deploy it and attach your custom domain in 2 minutes:

### Option A: Cloudflare Pages (Recommended - Fastest & 100% Free)
1. Push this folder to your GitHub (e.g. `drex122705/finance-tracker`).
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository. Framework preset: `None`. Build command: (leave blank). Output directory: `/`.
4. Click **Custom domains** > Add your domain (e.g., `finance.yourdomain.com` or `yourdomain.com`). Cloudflare manages DNS and free SSL automatically!

### Option B: Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Framework: `Other`. Root Directory: `./`.
3. Go to **Settings** > **Domains** > Add your custom domain.
4. Add the provided `CNAME` or `A` record in your domain registrar DNS.

### Option C: GitHub Pages + Custom Domain
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Select branch `main` and root `/`.
3. Under **Custom domain**, enter your domain name (e.g. `finance.yourdomain.com`).
4. At your domain registrar DNS, add a `CNAME` pointing to `drex122705.github.io`.

---

## 📊 Connecting Your Live Google Sheet

1. In Google Sheets (linked to your Google Forms):
   - Click **File** > **Share** > **Publish to web**.
   - Under Link, choose **Entire Document** and select format **Comma-separated values (.csv)**.
   - Click **Publish** and copy the generated URL.
2. Open your deployed finance website.
3. Click the **Data Scanner & Sync** button in the top navigation.
4. Paste your published CSV link and click **Save & Connect Auto-Sync**.
5. Your infographics will now update automatically every 60 seconds whenever new responses arrive!
