"use client";
import React from "react";
import { DollarSign, Home, Coffee, Train, MapPin } from "lucide-react";
import styles from "./BudgetCards.module.css";

export default function BudgetCards({ summary, currency = "USD" }: { summary: any, currency?: string }) {
  const sym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$";

  const getPercentage = (cost: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((cost / total) * 100));
  };

  const total = summary.total_estimated_cost || 1;

  return (
    <div className={styles.grid}>
      <div className={`${styles.card} glass-panel`}>
        <div className={styles.iconWrapper}><MapPin /></div>
        <div className={styles.info}>
          <h3>Recommended Stay</h3>
          <p className={styles.areaAmount}>{summary.recommended_area}</p>
        </div>
      </div>

      <div className={`${styles.card} glass-panel`}>
        <div className={styles.iconWrapper}><Home /></div>
        <div className={styles.info}>
          <h3>Stay & Hotel</h3>
          <p className={styles.amount}>{sym}{summary.estimated_hotel_cost}</p>
          <div className={styles.barBg}>
             <div className={styles.barFill} style={{ width: `${getPercentage(summary.estimated_hotel_cost, total)}%`, background: "var(--accent-color)" }}></div>
          </div>
        </div>
      </div>

      <div className={`${styles.card} glass-panel`}>
         <div className={styles.iconWrapper}><Coffee /></div>
         <div className={styles.info}>
           <h3>Food & Dining</h3>
           <p className={styles.amount}>{sym}{summary.estimated_food_cost}</p>
           <div className={styles.barBg}>
             <div className={styles.barFill} style={{ width: `${getPercentage(summary.estimated_food_cost, total)}%`, background: "var(--warning)" }}></div>
          </div>
         </div>
      </div>
      
       <div className={`${styles.card} glass-panel`}>
         <div className={styles.iconWrapper}><Train /></div>
         <div className={styles.info}>
           <h3>Travel & Transit</h3>
           <p className={styles.amount}>{sym}{summary.estimated_travel_cost}</p>
           <div className={styles.barBg}>
             <div className={styles.barFill} style={{ width: `${getPercentage(summary.estimated_travel_cost, total)}%`, background: "var(--success)" }}></div>
          </div>
         </div>
      </div>
      
      <div className={`${styles.card} glass-panel`} style={{ background: "var(--accent-color)", color: "white", border: "none" }}>
        <div className={styles.iconWrapper} style={{ background: "rgba(255,255,255,0.2)", color: "white" }}><DollarSign /></div>
        <div className={styles.info}>
          <h3 style={{ color: "var(--bg-primary)" }}>Total Estimated</h3>
          <p className={styles.amount}>{sym}{summary.total_estimated_cost}</p>
        </div>
      </div>
    </div>
  );
}
