import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router-dom.tsx";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import { SpeedInsights } from "@vercel/speed-insights/next"


createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>
);
