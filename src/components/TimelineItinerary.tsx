"use client";
import React from 'react';
import { Clock, DollarSign, ArrowDown } from 'lucide-react';
import styles from './TimelineItinerary.module.css';

export default function TimelineItinerary({ dayPlan, currency = "USD" }: { dayPlan: any, currency?: string }) {
  const sym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$";

  if (!dayPlan || !dayPlan.activities) return <p>No activities planned for this day.</p>;

  return (
    <div className={styles.timeline}>
       {dayPlan.activities.map((activity: any, idx: number) => (
         <div key={idx} className={styles.timelineItem}>
           <div className={styles.timelinePoint}></div>
           <div className={`${styles.timelineContent} glass-panel`}>
             <div className={styles.header}>
               <h4>{activity.name}</h4>
               <span className={styles.time}>{activity.start_time} - {activity.end_time}</span>
             </div>
             <p className={styles.description}>{activity.description}</p>
             <div className={styles.meta}>
               <span><Clock size={16} /> {activity.visit_duration_minutes} min visit</span>
               {activity.cost > 0 && <span><DollarSign size={16} /> {sym}{activity.cost}</span>}
             </div>
             {activity.travel_time_to_next_minutes > 0 && (
                <div className={styles.travel}>
                  <ArrowDown size={14} className={styles.bounce} />
                  <span>{activity.travel_time_to_next_minutes} min travel to next destination</span>
                </div>
             )}
           </div>
         </div>
       ))}
    </div>
  );
}
