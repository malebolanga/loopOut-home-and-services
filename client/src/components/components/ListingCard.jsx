import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

export function ListingCard({ listing }) {
  return (
    <Link 
      to={`/listing/${listing._id}`}
      className="group block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-200 relative">
        <img
          src={listing.imageUrls[0]}
          alt={listing.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">{listing.name}</h3>
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400" />
            <span>{listing.rating?.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{listing.address}</p>
        <p className="mt-2">
          <span className="font-semibold">R{listing.regularPrice}</span>
          <span className="text-gray-500 text-sm">
            {listing.type === "rent" && "/month"}
          </span>
        </p>
      </div>
    </Link>
  );
}
