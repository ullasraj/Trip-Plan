"use client";
import React from 'react';
import { Utensils, Star, Info, Activity } from 'lucide-react';
import styles from './SpecialRecommendations.module.css';

interface FoodRecommendation {
  name: string;
  average_price: number;
}

interface Recommendations {
  food_to_try: FoodRecommendation[];
  special_activities: string[];
  cultural_notes: string;
}

export default function SpecialRecommendations({ recommendations, currencySym }: { recommendations: Recommendations, currencySym: string }) {
  if (!recommendations) return null;

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: "1rem", color: "var(--text-primary)", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Star size={18} color="var(--accent-color)" /> Regional Specialties & Must-Dos
      </h2>
      <div className={styles.grid}>
        <div className={`${styles.card} glass-panel`}>
          <div className={styles.header}>
            <Utensils size={20} className={styles.icon} />
            <h3>Foods to Try</h3>
          </div>
          <ul className={styles.list}>
            {recommendations.food_to_try?.map((food, i) => (
              <li key={i} className={styles.foodItem}>
                <span className={styles.foodName}>{food.name}</span>
                <span className={styles.foodPrice}>{currencySym}{food.average_price}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={`${styles.card} glass-panel`}>
          <div className={styles.header}>
            <Activity size={20} className={styles.icon} />
            <h3>Special Activities</h3>
          </div>
          <ul className={styles.list}>
            {recommendations.special_activities?.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <div className={styles.header}>
            <Info size={20} className={styles.icon} />
            <h3>Local Highlights</h3>
          </div>
          <p className={styles.notes}>{recommendations.cultural_notes}</p>
        </div>
      </div>
    </div>
  );
}
