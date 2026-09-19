import ZakatCalculator from "@/components/ZakatCalculator";

export const metadata = {
  title: "حاسبة الزكاة | أدوات مالية",
  description:
    "احسب زكاة مالك بدقة بناءً على نصاب الفضة الحالي مع دعم الأصول والالتزامات.",
};

export default function ZakatCalculatorPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <ZakatCalculator />
    </div>
  );
}
