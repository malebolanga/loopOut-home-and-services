import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const updated = '18 September 2026';

export default function PrivacyPolicy() {
  const sections = [
    { title: 'Information we collect', body: <><p>We collect information you provide when you create an account, publish a listing, make a booking, contact support, or otherwise use LoopOut. This can include your name, email address, phone number, profile details, listing details, messages, booking details, and images you choose to upload.</p><p>We also collect device and usage information, such as app interactions, approximate location when you choose to provide it, IP address, browser or device type, and diagnostic information. Payment information is processed by payment providers; we do not store full card details on our servers.</p></> },
    { title: 'How we use information', body: <p>We use information to operate and improve the marketplace; create and manage accounts; publish listings; process bookings and payments; communicate with you; provide support; prevent fraud, abuse, and security incidents; and comply with legal obligations.</p> },
    { title: 'When we share information', body: <p>We share information with other LoopOut users when needed to provide a listing, service, or booking. We may also share information with service providers that help us host the service, process payments, deliver communications, analyse performance, or keep the platform secure. We may disclose information where required by law or to protect the rights, safety, and property of LoopOut and its users.</p> },
    { title: 'Your choices and rights', body: <p>You can update many account details from your profile. You may ask us to access, correct, delete, or export your personal information, subject to applicable law and records we need to retain for legal, tax, fraud-prevention, or transaction purposes. To make a request, use our <Link className="font-bold text-rose-600 underline underline-offset-2" to="/contact">contact page</Link>.</p> },
    { title: 'Data retention and security', body: <p>We retain information only for as long as reasonably necessary for the purposes described in this policy, including legal and accounting requirements. We use reasonable administrative, technical, and organisational safeguards, but no online service can guarantee absolute security.</p> },
    { title: 'Children', body: <p>LoopOut is not directed to children under 13. Do not use the service or provide personal information if you are under 13. If you believe a child has provided personal information, contact us so we can review and remove it where appropriate.</p> },
    { title: 'International users and updates', body: <p>Your information may be processed in countries where LoopOut or its service providers operate. We may update this policy from time to time. The updated version will be posted here with a new “Last updated” date.</p> },
    { title: 'Contact us', body: <p>For privacy questions or requests, email <a className="font-bold text-rose-600 underline underline-offset-2" href="mailto:malebolanga3@gmail.com">malebolanga3@gmail.com</a> or use the <Link className="font-bold text-rose-600 underline underline-offset-2" to="/contact">LoopOut contact page</Link>.</p> },
  ];

  return <LegalPageLayout eyebrow="Your data, clearly explained" title="Privacy made simple." intro="A clear explanation of what LoopOut collects, why we collect it, and the choices you have." updated={updated} sections={sections} relatedTo="/terms" relatedLabel="Read Terms of Service" />;
}
