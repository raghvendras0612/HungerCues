import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { C } from '../../../constants/colors';
import { CustomTimeSelector } from './CustomTimeSelector';

interface Props {
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (val: 'metric' | 'imperial') => void;
  weightInput: string;
  setWeightInput: (val: string) => void;
  heightInput: string;
  setHeightInput: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  saving: boolean;
  onLog: () => Promise<void>;
  customTimeEnabled: boolean;
  setCustomTimeEnabled: (val: boolean) => void;
  customTime: string;
  setCustomTime: (val: string) => void;
}

export function GrowthForm({
  unitSystem,
  setUnitSystem,
  weightInput,
  setWeightInput,
  heightInput,
  setHeightInput,
  notes,
  setNotes,
  saving,
  onLog,
  customTimeEnabled,
  setCustomTimeEnabled,
  customTime,
  setCustomTime,
}: Props) {
  return (
    <View>
      <View style={{ marginBottom: 10 }}>
        {/* Unit System Toggle */}
        <Text style={styles.inputLabel}>Unit System</Text>
        <View style={[styles.segmentRow, { marginBottom: 15 }]}>
          {[
            { key: 'metric', label: 'Metric (kg, cm)' },
            { key: 'imperial', label: 'Imperial (lbs, in)' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setUnitSystem(item.key as 'metric' | 'imperial')}
              style={[
                styles.segment,
                unitSystem === item.key && styles.segmentActive,
                { flex: 1, height: 38, minWidth: 0, paddingHorizontal: 0, borderRadius: 19 },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  unitSystem === item.key && styles.white,
                  { fontSize: 13, fontWeight: '700' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weight & Height Input Fields */}
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>
              Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
            </Text>
            <TextInput
              accessibilityLabel="Weight"
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="numeric"
              placeholder={unitSystem === 'metric' ? 'e.g. 5.4' : 'e.g. 12.0'}
              placeholderTextColor="#A9A9A9"
              style={styles.input}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>
              Height {unitSystem === 'metric' ? '(cm)' : '(in)'}
            </Text>
            <TextInput
              accessibilityLabel="Height"
              value={heightInput}
              onChangeText={setHeightInput}
              keyboardType="numeric"
              placeholder={unitSystem === 'metric' ? 'e.g. 58.2' : 'e.g. 23.0'}
              placeholderTextColor="#A9A9A9"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <CustomTimeSelector
        customTimeEnabled={customTimeEnabled}
        setCustomTimeEnabled={setCustomTimeEnabled}
        customTime={customTime}
        setCustomTime={setCustomTime}
      />

      <Text style={styles.inputLabel}>Notes (optional)</Text>
      <TextInput
        accessibilityLabel="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add a useful detail"
        placeholderTextColor="#A9A9A9"
        style={[styles.input, styles.notesInput]}
      />
      <TouchableOpacity
        disabled={saving}
        style={[styles.logButton, saving && styles.buttonDisabled]}
        onPress={() => void onLog()}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.logButtonText}>Save Growth</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    minWidth: 82,
    height: 50,
    paddingHorizontal: 17,
    borderRadius: 26,
    backgroundColor: '#DEDEDE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  segmentActive: { backgroundColor: C.purple },
  segmentText: { color: C.muted, fontSize: 15 },
  white: { color: '#FFF' },
  formRow: { flexDirection: 'row', gap: 10 },
  formField: { flex: 1 },
  inputLabel: { color: '#555', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 14,
    color: C.ink,
    fontSize: 14,
    marginBottom: 12,
  },
  notesInput: { width: '100%', marginBottom: 20 },
  logButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: C.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  logButtonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  buttonDisabled: { opacity: 0.55 },
});
