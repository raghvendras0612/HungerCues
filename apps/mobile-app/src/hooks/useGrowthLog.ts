import { useState, useEffect } from 'react';
import { growthService } from '../services/growthService';
import type { Baby } from '../types';

interface Params {
  baby: Baby | null;
  unitSystem: 'metric' | 'imperial';
  onRefreshData: () => void;
}

export function useGrowthLog({ baby, unitSystem, onRefreshData }: Params) {
  const [showModal, setShowModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [customDateStr, setCustomDateStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  useEffect(() => {
    if (showModal) {
      setWeight('');
      setHeight('');
      setNotes('');
      setLogError(null);
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      setCustomDateStr(`${dd}/${mm}/${yyyy}`);
    }
  }, [showModal, unitSystem]); // added unitSystem to dependency to resolve warnings if system changes while open

  const parseDateString = (str: string): Date | null => {
    const parts = str.trim().split('/');
    if (parts.length !== 3) return null;
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1; // 0-indexed month
    const year = Number(parts[2]);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 2000 || year > 2100) {
      return null;
    }
    const d = new Date(year, month, day, 12, 0, 0, 0); // midday to avoid timezone shifts
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
      return null;
    }
    return d;
  };

  const handleSubmit = async () => {
    if (!baby || saving) return;
    setSaving(true);
    setLogError(null);
    let w_kg: number | null = null;
    let h_cm: number | null = null;
    if (weight.trim()) {
      const w_val = Number(weight);
      if (isNaN(w_val) || w_val <= 0) {
        setLogError('Weight must be a valid positive number');
        setSaving(false);
        return;
      }
      w_kg = unitSystem === 'metric' ? w_val : w_val / 2.20462;
    }
    if (height.trim()) {
      const h_val = Number(height);
      if (isNaN(h_val) || h_val <= 0) {
        setLogError('Height must be a valid positive number');
        setSaving(false);
        return;
      }
      h_cm = unitSystem === 'metric' ? h_val : h_val * 2.54;
    }
    if (w_kg === null && h_cm === null) {
      setLogError('Please enter at least one metric (weight or height).');
      setSaving(false);
      return;
    }
    const parsedDate = parseDateString(customDateStr);
    if (!parsedDate) {
      setLogError('Please enter a valid date in DD/MM/YYYY format');
      setSaving(false);
      return;
    }
    const growthTime = parsedDate;
    try {
      await growthService.createGrowth({
        baby_id: baby.id,
        recorded_at: growthTime.toISOString(),
        weight_kg: w_kg,
        height_cm: h_cm,
        notes: notes || null,
      });
      setShowModal(false);
      onRefreshData();
    } catch {
      setLogError('Could not save growth entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return {
    showModal,
    setShowModal,
    weight,
    setWeight,
    height,
    setHeight,
    notes,
    setNotes,
    customDateStr,
    setCustomDateStr,
    saving,
    logError,
    setLogError,
    handleSubmit,
  };
}
