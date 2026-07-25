import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bike, CheckCircle2, Clock3, MapPin, Minus, Plus, ShoppingBag, Store, UtensilsCrossed, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RESTAURANTS = [
  {
    id: 'urban-grill',
    name: 'Urban Grill',
    cuisine: 'Grill',
    distance: '1.2 km',
    time: '20–30 min',
    rating: '4.8',
    image: '🥙',
    meals: [
      { id: 'chicken-wrap', name: 'Chicken wrap', description: 'Grilled chicken, slaw and house sauce', price: 89, tag: 'Popular' },
      { id: 'beef-bowl', name: 'Beef rice bowl', description: 'Spiced beef, rice, salsa and greens', price: 109, tag: 'New' },
    ],
  },
  {
    id: 'green-table',
    name: 'The Green Table',
    cuisine: 'Healthy',
    distance: '2.1 km',
    time: '25–35 min',
    rating: '4.7',
    image: '🥗',
    meals: [
      { id: 'rainbow-bowl', name: 'Rainbow bowl', description: 'Roasted vegetables, grains and avocado', price: 95, tag: 'Vegetarian' },
      { id: 'caesar-salad', name: 'Chicken Caesar salad', description: 'Cos lettuce, parmesan and herb croutons', price: 105, tag: 'Fresh' },
    ],
  },
  {
    id: 'mama-kitchen',
    name: "Mama's Kitchen",
    cuisine: 'Local favourites',
    distance: '3.4 km',
    time: '30–40 min',
    rating: '4.9',
    image: '🍛',
    meals: [
      { id: 'chicken-pap', name: 'Chicken & pap', description: 'Grilled chicken, chakalaka and pap', price: 99, tag: 'Local favourite' },
      { id: 'beef-stew', name: 'Beef stew plate', description: 'Slow-cooked beef with rice and veg', price: 115, tag: 'Hearty' },
    ],
  },
];

const formatPrice = (price) => `R${price.toFixed(2)}`;

