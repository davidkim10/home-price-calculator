import { Calculator } from "@/app/components/Calculator";
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 ]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Calculator />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">
          {new Date().getFullYear()} &copy; All rights reserved.
        </p>
      </footer>
    </div>
  );
}
