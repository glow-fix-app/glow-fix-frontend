import { Spinner } from "@heroui/react";

export default function BookingDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl pb-16">
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    </section>
  );
}
