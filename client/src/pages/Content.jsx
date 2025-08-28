// eslint-disable-next-line no-unused-vars
import React from 'react'
import "../styles/ListingDetails.scss";
import { useEffect } from 'react';

    // Log component lifecycle events
    export default function Content() {
    useEffect(() => {
      console.log("Content component has mounted.");
  
      return () => {
        console.log("Content component has unmounted.");
      };
    }, []);






  return (
    <div>
      <div className="content-container">
      <h1 className="heading">How LoupeOut Home Works: Renting and Selling Properties</h1>
      <p className="subheading">
        Welcome to LoupeOut Home, your trusted partner in managing and monetizing real estate. Whether youre a homeowner, landlord, or investor, here’s how you can make the most out of our platform.
      </p>
    {/* Section 1 */}
    <section className="section">
        <h2 className="section-title">1. List Your Properties with Ease</h2>
        <p className="section-content">
          Create property listings in just a few clicks. Include important details like:
        </p>
        <ul className="list">
          <li className="list-item">- Property type (apartment, house, commercial space).</li>
          <li className="list-item">- Rental price or sale price.</li>
          <li className="list-item">- Features (bedrooms, bathrooms, amenities, etc.).</li>
          <li className="list-item">- High-quality images to attract potential renters or buyers.</li>
        </ul>
        <p className="section-content">
          Use our platform for on-the-go listing management.
        </p>
      </section>
       {/* Section 2 */}
       <section className="section">
        <h2 className="section-title">2. Reach Thousands of Potential Buyers and Renters</h2>
        <p className="section-content">
          LoupeOut Home connects you with a vast network of individuals searching for properties to rent or buy.
          Our intelligent matching system ensures your property is shown to the right audience.
        </p>
      </section>


      {/* Section 3 */}
      <section className="section">
        <h2 className="section-title">3. Make Money by Renting or Selling</h2>
        <p className="section-content">
          <strong>For Renters:</strong> Set competitive rental rates and let us help you find tenants quickly.
        </p>
        <p className="section-content">
          <strong>For Sellers:</strong> List your property for sale, and LoupeOut Home will help match you with serious buyers.
        </p>
        <p className="section-content">
          Earn a steady income from renting or secure a great deal when selling.
        </p>
      </section>

      {/* Section 4 */}
      <section className="section">
        <h2 className="section-title">4. Maximize Your Earnings with Insights</h2>
        <p className="section-content">Use our analytics tools to:</p>
        <ul className="list">
          <li className="list-item">- Monitor views and inquiries on your listings.</li>
          <li className="list-item">- Adjust pricing or promotional strategies based on data.</li>
          <li className="list-item">- Optimize property descriptions for better visibility.</li>
        </ul>
      </section>

        {/* Section 5 */}
        <section className="section">
        <h2 className="section-title">5. Safe and Secure Transactions</h2>
        <p className="section-content">
          LoupeOut Home prioritizes security with:
        </p>
        <ul className="list">
          <li className="list-item">- Verified user profiles for renters and buyers.</li>
          <li className="list-item">- A robust communication system to ensure transparency.</li>
          <li className="list-item">- Payment integrations for easy transactions.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="section">
        <h2 className="section-title">6. Manage Your Listings Seamlessly</h2>
        <p className="section-content">
          Edit, pause, or renew your property listings anytime with our platform.
          Stay updated with notifications about new inquiries or updates to your listings.
        </p>
      </section>
       {/* Section 7 */}
       <section className="section">
        <h2 className="section-title">7. Support at Every Step</h2>
        <img className="section-image" src="path/to/image7.jpg" alt="Customer support" />
        <p className="section-content">
          Our team is here to assist you, whether it’s setting up your first listing or closing a deal.
          Access tips, resources, and FAQs directly within the app.
        </p>
      </section>

   
</div>
</div>
    
  )

  
}