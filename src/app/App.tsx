import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div className="font-['Inter',sans-serif] text-white min-h-screen bg-[#050505]">
      <RouterProvider router={router} />
    </div>
  );
}
