import LoanCalculator from "@/components/LoanCalculator";

export const metadata = {
  title: "حاسبة القروض | أدوات مالية",
  description:
    "احسب القسط الشهري وإجمالي الفائدة وجدول السداد لأي قرض أو رهن عقاري.",
};

export default function LoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <LoanCalculator />
    </div>
  );
}
