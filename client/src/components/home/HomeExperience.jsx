import React from "react";
import { Link } from "react-router-dom";
import HomeHero from "./HomeHero";
import CategoriesSlider from "./CategoriesSlider";
import LoopOutPulse from "../LoopOutPulse";
import "./HomeExperience.css";

const text = (value, fallback = "") => value || fallback;

function SectionHeader({ eyebrow, title, action }) {
  return <div className="home-section-header"><div>{eyebrow && <p className="home-section-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action && <Link className="home-section-action" to={action.to}>{action.label}<span aria-hidden="true">→</span></Link>}</div>;
}

function DiscoveryCard({ item, index }) {
  const id = item?.id || item?._id || index;
  const to = item?.url || item?.link || (item?.id ? `/services/${item.id}` : "/services");
  return <Link to={to} className="home-discovery-card"><div className="home-discovery-card__image">{item?.image ? <img src={item.image} alt="" loading="lazy" /> : <span aria-hidden="true">✦</span>}</div><div className="home-discovery-card__body"><span className="home-discovery-card__type">{text(item?.category, "Service")}</span><h3>{text(item?.name || item?.title || item?.serviceName, "LoopOut service")}</h3>{item?.location && <p>📍 {item.location}</p>}</div></Link>;
}

export default function HomeExperience({ user, categories = [], recommended = [], nearby = [], upcomingBooking = null }) {
  return <main className="home-experience">
    <section className="home-hero-section"><HomeHero user={user} /></section>
    <section className="home-section home-categories-section"><SectionHeader eyebrow="Explore" title="What do you need today?" action={{ label: "View all", to: "/services" }} /><CategoriesSlider categories={categories} /></section>
    {upcomingBooking && <section className="home-section"><SectionHeader eyebrow="Your LoopOut" title="Your upcoming booking" action={{ label: "View bookings", to: "/bookings" }} /><div className="home-booking-card"><div className="home-booking-card__status">Upcoming booking</div><div className="home-booking-card__content"><div><h3>{text(upcomingBooking.serviceName || upcomingBooking.service, "Your service")}</h3><p>{text(upcomingBooking.date, "Date to be confirmed")}{upcomingBooking.time ? ` · ${upcomingBooking.time}` : ""}</p>{upcomingBooking.location && <p>📍 {upcomingBooking.location}</p>}</div><Link to="/bookings" className="home-button home-button--secondary">View booking</Link></div></div></section>}
    <section className="home-section home-pulse-section"><SectionHeader eyebrow="Live" title="What's happening around you" /><LoopOutPulse /></section>
    {recommended.length > 0 && <section className="home-section"><SectionHeader eyebrow="For you" title="Picked for you" action={{ label: "Explore more", to: "/services" }} /><div className="home-card-grid">{recommended.slice(0, 6).map((item, index) => <DiscoveryCard item={item} index={index} key={item?.id || item?._id || index} />)}</div></section>}
    {nearby.length > 0 && <section className="home-section"><SectionHeader eyebrow="Near you" title="Popular around you" action={{ label: "See nearby", to: "/services" }} /><div className="home-nearby-grid">{nearby.slice(0, 6).map((item, index) => <Link to={item?.url || item?.link || "/services"} className="home-nearby-card" key={item?.id || item?._id || index}><div className="home-nearby-card__icon">📍</div><div><h3>{text(item?.name || item?.title || item?.serviceName, "Local service")}</h3><p>{text(item?.location, "Available near you")}</p></div></Link>)}</div></section>}
    <section className="home-section home-explore-section"><SectionHeader eyebrow="Discover more" title="Explore LoopOut" /><div className="home-explore-grid"><Link to="/services" className="home-explore-card"><span>🛠️</span><strong>Services</strong><small>Find someone who can help</small></Link><Link to="/helpers" className="home-explore-card"><span>🤝</span><strong>Helpers</strong><small>People ready to help locally</small></Link><Link to="/listings" className="home-explore-card"><span>🏠</span><strong>Listings</strong><small>Discover things around you</small></Link><Link to="/events" className="home-explore-card"><span>🎟️</span><strong>Events</strong><small>See what's happening nearby</small></Link></div></section>
    <section className="home-trust-section"><div><p className="home-section-eyebrow">Why LoopOut?</p><h2>Local discovery you can feel good about.</h2><p>Find people, services and experiences nearby, communicate clearly, and make informed decisions through profiles and reviews.</p></div><div className="home-trust-grid"><div><span>✓</span><strong>Real profiles</strong><small>Know who you're dealing with.</small></div><div><span>★</span><strong>Reviews</strong><small>Learn from other customers.</small></div><div><span>⌖</span><strong>Local</strong><small>Discover what's around you.</small></div><div><span>♡</span><strong>Support</strong><small>We're here when you need us.</small></div></div></section>
  </main>;
}
