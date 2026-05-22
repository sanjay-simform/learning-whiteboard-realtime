import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./api-client/query.config.ts"
import { ThemeProvider } from "./components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
