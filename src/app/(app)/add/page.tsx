import { AddMaterialPanel } from "@/components/materials/add-material-panel";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AddPage() {
  const dictionary = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      <h1 className="text-lg font-medium tracking-tight text-zinc-100">
        {dictionary.add.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{dictionary.add.subtitle}</p>
      <div className="mt-8">
        <AddMaterialPanel />
      </div>
    </main>
  );
}
