"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Calendar } from "lucide-react";
import BudgetCards from "./BudgetCards";
import TimelineItinerary from "./TimelineItinerary";
import StayOptions from "./StayOptions";
import SpecialRecommendations from "./SpecialRecommendations";

const MapRoute = dynamic(() => import("./MapRoute"), { ssr: false });

interface TripDashboardProps {
  tripData: any;
  currency: string;
  onReset: () => void;
}

export default function TripDashboard({ tripData, currency, onReset }: TripDashboardProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStayIndex, setSelectedStayIndex] = useState(1); // Default to standard

  if (!tripData || !tripData.summary) {
    return <p>No trip data found.</p>;
  }

  const days = tripData.days || [];
  const currentDayPlan = days.find((d: any) => d.day_number === selectedDay) || days[0];

  const currencySymbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€" };
  const sym = currencySymbols[currency] || "$";

  // Dynamic cost calculations
  const stayOptions = tripData.summary.stay_options || [];
  const selectedStay = stayOptions[selectedStayIndex] || stayOptions[0] || {};
  
  const hotelCost = selectedStay.cost_per_night ? selectedStay.cost_per_night * days.length : 0;
  const baseExpenses = (tripData.summary.estimated_food_cost || 0) + 
                       (tripData.summary.estimated_travel_cost || 0) + 
                       (tripData.summary.estimated_activities_cost || 0);
                       
  const totalCost = hotelCost + baseExpenses;

  const dynamicSummary = {
    ...tripData.summary,
    estimated_hotel_cost: hotelCost,
    total_estimated_cost: totalCost,
    recommended_area: selectedStay.area || "Area"
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", animation: "fadeIn 0.8s ease-out" }}>
      <button 
        onClick={onReset} 
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "1rem" }}
      >
        <ArrowLeft size={18} /> New Plan
      </button>

      <StayOptions 
        options={stayOptions} 
        selectedIndex={selectedStayIndex} 
        onSelect={setSelectedStayIndex} 
        currencySym={sym} 
      />

      {tripData.summary.special_recommendations && (
        <SpecialRecommendations recommendations={tripData.summary.special_recommendations} currencySym={sym} />
      )}

      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "var(--accent-color)" }}>Your Trip Summary</h1>
      <BudgetCards summary={dynamicSummary} currency={currency} />

      <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "2rem" }}>
        {days.map((d: any) => (
          <button
            key={d.day_number}
            onClick={() => setSelectedDay(d.day_number)}
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "24px",
              background: selectedDay === d.day_number ? "var(--accent-color)" : "var(--bg-secondary)",
              color: selectedDay === d.day_number ? "white" : "var(--text-primary)",
              border: `1px solid ${selectedDay === d.day_number ? "var(--accent-color)" : "var(--border-color)"}`,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap"
            }}
          >
            <Calendar size={16} /> Day {d.day_number} - {sym}{d.total_daily_cost}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(350px, 1fr) 1fr", gap: "2rem", alignItems: "start" }}>
        <div style={{ height: "calc(100vh - 200px)", overflowY: "auto", paddingRight: "1rem" }}>
          <TimelineItinerary dayPlan={currentDayPlan} currency={currency} />
        </div>
        
        <div style={{ height: "calc(100vh - 200px)", position: "sticky", top: "2rem" }}>
           <MapRoute dayPlan={currentDayPlan} />
        </div>
      </div>
    </div>
  );
}
