import { AddMaterialPanel } from "@/components/materials/add-material-panel";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AddPage() {
  const dictionary = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-zinc-50">
        {dictionary.add.title}
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500">{dictionary.add.subtitle}</p>
      <div className="mt-8">
        <AddMaterialPanel />
      </div>
    </main>
  );
}
