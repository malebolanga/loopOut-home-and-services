import React, { useMemo, useState } from "react";

const STEPS = ["Details", "Schedule", "Location", "Review"];

export default function BookingFlow({ initialData = {}, onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    location: "",
    notes: "",
    ...initialData,
  });

  const update = (key) => (event) =>
    setData((current) => ({ ...current, [key]: event.target.value }));

  const canContinue = useMemo(() => {
    if (step === 0) return data.name.trim() && data.phone.trim();
    if (step === 1) return data.date && data.time;
    if (step === 2) return data.location.trim();
    return true;
  }, [step, data]);

  const next = () => {
    if (canContinue) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const back = () => setStep((current) => Math.max(current - 1, 0));

  const submit = () => onSubmit?.(data);

  return (
    <div className="booking-flow" role="dialog" aria-modal="true" aria-labelledby="booking-flow-title">
      <div className="booking-flow__panel">
        <header className="booking-flow__header">
          <div>
            <p className="booking-flow__eyebrow">LoopOut booking</p>
            <h2 id="booking-flow-title">Book your service</h2>
          </div>
          <button type="button" className="booking-flow__close" onClick={onClose} aria-label="Close booking">
            ×
          </button>
        </header>

        <div className="booking-flow__progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((label, index) => (
            <React.Fragment key={label}>
              <div className={`booking-flow__step ${index <= step ? "is-active" : ""}`}>
                <span>{index + 1}</span>
                <small>{label}</small>
              </div>
              {index < STEPS.length - 1 && <div className={`booking-flow__line ${index < step ? "is-active" : ""}`} />}
            </React.Fragment>
          ))}
        </div>

        <main className="booking-flow__body">
          {step === 0 && (
            <section>
              <h3>Your details</h3>
              <p className="booking-flow__hint">Tell us who we are booking for.</p>
              <div className="booking-flow__grid">
                <label>Full name<input value={data.name} onChange={update("name")} autoComplete="name" placeholder="Your name" /></label>
                <label>Phone number<input value={data.phone} onChange={update("phone")} type="tel" autoComplete="tel" placeholder="+27 ..." /></label>
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h3>Choose a time</h3>
              <p className="booking-flow__hint">Pick the date and time that works best for you.</p>
              <div className="booking-flow__grid">
                <label>Date<input value={data.date} onChange={update("date")} type="date" /></label>
                <label>Time<input value={data.time} onChange={update("time")} type="time" /></label>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h3>Where should we meet?</h3>
              <p className="booking-flow__hint">Keep the address short and specific. You can add extra directions below.</p>
              <label>Service location<input value={data.location} onChange={update("location")} placeholder="Address or venue" /></label>
              <label className="booking-flow__notes">Additional notes<textarea value={data.notes} onChange={update("notes")} rows={4} placeholder="Parking, access instructions, special requests..." /></label>
            </section>
          )}

          {step === 3 && (
            <section>
              <h3>Review your booking</h3>
              <p className="booking-flow__hint">Check everything before sending your request.</p>
              <div className="booking-flow__summary">
                <div><span>Customer</span><strong>{data.name}</strong></div>
                <div><span>Phone</span><strong>{data.phone}</strong></div>
                <div><span>Date</span><strong>{data.date}</strong></div>
                <div><span>Time</span><strong>{data.time}</strong></div>
                <div><span>Location</span><strong>{data.location}</strong></div>
                {data.notes && <div><span>Notes</span><strong>{data.notes}</strong></div>}
              </div>
            </section>
          )}
        </main>

        <footer className="booking-flow__footer">
          {step > 0 ? <button type="button" className="booking-flow__secondary" onClick={back}>Back</button> : <span />}
          {step < STEPS.length - 1 ? (
            <button type="button" className="booking-flow__primary" onClick={next} disabled={!canContinue}>Continue</button>
          ) : (
            <button type="button" className="booking-flow__primary" onClick={submit}>Continue to WhatsApp</button>
          )}
        </footer>
      </div>
    </div>
  );
}
