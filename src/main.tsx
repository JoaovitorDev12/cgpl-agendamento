import { createRoot } from "react-dom/client";
import App from "./App.tsx";  // ← REMOVE o @ da frente!
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);