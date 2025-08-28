/* eslint-disable no-undef */
/* eslint-disable react/jsx-key */
// eslint-disable-next-line no-unused-vars
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import 'react-slideshow-image/dist/styles.css';
import { Fade } from 'react-slideshow-image';
import ListingItem from '../components/ListingItem';



export default function Rent() {
  const [offerListings, setOfferListings] = useState([]);
 
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);
  console.log(offerListings);
  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=8');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=20');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
        try {
          const res = await fetch('/api/listing/get?type=sale&limit=4');
          const data = await res.json();
          setSaleListings(data);
        } catch (error) {
          log(error);
        }
      };
      fetchOfferListings();
    }, []);
  const slideImages = [
  
    {
      url: 'https://images.unsplash.com/photo-1724780997589-4c67b98491ee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  
     
    },
    
    {
      url: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      caption: 'Rent a Property ',
     
    },
   
  
  ];
  
  const divStyle = {
    display: 'flex',
    alignItems: "center",
    justifyContent: "center",
    height: "450px",
    backgroundSize: 'cover',
    
   
    
  }
  
  const spanStyle = {
    fontSize: "20px",
    background: "#efefef",
    color: "text-gray-400 text-xs sm:text-sm",
    
  }



  return (
    <div>
      {/* top */}
      
      <div className='flex flex-col gap-4 p-10 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl text-center lg:text-6xl'>
        Find Property to  <span className='text-slate-500'>Rent</span>
          <br />
          
        </h1>
        <div className='text-gray-400 text-xs sm:text-sm'>
        loupeOut Home, a rapidly expanding online community dedicated to connecting buyers and 
        renters with an extensive range of properties for sale and rent. 
        Our platform provides a comprehensive listing of properties, 
        empowering users to explore and find their ideal match.<br></br> <br></br>
        <p>
        Join loupeOut Home community today and discover a seamless way to buy, sell, or rent properties with ease.
        </p>
       
        
        </div>
        </div>


  
     <div className='slide-container font-semibold text-slate-700'>
           <Fade>
               {slideImages.map((image, index) => (
                <div key={index}>
                  <div style={{...divStyle, backgroundImage:`url(${image.url})`}}> 
                      <span style={spanStyle}>{image.caption}</span>
                  </div>

                </div>
               ))}
           </Fade>
      </div>

      <div className=' p-10 px-2 max-w-6xl  mx-auto'>

<ul className='flex gap-4 text-center'>
<div className='bg-white shadow-lg transition-shadow rounded-md h-50 w-60'>
<Link
   to={'/Rent'}
 
>
     <img className='bg-white  transition-shadow overflow-hidden  w-full sm:w-[330px]'
src="https://ryecroftglenton.com/wp-content/uploads/2019/07/c7aa6d3b-4d64-4ea3-87f0-b4d2ad4b070e.jpg"
alt="example"
/>
   <span  className='text-xs sm:text-sm text-slate-700 font-bold hover:underline'>Rent a home</span>
   <p className='text-gray-400 p-1 text-xs sm:text-sm'> Advertise your rental property on our site.</p>
</Link>

</div>


<div className='bg-white shadow-lg transition-shadow rounded-md h-50 w-60'>
<Link
  to={'/Search'}
  
>
    <img className='bg-white  transition-shadow overflow-hidden  w-full sm:w-[330px]'
src="https://st.depositphotos.com/1002709/2986/i/450/depositphotos_29865165-stock-photo-home-search.jpg"
alt="example"
/>
  <span  className='text-xs sm:text-sm text-slate-700 font-bold hover:underline'>Find a home</span>

   <p className='text-gray-400 p-1 text-xs sm:text-sm'>Find a rental space that you’ll love to seen </p>
</Link>
</div>


 <div className='bg-white shadow-lg transition-shadow rounded-md h-50 w-60'>
<Link
  to={'/Sale'}
  
>
    <img className='bg-white  transition-shadow overflow-hidden  w-full sm:w-[330px]'
src="https://www.ngfcu.us/files/ngfcu/1/banners/Interior-ProductPageImage_New_Home_975.jpg"
alt="example"
/>
    <span  className='text-xs sm:text-sm text-slate-700 font-bold hover:underline'>Sell a home</span> 
   <p className='text-gray-400 p-1 text-xs sm:text-sm'>Advertise with us,to be seen by millions of people. </p>
</Link>
</div>



<div className='bg-white shadow-lg hidden sm:inline transition-shadow rounded-md h-50 w-60'>
<Link
  to={'/'}
  
>
    <img className='bg-white  transition-shadow overflow-hidden  w-full sm:w-[330px]'
src="https://static.vecteezy.com/system/resources/previews/020/552/404/non_2x/map-pin-magnifying-glass-flat-design-illustration-vector.jpg"
alt="example"
/>
    <span  className='text-xs sm:text-sm text-slate-700 font-bold hover:underline'>Find Agsnts</span> 
   <p className='text-gray-400 p-1 text-xs sm:text-sm'>Well pair you with a best agent who has the inside scoop on your market.</p>
</Link>
</div>
</ul>

</div>
    
   
<div className="bg-white shadow-lg transition-shadow flex-col text-center p-4 sm:hidden">
        
        <h1 className='text-slate-700 text-center font-semibold'>List Independently</h1>
        <p className='text-gray-400 p-6 text-center text-xs sm:text-sm'>Reach a vast and engaged audience of potential buyers by showcasing your property on Loupeout Home.Making it an ideal destination for those looking to buy, sell, or rent properties.</p>
    
            <l className="p-5">
         <Link
              className='bg-red-400 h-40 w-40 text-xs sm:text-sm text-white p-3 rounded-lg  text-center hover:opacity-95'
              to={'/create-listing'}
            >
             Sell Proparty
            </Link>
            </l>
            <l>
            <Link
              className='bg-blue-400 text-xs sm:text-sm text-white p-3 rounded-lg text-center hover:opacity-95'
              to={'/create-listing'}
            >
              Rent Property
            </Link>
            </l>
            </div>
      

            <div className="bg-white flex-col p-6  sm:hidden">
        
        <h1 className='text-slate-700 text-center p-4 font-semibold'>Property Advices For:</h1>
            <div className='text-center'>
                    <l className="p-5">
                 <Link
                      className=' text-blue-900 text-xs sm:text-sm font-bold text-center hover:opacity-95'
                      to={'/Adiver'}
                    >
                     Selling 
                    </Link>
                    </l>
                    <l className="p-5">
                    <Link
                      className=' text-blue-900 font-bold  text-xs sm:text-sm  text-center hover:opacity-95'
                      to={'/Adiver'}
                    >
                      Renting 
                    </Link>
                    </l>
        
                    <l className="p-5">
                    <Link
                      className=' text-blue-900 font-bold text-xs sm:text-sm  text-center hover:opacity-95'
                      to={'/Adiver'}
                    >
                      Buying 
                    </Link>
                    </l>
                    </div>
                    </div>
     

      <div className=' p-0 px-2 max-w-6xl  mx-auto'>   

   
   
   
      {/* listing results for offer, sale and rent */}

      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-2'>
        {offerListings && offerListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent offers</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>Show more offers</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold p-4 text-center text-slate-600'>Recent places for rent</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>Show more places for rent</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}



       
      </div>


     
    </div>

</div>


    

  );
}
