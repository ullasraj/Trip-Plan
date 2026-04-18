"use client";
import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import styles from './StayOptions.module.css';

export default function StayOptions({ options, selectedIndex, onSelect, currencySym }: { options: any[], selectedIndex: number, onSelect: (idx: number) => void, currencySym: string }) {
  if (!options || options.length === 0) return null;

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: "1rem", color: "var(--text-primary)", fontSize: "1.2rem" }}>Select Your Stay Option</h2>
      <div className={styles.grid}>
        {options.map((opt, idx) => (
          <div 
            key={idx} 
            className={`${styles.card} glass-panel ${selectedIndex === idx ? styles.active : ""}`}
            onClick={() => onSelect(idx)}
          >
            <div className={styles.header}>
              <div className={styles.iconWrapper}><Building2 size={24} /></div>
              <div className={styles.typeTag}>{opt.type}</div>
            </div>
            <h3>{opt.name}</h3>
            <p className={styles.area}><MapPin size={14} /> {opt.area}</p>
            <p className={styles.desc}>{opt.description}</p>
            <div className={styles.price}>
              <span>{currencySym}{opt.cost_per_night}</span> / night
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
