import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">403</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Unauthorized</h1>
        <p className="mt-3 text-slate-600">You do not have permission to view this page.</p>
        <Link className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 font-medium text-white" to="/">
          Return home
        </Link>
      </div>
    </div>
  );
}




