import { Button } from "@heroui/react";

export function SubmitButton({ children, isLoading, loadingText, className = "" }) {
  return (
    <Button
      className={`h-11 rounded-full bg-brand-500 px-8 text-[13px] font-bold tracking-tight text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:bg-gray-300 ${className}`}
      isDisabled={isLoading}
      type="submit"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
