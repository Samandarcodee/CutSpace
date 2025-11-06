import ReviewCard from '../ReviewCard';

export default function ReviewCardExample() {
  return (
    <div className="p-4 space-y-4">
      <ReviewCard
        author="Akmal Rahimov"
        rating={5}
        comment="Juda zo'r xizmat! Sartaroshlar professional va do'stona. Albatta yana kelaman."
        date="3 kun oldin"
      />
      <ReviewCard
        author="Sardor Karimov"
        rating={4}
        comment="Yaxshi joy, sifatli ish. Narxlar ham qulay."
        date="1 hafta oldin"
      />
    </div>
  );
}
