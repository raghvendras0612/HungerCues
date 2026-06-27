import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../../../constants/colors';
import { activityMeta } from '../../../constants/activityMeta';
import type { Activity } from '../../../types';

interface Props {
  activity: Activity;
  setActivity: (val: Activity) => void;
}

export function ActivityTabBar({ activity, setActivity }: Props) {
  return (
    <View style={styles.activityTabs}>
      {(Object.keys(activityMeta) as Activity[])
        .filter((key) => key !== 'growth')
        .map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActivity(key)}
            style={[styles.activityTab, activity === key && styles.activityTabActive]}
          >
            <View
              style={[styles.smallIconCircle, activity === key && styles.smallIconCircleActive]}
            >
              <Text>{activityMeta[key].icon}</Text>
            </View>
            <Text style={[styles.activityText, activity === key && styles.activityTextActive]}>
              {activityMeta[key].label}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  activityTabs: { flexDirection: 'row', marginBottom: 30 },
  activityTab: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#DEDEDE',
  },
  activityTabActive: { backgroundColor: C.card, borderRadius: 25 },
  smallIconCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconCircleActive: { backgroundColor: C.purpleSoft },
  activityText: { color: C.muted, fontSize: 16 },
  activityTextActive: { color: C.ink, fontWeight: '600' },
});
