import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ProtectedAdmin from "./ProtectedAdmin.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProtectedAdmin />
  </StrictMode>
);
