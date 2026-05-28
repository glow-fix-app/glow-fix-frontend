
export default function CreateProviderServicePage() {
  return (
    <>
            <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Service name" />
        <textarea className="rounded-md border border-slate-300 px-3 py-2" placeholder="Description" rows="4" />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Price" />
        <button className="w-fit rounded-md bg-brand-600 px-4 py-2 font-medium text-white" type="submit">Save service</button>
      </form>
    </>
  );
}




