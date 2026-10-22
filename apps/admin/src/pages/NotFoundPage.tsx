import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F6] text-zinc-900 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-1">
        404 / Error
      </p>
      <h1 className="text-2xl font-medium text-zinc-900 tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-xs text-zinc-500 max-w-sm mb-6">
        The requested path does not exist on this portal.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
