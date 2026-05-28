const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80";

export default function ProviderBanner({ coverUrl }) {
  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 -mt-6">
      <div className="relative h-[150px] w-full overflow-hidden lg:h-[220px]">
        <img
          src={coverUrl || DEFAULT_COVER}
          alt=""
          className="h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-background" />
      </div>
    </div>
  );
}
