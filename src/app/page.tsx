"use client";

import { useState } from "react";
import { PlaneTakeoff, Loader2, MapPin, Calendar, DollarSign, Heart } from "lucide-react";
import styles from "./page.module.css";
import TripDashboard from "../components/TripDashboard";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    destination: "",
    days: 3,
    budget: 10000,
    currency: "INR",
    interests: [] as string[],
  });

  const availableInterests = [
    "Beaches", "Adventure", "Nightlife", "Nature", "Food", "Culture",
    "Shopping", "History", "Relaxation", "Family Activities", "Romantic", "Wildlife", "Art", "Sports"
  ];
  const currencyOptions = [
    { value: "INR", label: "₹ INR" },
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate plan");
      }
      
      setTripData(data);
    } catch (error: any) {
      console.error("Failed to plan trip:", error);
      alert(`API Error: ${error.message} - Please verify your Gemini API key in .env.local and try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (tripData) {
    return <TripDashboard tripData={tripData} currency={formData.currency} onReset={() => setTripData(null)} />;
  }

  return (
    <main className={styles.main}>
      <div className={styles.heroBackground}>
        <div className={styles.glowBlob1}></div>
        <div className={styles.glowBlob2}></div>
      </div>
      
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <PlaneTakeoff size={32} color="var(--accent-color)" />
            <h1>Smart Trip Planner</h1>
          </div>
          <p className={styles.subtitle}>AI-powered budget itineraries explicitly built for you</p>
        </header>

        <form onSubmit={handleSubmit} className={`glass-panel ${styles.form}`}>
          <div className={styles.inputGroup}>
            <label><MapPin size={18} /> Destination</label>
            <input 
              type="text" 
              className={styles.inputField}
              placeholder="e.g., Tokyo, Japan" 
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label><Calendar size={18} /> Days</label>
              <input 
                type="number" 
                className={styles.inputField}
                min="1" 
                max="14"
                required
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Currency</label>
              <select 
                className={styles.inputField}
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label><DollarSign size={18} /> Total Budget</label>
              <input 
                type="number" 
                className={styles.inputField}
                min="10"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label><Heart size={18} /> Interests</label>
            <div className={styles.interestsGrid}>
              {availableInterests.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  className={`${styles.interestChip} ${formData.interests.includes(interest) ? styles.activeInterest : ""}`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading || formData.interests.length === 0 || !formData.destination}
          >
            {loading ? (
              <><Loader2 size={20} className={styles.spinner} /> Planning Your Trip...</>
            ) : (
              <><PlaneTakeoff size={20} /> Generate Itinerary</>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
