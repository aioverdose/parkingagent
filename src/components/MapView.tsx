export default function MapView({
  latitude,
  longitude,
  label,
  className = "",
}: {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
}) {
  const query = encodeURIComponent(`${latitude},${longitude}`);
  const src = `https://maps.google.com/maps?q=${query}&z=16&output=embed`;

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-200 ${className}`}>
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: 250 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={label ?? "Parking spot location"}
      />
    </div>
  );
}