export default function LunchComingSoon() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('order');
  const [fulfilment, setFulfilment] = useState('pickup');
  const [restaurantId, setRestaurantId] = useState(RESTAURANTS[0].id);
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState('');
  const [booking, setBooking] = useState({ date: '', time: '12:30', guests: '2', name: '' });

  const restaurant = RESTAURANTS.find((item) => item.id === restaurantId);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const addToCart = (meal) => {
    setCart((items) => {
      const current = items.find((item) => item.id === meal.id);
      return current
        ? items.map((item) => item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...meal, quantity: 1 }];
    });
  };

  const updateQuantity = (mealId, change) => {
    setCart((items) => items
      .map((item) => item.id === mealId ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  };

  const submitOrder = () => {
    if (!cart.length) return;
    setNotice(`Your ${fulfilment} order at ${restaurant.name} is ready to review. Payments will be available at launch.`);
  };

  const submitBooking = (event) => {
    event.preventDefault();
    if (!booking.name || !booking.date) return;
    setNotice(`Table request sent to ${restaurant.name} for ${booking.guests} guests at ${booking.time}. Confirmation will be available at launch.`);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-amber-50 via-white to-orange-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

       

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <div className="flex rounded-2xl bg-amber-100 p-1.5">
              <button type="button" onClick={() => setMode('order')} className={`flex-1 rounded-xl py-3 text-sm font-black transition ${mode === 'order' ? 'bg-white text-amber-700 shadow-sm' : 'text-amber-800/70'}`}>
                <span className="inline-flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Order lunch</span>
              </button>
              <button type="button" onClick={() => setMode('table')} className={`flex-1 rounded-xl py-3 text-sm font-black transition ${mode === 'table' ? 'bg-white text-amber-700 shadow-sm' : 'text-amber-800/70'}`}>
                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> Book a table</span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {RESTAURANTS.map((item) => (
                <button key={item.id} type="button" onClick={() => setRestaurantId(item.id)} className={`w-full rounded-2xl border p-3 text-left transition ${restaurantId === item.id ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 'border-gray-200 bg-white hover:border-amber-200'}`}>
                  <span className="text-2xl">{item.image}</span>
                  <span className="mt-1 block text-sm font-black text-gray-900">{item.name}</span>
                  <span className="block text-xs text-gray-500">{item.cuisine} · ★ {item.rating}</span>
                </button>
              ))}
            </div>

            <article className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3"><span className="text-4xl">{restaurant.image}</span><div><h2 className="text-xl font-black text-gray-900">{restaurant.name}</h2><p className="mt-1 text-sm text-gray-500">{restaurant.cuisine} · ★ {restaurant.rating} · {restaurant.distance}</p></div></div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700"><Clock3 className="h-3.5 w-3.5" /> {restaurant.time}</span>
              </div>

              {mode === 'order' ? <>
                <div className="mt-6 flex gap-2">
                  {['pickup', 'delivery'].map((option) => <button key={option} type="button" onClick={() => setFulfilment(option)} className={`rounded-full px-4 py-2 text-xs font-black capitalize transition ${fulfilment === option ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600'}`}>{option === 'pickup' ? <Store className="mr-1 inline h-3.5 w-3.5" /> : <Bike className="mr-1 inline h-3.5 w-3.5" />}{option}</button>)}
                </div>
                <div className="mt-5 space-y-3">
                  {restaurant.meals.map((meal) => <div key={meal.id} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4"><div className="flex-1"><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">{meal.tag}</span><h3 className="mt-2 font-black text-gray-900">{meal.name}</h3><p className="mt-1 text-xs leading-5 text-gray-500">{meal.description}</p><p className="mt-2 text-sm font-black text-gray-900">{formatPrice(meal.price)}</p></div><button type="button" onClick={() => addToCart(meal)} className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-gray-950 shadow-sm transition hover:bg-amber-300" aria-label={`Add ${meal.name}`}><Plus className="h-5 w-5" /></button></div>)}
                </div>
              </> : <form onSubmit={submitBooking} className="mt-6 space-y-4"><p className="text-sm text-gray-600">Reserve your spot at <span className="font-bold text-gray-900">{restaurant.name}</span>.</p><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-gray-700">Your name<input required value={booking.name} onChange={(event) => setBooking({ ...booking, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none ring-amber-300 focus:ring-2" placeholder="Your full name" /></label><label className="text-sm font-bold text-gray-700">Date<input required type="date" value={booking.date} onChange={(event) => setBooking({ ...booking, date: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none ring-amber-300 focus:ring-2" /></label><label className="text-sm font-bold text-gray-700">Time<input type="time" value={booking.time} onChange={(event) => setBooking({ ...booking, time: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none ring-amber-300 focus:ring-2" /></label><label className="text-sm font-bold text-gray-700">Guests<select value={booking.guests} onChange={(event) => setBooking({ ...booking, guests: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none ring-amber-300 focus:ring-2">{[1, 2, 3, 4, 5, 6, 7, 8].map((number) => <option key={number}>{number}</option>)}</select></label></div><button type="submit" className="w-full rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-gray-800">Request a table</button></form>}
            </article>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-black text-gray-900">Your order</h2><ShoppingBag className="h-5 w-5 text-amber-600" /></div>
            {cart.length ? <><div className="mt-4 space-y-3">{cart.map((item) => <div key={item.id} className="flex items-center gap-2"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{formatPrice(item.price)}</p></div><button type="button" onClick={() => updateQuantity(item.id, -1)} className="rounded-full bg-gray-100 p-1"><Minus className="h-3.5 w-3.5" /></button><span className="w-4 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)} className="rounded-full bg-gray-100 p-1"><Plus className="h-3.5 w-3.5" /></button></div>)}</div><div className="mt-5 flex justify-between border-t border-gray-100 pt-4 text-base font-black text-gray-900"><span>Total</span><span>{formatPrice(total)}</span></div><button type="button" onClick={submitOrder} className="mt-4 w-full rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-black text-gray-950 transition hover:bg-amber-300">Review {fulfilment} order</button></> : <p className="mt-4 text-sm leading-6 text-gray-500">Choose a meal to add it to your order.</p>}
          </aside>
        </div>

        {notice && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex gap-3 rounded-2xl bg-green-50 p-4 text-sm font-semibold leading-6 text-green-800 ring-1 ring-green-200"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{notice}</motion.div>}
        <p className="mt-6 text-center text-xs text-gray-400">Lunch ordering and booking are shown with demo data while the feature is being prepared for launch.</p>
      </div>
    </main>
  );
}
