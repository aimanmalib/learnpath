"use client";
import { ApiError, openSettings } from "@/lib/api-client";

export function ErrorNotice({ error }: { error: ApiError | null }) {
  if (!error) return null;
  return (
    <div role="alert" className="max-w-md mx-auto mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>{error.message}</p>
      {error.fixableInSettings && (
        <button
          type="button"
          onClick={() => openSettings()}
          className="mt-3 rounded-lg bg-white px-3 py-1.5 font-medium text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-100"
        >
          Open Settings
        </button>
      )}
    </div>
  );
}
