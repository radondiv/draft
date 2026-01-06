# Digital LR (Lorry Receipt) – Jai Ambey Logistics Service

A simple, modern web app to create, preview, print and share LR documents with presets and a Firebase backend. Built as static files so you can host on GitHub Pages or Cloudflare Pages.

## Features
- **Live preview** that faithfully mirrors your LR layout in **A4 landscape**.
- **Presets** for consignors, consignees, locations, vehicle types, and material types (add once, pick from dropdowns).
- **Firebase Cloud Firestore** for storing LR records and presets; **Firebase Auth** (Google sign-in) for secure access anywhere.
- **Shareable link** for each LR (read-only view page) and **print** using the browser's print dialog.
- Clean, refreshing UI optimized for laptop/desktop.

## Quick Start
1. **Create Firebase project** (already provided):
   - Go to *Firebase Console* → *Build* → *Authentication*: enable Google sign-in.
   - Go to *Build* → *Firestore Database*: create a database (production mode).
   - Go to *Build* → *Storage*: create a default bucket.
   - In *Project Settings* → *General*, confirm the web app config matches `firebase.js`.
2. **Set Firestore & Storage security rules**:
   - Firestore: open *Firestore → Rules*, paste the content of `rules/firestore.rules`.
   - Storage: open *Storage → Rules*, paste `rules/storage.rules`.
3. **Run locally**:
   - Serve the folder (any static server). Or simply open `index.html` in a modern browser.
4. **Deploy to Cloudflare Pages**:
   - Push this folder to a GitHub repo.
   - In Cloudflare Dashboard → *Pages* → *Create a project* → *Connect to GitHub*, select the repo.
   - Build config: **Static** site (no build command). Output directory: `/` (root).
   - After deployment, use your Pages URL to access the app.

## Usage
- Click **Sign in** (Google). Add your **presets** in the Settings section.
- Fill the LR form. The right panel shows the **live preview**.
- Click **Save** to store in Firestore. Use **Share** to copy a link to the read-only view.
- Click **Print** → choose **A4 Landscape**.

## Data Model
- `presets/*/items`: collections for `consignors`, `consignees`, `locations`, `vehicleTypes`, `materialTypes`.
- `lrs`: LR records with fields like `consignor`, `consignee`, `fromLocation`, `toLocation`, `items[]`, `ownerUid`, etc.

## Notes
- Firebase client keys are **not secrets**; they identify your project. Use the provided **Security Rules** to protect data.
- You can customize the header (company name, address, PAN, GSTIN) in the **Settings**.

## Print fidelity tips
- The LR canvas uses CSS **@page** to set `A4 landscape`. In Chrome, choose **More settings → Paper size: A4**, **Margins: Default**.
- If some text wraps differently, adjust fonts in `styles.css` under `.a4-landscape`.

---
Built with ❤️ for Jai Ambey Logistics Service.
