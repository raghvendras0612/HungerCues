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
  subtype: string;
  amount: string;
  setAmount: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  breastSide: 'Left' | 'Right';
  setBreastSide: (val: 'Left' | 'Right') => void;
  saving: boolean;
  onLog: () => Promise<void>;
  customTimeEnabled: boolean;
  setCustomTimeEnabled: (val: boolean) => void;
  customTime: string;
  setCustomTime: (val: string) => void;
}

export function FeedForm({
  subtype,
  amount,
  setAmount,
  duration,
  setDuration,
  notes,
  setNotes,
  breastSide,
  setBreastSide,
  saving,
  onLog,
  customTimeEnabled,
  setCustomTimeEnabled,
  customTime,
  setCustomTime,
}: Props) {
  return (
    <View>
      <View style={styles.formRow}>
        {subtype === 'Bottle' && (
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Amount (ml)</Text>
            <TextInput
              accessibilityLabel="Amount in milliliters"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        )}
        {subtype === 'Breast' && (
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Breast Side</Text>
            <View style={{ flexDirection: 'row', gap: 6, height: 42 }}>
              {['Left', 'Right'].map((side) => (
                <TouchableOpacity
                  key={side}
                  onPress={() => setBreastSide(side as 'Left' | 'Right')}
                  style={{
                    flex: 1,
                    backgroundColor: breastSide === side ? C.purple : '#EDEDEE',
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: breastSide === side ? '#FFF' : C.muted,
                      fontSize: 13,
                      fontWeight: '700',
                    }}
                  >
                    {side}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={styles.formField}>
          <Text style={styles.inputLabel}>Duration (min)</Text>
          <TextInput
            accessibilityLabel="Duration in minutes"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            style={styles.input}
          />
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
          <Text style={styles.logButtonText}>Save Feed</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  notesInput: { width: '100%' },
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
