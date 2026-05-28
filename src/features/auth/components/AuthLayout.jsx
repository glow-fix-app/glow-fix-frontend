import { Outlet } from "react-router-dom";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import authIllustration from "@/assets/images/logo.svg";

export default function AuthLayout() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-8 md:min-h-[calc(100dvh-4rem)] md:flex-row md:items-stretch md:gap-16 lg:gap-20 xl:gap-24">
          {/* Left — brand panel (full column height: viewport min, grows with form) */}
          <aside className="relative hidden min-h-full shrink-0 flex-col overflow-hidden rounded-3xl bg-brand-500 text-white md:flex md:min-w-0 md:flex-[0.85]">
            <div className="flex shrink-0 items-center gap-3 px-6 pt-6 sm:px-8 sm:pt-8 md:px-7 md:pt-7">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10">
                <WrenchScrewdriverIcon aria-hidden="true" className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold tracking-tight">GlowFix</p>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-6 pt-2 sm:px-6 md:px-5 md:pb-7 md:pt-1 lg:px-8 lg:pb-8 lg:pt-4">
              <img
                src={authIllustration}
                alt=""
                className="h-full w-full min-h-0 max-h-full object-contain object-center"
              />
            </div>
          </aside>

          {/* Right — form on white */}
          <section className="flex min-w-0 flex-1 items-center justify-center md:justify-start">
            <div className="w-full max-w-[480px] py-1 pb-10 text-text-primary">
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
