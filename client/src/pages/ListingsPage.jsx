import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ListingsPage() {
  const { type } = useParams(); // Extract the type from the URL
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/listings?type=${type}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [type]);

  return (
    <div className="listings-page p-10">
      <h1 className="text-2xl font-bold mb-4">
        Listings for {type.charAt(0).toUpperCase() + type.slice(1)}
      </h1>

      {loading ? (
        <p>Loading listings...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className="p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{listing.name}</h2>
              <p>Price: {listing.offer ? `R${listing.offer}` : `R${listing.price}`}</p>
              <p>Location: {listing.address}</p>
              <button
                onClick={() => navigate(`/listing/${listing.id}`)}
                className="text-blue-500 hover:underline"
              >
                Show more
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No listings found for {type}.</p>
      )}
    </div>
  );
}
