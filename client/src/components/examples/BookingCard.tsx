import BookingCard from '../BookingCard';

export default function BookingCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <BookingCard
        id="1"
        customerName="Akmal Rahimov"
        service="Soch olish"
        date="15 Noyabr, 2025"
        time="14:00"
        status="pending"
        barbershopName="Premium Barber Shop"
        isBarberView={true}
        onAccept={(id) => console.log('Accept:', id)}
        onReject={(id) => console.log('Reject:', id)}
      />
      <BookingCard
        id="2"
        customerName="Sardor Karimov"
        service="Soqol qirish"
        date="14 Noyabr, 2025"
        time="16:00"
        status="accepted"
        barbershopName="Classic Barber"
        isBarberView={false}
      />
    </div>
  );
}
