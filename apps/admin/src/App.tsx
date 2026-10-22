import { Compass, Users, CheckCircle } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-3 bg-blue-600/20 text-blue-400 rounded-xl">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Flyora Travels
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Staff & Service Coordinator Portal
          </p>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-4 text-left border border-slate-700/50 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Workspace Ready for Dev 2</span>
          </div>
          <p className="text-slate-400">
            Vite, React 19, Tailwind CSS, TanStack Query, and Zustand are
            configured.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="/login"
            className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-sm transition"
          >
            <Users className="w-4 h-4" />
            <span>Proceed to Login</span>
          </a>
        </div>
      </div>
    </div>
  );
}
