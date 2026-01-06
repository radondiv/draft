# Digital LR — Template Mode (Exact appearance)

This variant renders your LR **exactly like the original** by using a background image (PNG/JPG) of your LR book page and placing text fields at precise coordinates on top.

## Steps
1. Scan your LR page (blank) as **A4 landscape PNG/JPG**.
2. Upload it to any URL (or Firebase Storage) and paste the **Template Image URL** in the Settings.
3. Fill the form; the right preview will show your exact LR with your text overlayed.
4. Save to Firestore, share the link, and print (A4 landscape).

### Adjusting positions
- Open `view.html` and tweak CSS for each `#field` (left/top/width). Do this once to match perfectly.
- All units are in **millimeters** for accuracy.

Security rules and Firebase setup are same as the base app.
