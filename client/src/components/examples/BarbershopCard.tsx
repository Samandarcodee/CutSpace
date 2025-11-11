import BarbershopCard from '../BarbershopCard';
import luxuryImage from '@assets/generated_images/Luxury_barbershop_interior_Tashkent_3c957162.png';
import barberWork from '@assets/generated_images/Professional_barber_at_work_76c48d13.png';

export default function BarbershopCardExample() {
  return (
    <div className="p-4 max-w-md">
      <BarbershopCard
        id="1"
        name="Premium Barber Shop"
        description="Premium darajadagi xizmatlar va zamonaviy interyerga ega barbershop."
        rating={4.8}
        address="Amir Temur ko'chasi 15, Yunusobod tumani"
        services={["Soch olish", "Soqol qirish", "Styling"]}
        images={[luxuryImage, barberWork]}
        reviewCount={127}
        onViewDetails={(id) => console.log('View details:', id)}
      />
    </div>
  );
}
