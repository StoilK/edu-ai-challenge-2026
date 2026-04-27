import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// For GitHub project pages, set: VITE_BASE=/your-repo-name/
// Or edit `base` here before `npm run build`.
const base = process.env.VITE_BASE ?? "/"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
