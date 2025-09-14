Name: Amrita Reji
# task
👉 [Demo Video link](https://youtu.be/ds3tgF1-PUo?si=hlKK_E8HmkNp7Cw_)
## Tech Stack

### Backend
- **Framework:** Express.js – minimal and flexible Node.js web application framework.
- **Language:** TypeScript – statically typed superset of JavaScript.
- **Runtime:** Node.js – executes TypeScript/JavaScript server-side.
- **Authentication:**
  - JWT (jsonwebtoken) – creates & verifies access tokens.
  - bcrypt.js – securely hashes & compares passwords.
  - **Authentication Middleware:** Acts as a gatekeeper for protected routes:
    1. **Check Token** – Reads `Authorization: Bearer <token>`.  
    2. **No Token** – Returns **401 Unauthorized**.  
    3. **Verify Token** – Validates with `jwt.verify()` and `JWT_SECRET`.  
    4. **Invalid/Expired** – Returns **401 Unauthorized**.  
    5. **Valid** – Attaches decoded user to `req.user` and calls `next()`.  
- **Middleware:**
  - cors – enables Cross-Origin Resource Sharing.
  - body-parser – parses incoming request bodies (`req.body`).
- **Database:** In-memory array (mock database).
- **Dev Tools:**
  - ts-node – run TypeScript directly.
  - nodemon – auto-restart server on file changes.

### Frontend
- **Framework:** React (SPA with functional components & hooks).
- **Bootstrapped with:** Create React App.
- **Routing:** React Router (react-router-dom).
- **State Management:**
  - React Hooks (`useState`, `useEffect`, `useContext`).
  - Context API (ThemeContext for light/dark mode).
  - LocalStorage (persist JWT & mock annotation API data).
- **Styling:**
  - CSS Variables for theming (light/dark).
  - Modern CSS (Flexbox, keyframes animations, media queries).
- **API Communication:**
  - Fetch API (HTTP requests to backend on `localhost:3000`).
  - `mockAnnotationApi.js` – fake API via `localStorage` (for testing annotations).
- **Animations & Visuals:**
  - particles.js – animated particle backgrounds.
  - framer-motion – advanced UI animations.
  - CSS Ken Burns Effect – cinematic zoom/pan for photo gallery thumbnails.
- **Development Environment:**
  - Dev server runs on **PORT=3001**.
  - Create React App build & scripts.
  

### Additional Features
- **Lazy Loading:** Implemented with `IntersectionObserver` API (via `useLazyLoad` hook).
- **Dark/Light Theme:** Global toggle via Context API.
- **Mock Annotation API:**
  - Persists annotations in `localStorage`.
  - Commands (console):
    - `console.table(__ANNOS__())` → view annotations in table form.
    - `__ANNORESET__()` → reset annotation data.

---

## Scripts

```bash
cd ftask
npm run dev

cd ftask-frontend
npm start
