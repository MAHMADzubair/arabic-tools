import InheritanceCalculator from "@/components/InheritanceCalculator";

export const metadata = {
  title: "حاسبة الميراث الشرعية | أدوات مالية",
  description:
    "احسب توزيع التركة والأنصبة الشرعية بدقة وفقاً لأحكام القرآن الكريم والسنة النبوية مع دعم أصحاب الفروض والعصبات والعول والرد.",
};

export default function InheritanceCalculatorPage() {
  return (
    <div className="py-6 sm:py-10">
      <InheritanceCalculator />
    </div>
  );
}
