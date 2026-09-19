import CurrencyConverter from "@/components/CurrencyConverter";

export const metadata = {
  title: "محول العملات | أدوات مالية",
  description:
    "حوّل بين الريال السعودي والدرهم والدولار واليورو وأكثر من ١٢ عملة عربية وعالمية.",
};

export default function CurrencyConverterPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <CurrencyConverter />
    </div>
  );
}
