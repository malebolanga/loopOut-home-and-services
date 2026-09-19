import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const updated = '18 September 2026';

export default function TermsOfService() {
  const sections = [
    { title: 'The LoopOut marketplace', body: <p>LoopOut provides a platform where users can discover, offer, and book accommodation, services, and other listings. Unless LoopOut expressly says otherwise, listings and services are provided by independent users or businesses, not by LoopOut.</p> },
    { title: 'Accounts and eligibility', body: <p>You must provide accurate account information, keep your login credentials secure, and notify us of unauthorised use. You are responsible for activity under your account. You may use LoopOut only if you can form a binding agreement under applicable law.</p> },
    { title: 'Listings, bookings, and payments', body: <p>Hosts and providers are responsible for the accuracy, availability, price, safety, and legality of their listings. Guests and customers are responsible for reviewing listing details before booking. Fees, cancellation terms, and other conditions displayed during a booking form part of that booking. Payment processing is provided by third-party payment providers and may be subject to their terms.</p> },
    { title: 'Acceptable use', body: <p>You must not post unlawful, misleading, discriminatory, infringing, unsafe, or fraudulent content; impersonate another person; interfere with the service; attempt unauthorised access; collect user data without permission; or use LoopOut in a way that harms users, providers, or the platform.</p> },
    { title: 'Your content', body: <p>You retain ownership of content you submit. You grant LoopOut a non-exclusive, worldwide, royalty-free licence to host, reproduce, display, and distribute that content as needed to operate, promote, and improve the service. You confirm that you have the rights needed to submit your content.</p> },
    { title: 'Suspension and termination', body: <p>We may suspend or terminate access where we reasonably believe these terms, the law, or the safety of the community have been breached. You may stop using the service at any time.</p> },
    { title: 'Disclaimers and liability', body: <p>LoopOut is provided on an “as is” and “as available” basis. We do not guarantee that listings are accurate or that a host, guest, provider, or customer will perform their obligations. To the extent permitted by law, LoopOut is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the marketplace.</p> },
    { title: 'Privacy and updates', body: <p>Our <Link className="font-bold text-rose-600 underline underline-offset-2" to="/privacy">Privacy Policy</Link> explains how we handle personal information. We may update these terms from time to time. Continued use after an updated version takes effect means that you accept the revised terms.</p> },
    { title: 'Contact', body: <p>For questions about these terms, email <a className="font-bold text-rose-600 underline underline-offset-2" href="mailto:malebolanga3@gmail.com">malebolanga3@gmail.com</a> or use the <Link className="font-bold text-rose-600 underline underline-offset-2" to="/contact">LoopOut contact page</Link>.</p> },
  ];

  return <LegalPageLayout eyebrow="The agreement between us" title="The rules that keep LoopOut trusted." intro="These terms explain how our marketplace works and what we each agree to when using it." updated={updated} sections={sections} relatedTo="/privacy" relatedLabel="Read Privacy Policy" />;
}
