import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HomeHero from "./HomeHero";
import CategoriesSlider from "./CategoriesSlider";
import LoopOutPulse from "../LoopOutPulse";
import { TOP_CATEGORIES } from "../../data/categories";
import { authenticatedFetch } from "../../utils/authenticatedFetch";
import "./HomeExperience.css";

const text = (value, fallback = "") => value || fallback;

function SectionHeader({ eyebrow, title, action }) {
  return <div className="home-section-header"><div>{eyebrow && <p className="home-section-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action && <Link className="home-section-action" to={action.to}>{action.label}<span aria-hidden="true">→</span></Link>}</div>;
}

function DiscoveryCard({ item, index }) {
  const to = item?.url || item?.link || (item?.id ? `/service/${item.id}` : "/services");
  return <Link to={to} className="home-discovery-card"><div className="home-discovery-card__image">{item?.image || item?.imageUrls?.[0] ? <img src={item.image || item.imageUrls[0]} alt="" loading="lazy" /> : <span aria-hidden="true">✦</span>}</div><div className="home-discovery-card__body"><span className="home-discovery-card__type">{text(item?.category || item?.type, "Service")}</span><h3>{text(item?.name || item?.title || item?.serviceName, "LoopOut service")}</h3>{(item?.location || item?.address) && <p>📍 {item.location || item.address}</p>}</div></Link>;
}

export default function HomeExperience() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user || {});
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!currentUser?._id) return;
    const controller = new AbortController();
    authenticatedFetch(`/api/bookings/user/${currentUser._id}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : [])
      .then((bookings) => {
        const now = new Date();
        const active = Array.isArray(bookings) ? bookings.filter((b) => {
          const date = new Date(b.startDate || b.date || b.createdAt);
          return date >= now && !['cancelled', 'completed', 'declined'].includes(b.status);
        }).sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date)) : [];
        setUpcomingBooking(active[0] || null);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [currentUser?._id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const responses = await Promise.allSettled([fetch('/api/services?limit=6'), fetch('/api/helpers?limit=6')]);
        const merged = [];
        for (const result of responses) {
          if (result.status !== 'fulfilled' || !result.value.ok) continue;
          const data = await result.value.json();
          const items = Array.isArray(data) ? data : (data.services || data.helpers || data.items || []);
          merged.push(...items);
        }
        if (!cancelled) setRecommendations(merged.slice(0, 6));
      } catch (_) {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return <main className="home-experience">
    <section className="home-hero-section"><HomeHero navigate={navigate} /></section>
    <section className="home-section home-categories-section"><SectionHeader eyebrow="Explore" title="What do you need today?" action={{ label: "View all", to: "/categories" }} /><CategoriesSlider navigate={navigate} TOP_CATEGORIES={TOP_CATEGORIES} /></section>
    {upcomingBooking && <section className="home-section"><SectionHeader eyebrow="Your LoopOut" title="Your upcoming booking" action={{ label: "View bookings", to: "/upcoming-bookings" }} /><div className="home-booking-card"><div className="home-booking-card__status">Upcoming booking · {text(upcomingBooking.status, "pending")}</div><div className="home-booking-card__content"><div><h3>{text(upcomingBooking.listing?.name || upcomingBooking.helper?.name || upcomingBooking.service?.name || upcomingBooking.event?.name, "Your booking")}</h3><p>{upcomingBooking.startDate ? new Date(upcomingBooking.startDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : 'Date to be confirmed'}</p></div><Link to="/upcoming-bookings" className="home-button home-button--secondary">View booking</Link></div></div></section>}
    <section className="home-section home-pulse-section"><SectionHeader eyebrow="Live" title="What's happening around you" /><LoopOutPulse /></section>
    {recommendations.length > 0 && <section className="home-section"><SectionHeader eyebrow="For you" title="Discover services nearby" action={{ label: "Explore more", to: "/services" }} /><div className="home-card-grid">{recommendations.map((item, index) => <DiscoveryCard item={item} index={index} key={item?.id || item?._id || index} />)}</div></section>}
    <section className="home-section home-explore-section"><SectionHeader eyebrow="Discover more" title="Explore LoopOut" /><div className="home-explore-grid"><Link to="/services" className="home-explore-card"><span>🛠️</span><strong>Services</strong><small>Find someone who can help</small></Link><Link to="/helper-home-page" className="home-explore-card"><span>🤝</span><strong>Helpers</strong><small>People ready to help locally</small></Link><Link to="/listing-home-page" className="home-explore-card"><span>🏠</span><strong>Listings</strong><small>Discover places around you</small></Link><Link to="/event-home-page" className="home-explore-card"><span>🎟️</span><strong>Events</strong><small>See what's happening nearby</small></Link></div></section>
    <section className="home-trust-section"><div><p className="home-section-eyebrow">Why LoopOut?</p><h2>Local discovery you can feel good about.</h2><p>Discover people, services and experiences nearby, then make better decisions through profiles, reviews and clear booking information.</p></div><div className="home-trust-grid"><div><span>✓</span><strong>Real profiles</strong><small>Know who you're dealing with.</small></div><div><span>★</span><strong>Reviews</strong><small>Learn from other customers.</small></div><div><span>⌖</span><strong>Local discovery</strong><small>Find what's around you.</small></div><div><span>♡</span><strong>Support</strong><small>We're here when you need us.</small></div></div></section>
  </main>;
}
