export default function ProviderCard({ provider = { name: "Alex Morgan", specialty: "Home services", rating: "4.9" } }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-12 w-12 rounded-full bg-brand-50" />
      <h3 className="mt-4 font-semibold text-slate-950">{provider.name}</h3>
      <p className="text-sm text-slate-500">{provider.specialty}</p>
      <p className="mt-3 text-sm font-medium text-brand-600">{provider.rating} rating</p>
    </article>
  );
}




