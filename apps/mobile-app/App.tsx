import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Backend Base URL
const BACKEND_URL = 'http://localhost:8000/api/v1';

// Types
interface FeedingLog {
  id?: number;
  type: string; // breast, bottle, pumping
  start_time: string;
  duration_minutes: number;
  quantity_ml?: number;
  notes?: string;
}

interface SleepSession {
  id?: number;
  sleep_start: string;
  sleep_end?: string;
  duration_minutes?: number;
  tracking_method: string;
  notes?: string;
}

interface AIInsight {
  summary: string;
  feeding_insights: string;
  sleep_insights: string;
  recommendations: string[];
}

export default function App() {
  // Demo State
  const [baby, setBaby] = useState({ id: 1, name: 'Charlie', birth_date: '2026-01-01', gender: 'Boy' });
  const [feedings, setFeedings] = useState<FeedingLog[]>([]);
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  
  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form States
  const [feedingType, setFeedingType] = useState('breast');
  const [feedingDuration, setFeedingDuration] = useState('15');
  const [feedingQuantity, setFeedingQuantity] = useState('100');
  const [feedingNotes, setFeedingNotes] = useState('');

  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepNotes, setSleepNotes] = useState('');

  // AI Assistant State
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);

  // Status and Loading
  const [backendOnline, setBackendOnline] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Check backend status & load initial logs
  useEffect(() => {
    checkBackendAndLoad();
  }, []);

  const checkBackendAndLoad = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`${BACKEND_URL.replace('/v1', '')}/health`, { method: 'GET' });
      if (response.ok) {
        setBackendOnline(true);
        // Load initial data
        await fetchBabiesAndLogs();
      } else {
        setBackendOnline(false);
        loadMockData();
      }
    } catch (e) {
      console.log('Backend offline, using local state / mock data');
      setBackendOnline(false);
      loadMockData();
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchBabiesAndLogs = async () => {
    try {
      const headers = { Authorization: 'Bearer mock-token', 'Content-Type': 'application/json' };
      // 1. Get Babies
      const babiesRes = await fetch(`${BACKEND_URL}/babies/`, { headers });
      if (babiesRes.ok) {
        const babiesData = await babiesRes.json();
        if (babiesData && babiesData.length > 0) {
          setBaby(babiesData[0]);
          const targetBabyId = babiesData[0].id;

          // 2. Get Feedings
          const feedingsRes = await fetch(`${BACKEND_URL}/feedings/baby/${targetBabyId}`, { headers });
          if (feedingsRes.ok) {
            setFeedings(await feedingsRes.json());
          }

          // 3. Get Sleep Sessions
          const sleepRes = await fetch(`${BACKEND_URL}/sleep/baby/${targetBabyId}`, { headers });
          if (sleepRes.ok) {
            setSleepSessions(await sleepRes.json());
          }
        }
      }
    } catch (err) {
      console.error('Error fetching logs from backend:', err);
    }
  };

  const loadMockData = () => {
    setFeedings([
      {
        id: 1,
        type: 'bottle',
        start_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        duration_minutes: 15,
        quantity_ml: 120,
        notes: 'Fed well, burped twice',
      },
      {
        id: 2,
        type: 'breast',
        start_time: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
        duration_minutes: 20,
        notes: 'Nursed both sides',
      },
    ]);
    setSleepSessions([
      {
        id: 1,
        sleep_start: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        sleep_end: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        duration_minutes: 60,
        tracking_method: 'manual',
        notes: 'Woke up happy',
      },
    ]);
  };

  // Timer Tick
  useEffect(() => {
    if (timerActive && timerStartTime) {
      timerIntervalRef.current = setInterval(() => {
        const diffMs = Date.now() - timerStartTime.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSecs / 3600).toString().padStart(2, '0');
        const mins = Math.floor((diffSecs % 3600) / 60).toString().padStart(2, '0');
        const secs = (diffSecs % 60).toString().padStart(2, '0');
        setElapsedTime(`${hours}:${mins}:${secs}`);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, timerStartTime]);

  // Actions
  const handleStartTimer = () => {
    setTimerStartTime(new Date());
    setTimerActive(true);
  };

  const handleStopTimer = async () => {
    if (!timerStartTime) return;
    const end = new Date();
    const duration = Math.max(1, Math.round((end.getTime() - timerStartTime.getTime()) / 60000));
    const newSession: SleepSession = {
      sleep_start: timerStartTime.toISOString(),
      sleep_end: end.toISOString(),
      duration_minutes: duration,
      tracking_method: 'timer',
      notes: 'Logged using live timer',
    };

    if (backendOnline) {
      try {
        const response = await fetch(`${BACKEND_URL}/sleep/`, {
          method: 'POST',
          headers: { Authorization: 'Bearer mock-token', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baby_id: baby.id,
            sleep_start: newSession.sleep_start,
            sleep_end: newSession.sleep_end,
            duration_minutes: newSession.duration_minutes,
            tracking_method: newSession.tracking_method,
            notes: newSession.notes,
          }),
        });
        if (response.ok) {
          await fetchBabiesAndLogs();
        }
      } catch (err) {
        console.error('Failed to save sleep timer log to backend:', err);
      }
    } else {
      setSleepSessions([newSession, ...sleepSessions]);
    }

    setTimerActive(false);
    setTimerStartTime(null);
    setElapsedTime('00:00:00');
  };

  const handleAddFeeding = async () => {
    const newFeeding: FeedingLog = {
      type: feedingType,
      start_time: new Date().toISOString(),
      duration_minutes: parseInt(feedingDuration) || 10,
      quantity_ml: feedingType !== 'breast' ? parseFloat(feedingQuantity) || 0 : undefined,
      notes: feedingNotes,
    };

    if (backendOnline) {
      try {
        const response = await fetch(`${BACKEND_URL}/feedings/`, {
          method: 'POST',
          headers: { Authorization: 'Bearer mock-token', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baby_id: baby.id,
            type: newFeeding.type,
            start_time: newFeeding.start_time,
            duration_minutes: newFeeding.duration_minutes,
            quantity_ml: newFeeding.quantity_ml,
            notes: newFeeding.notes,
          }),
        });
        if (response.ok) {
          await fetchBabiesAndLogs();
        }
      } catch (err) {
        console.error('Failed to add feeding log to backend:', err);
      }
    } else {
      setFeedings([newFeeding, ...feedings]);
    }

    setFeedingNotes('');
  };

  const handleAddManualSleep = async () => {
    const start = sleepStart ? new Date(sleepStart) : new Date(Date.now() - 60 * 60000);
    const end = sleepEnd ? new Date(sleepEnd) : new Date();
    const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    
    const newSession: SleepSession = {
      sleep_start: start.toISOString(),
      sleep_end: end.toISOString(),
      duration_minutes: duration,
      tracking_method: 'manual',
      notes: sleepNotes,
    };

    if (backendOnline) {
      try {
        const response = await fetch(`${BACKEND_URL}/sleep/`, {
          method: 'POST',
          headers: { Authorization: 'Bearer mock-token', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baby_id: baby.id,
            sleep_start: newSession.sleep_start,
            sleep_end: newSession.sleep_end,
            duration_minutes: newSession.duration_minutes,
            tracking_method: newSession.tracking_method,
            notes: newSession.notes,
          }),
        });
        if (response.ok) {
          await fetchBabiesAndLogs();
        }
      } catch (err) {
        console.error('Failed to save manual sleep log to backend:', err);
      }
    } else {
      setSleepSessions([newSession, ...sleepSessions]);
    }

    setSleepStart('');
    setSleepEnd('');
    setSleepNotes('');
  };

  const handleGetAIInsights = async () => {
    setLoadingAI(true);
    try {
      if (backendOnline) {
        const response = await fetch(`${BACKEND_URL}/ai/insights/${baby.id}`, {
          method: 'POST',
          headers: { Authorization: 'Bearer mock-token', 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const result = await response.json();
          setAiInsight(result);
          setLoadingAI(false);
          return;
        }
      }
      
      // Fallback/Mock response if offline or failed
      setTimeout(() => {
        setAiInsight({
          summary: `Here is a custom insight for ${baby.name}. Based on recent activities, Charlie is eating well on an average of 4-hour intervals and sleeping in structured naps.`,
          feeding_insights: `You logged both bottle and breast feeding. The average quantity is 120ml which is appropriate for a baby of Charlie's age (born ${baby.birth_date}).`,
          sleep_insights: `Sleep patterns show a 60-minute daytime nap. Try to establish a window of 90-120 minutes for morning/afternoon naps to optimize developmental growth.`,
          recommendations: [
            'Try to introduce a bedtime routine around 7:30 PM to extend night sleep.',
            'Keep pumping sessions consistent if supplementing breast milk.',
            'Observe sleep cues such as eye-rubbing and yawning to put Charlie down drowsy but awake.',
          ],
        });
        setLoadingAI(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setLoadingAI(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HungerCues</Text>
          <Text style={styles.headerSubtitle}>Baby tracker & Gemini Smart Assistant</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, backendOnline ? styles.badgeOnline : styles.badgeOffline]}>
              <Text style={styles.badgeText}>
                {backendOnline ? 'Backend Online (SQLite / Postgres)' : 'Offline Mode (Local Cache)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Baby Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Profile</Text>
          <View style={styles.babyInfoRow}>
            <View style={styles.babyAvatar}>
              <Text style={styles.babyAvatarText}>{baby.name.charAt(0)}</Text>
            </View>
            <View style={styles.babyMeta}>
              <Text style={styles.babyName}>{baby.name}</Text>
              <Text style={styles.babyDetail}>Gender: {baby.gender} • Born: {baby.birth_date}</Text>
            </View>
          </View>
        </View>

        {/* Live Sleep Timer Widget */}
        <View style={[styles.card, styles.highlightCard]}>
          <Text style={[styles.cardTitle, styles.whiteText]}>Live Sleep Tracker</Text>
          <Text style={styles.timerDisplay}>{elapsedTime}</Text>
          
          <View style={styles.timerBtnRow}>
            {!timerActive ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleStartTimer}>
                <Text style={styles.primaryBtnText}>Start Sleep Session</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.dangerBtn} onPress={handleStopTimer}>
                <Text style={styles.primaryBtnText}>Stop & Save Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Log Forms Grid (Feeding & Sleep) */}
        <View style={styles.grid}>
          {/* Feeding Card */}
          <View style={[styles.card, styles.gridItem]}>
            <Text style={styles.cardTitle}>Log Feeding</Text>
            
            <Text style={styles.label}>Feeding Type</Text>
            <View style={styles.typeSelector}>
              {['breast', 'bottle', 'pumping'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, feedingType === t && styles.activeTypeBtn]}
                  onPress={() => setFeedingType(t)}
                >
                  <Text style={[styles.typeBtnText, feedingType === t && styles.activeTypeBtnText]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={feedingDuration}
              onChangeText={setFeedingDuration}
              placeholder="e.g. 15"
              keyboardType="numeric"
            />

            {feedingType !== 'breast' && (
              <>
                <Text style={styles.label}>Quantity (ml)</Text>
                <TextInput
                  style={styles.input}
                  value={feedingQuantity}
                  onChangeText={setFeedingQuantity}
                  placeholder="e.g. 120"
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              value={feedingNotes}
              onChangeText={setFeedingNotes}
              placeholder="Any details (e.g. fussy, burped)"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddFeeding}>
              <Text style={styles.submitBtnText}>Add Feeding</Text>
            </TouchableOpacity>
          </View>

          {/* Manual Sleep Session */}
          <View style={[styles.card, styles.gridItem]}>
            <Text style={styles.cardTitle}>Manual Sleep Entry</Text>
            
            <Text style={styles.label}>Sleep Start Time</Text>
            <TextInput
              style={styles.input}
              value={sleepStart}
              onChangeText={setSleepStart}
              placeholder="YYYY-MM-DD HH:MM (e.g. 2026-06-18 10:00)"
            />

            <Text style={styles.label}>Sleep End Time</Text>
            <TextInput
              style={styles.input}
              value={sleepEnd}
              onChangeText={setSleepEnd}
              placeholder="YYYY-MM-DD HH:MM (e.g. 2026-06-18 11:30)"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              value={sleepNotes}
              onChangeText={setSleepNotes}
              placeholder="Notes (e.g. deep sleep, woke up crying)"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddManualSleep}>
              <Text style={styles.submitBtnText}>Add Sleep Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gemini Parenting Assistant */}
        <View style={[styles.card, styles.aiCard]}>
          <Text style={[styles.cardTitle, styles.purpleText]}>Gemini Parenting Assistant</Text>
          <Text style={styles.aiDescription}>
            Let Gemini analyze Charlie's sleep sessions and feeding logs to provide pediatric nursing advice.
          </Text>

          {loadingAI ? (
            <ActivityIndicator size="large" color="#6366f1" style={{ marginVertical: 20 }} />
          ) : aiInsight ? (
            <View style={styles.aiResponseContainer}>
              <Text style={styles.aiSectionTitle}>Overall Status</Text>
              <Text style={styles.aiBodyText}>{aiInsight.summary}</Text>
              
              <Text style={styles.aiSectionTitle}>Feeding Insights</Text>
              <Text style={styles.aiBodyText}>{aiInsight.feeding_insights}</Text>

              <Text style={styles.aiSectionTitle}>Sleep Insights</Text>
              <Text style={styles.aiBodyText}>{aiInsight.sleep_insights}</Text>

              <Text style={styles.aiSectionTitle}>Structured Suggestions</Text>
              {aiInsight.recommendations.map((rec, index) => (
                <Text key={index} style={styles.aiRecommendationItem}>
                  ✨ {rec}
                </Text>
              ))}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#6366f1', marginTop: 15 }]}
                onPress={handleGetAIInsights}
              >
                <Text style={styles.submitBtnText}>Refresh Insights</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.aiButton} onPress={handleGetAIInsights}>
              <Text style={styles.aiButtonText}>Generate Gemini Insights</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Activity Log Lists */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity Log</Text>
          {loadingLogs ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <View>
              {/* Feedings */}
              <Text style={styles.sectionHeader}>Feedings ({feedings.length})</Text>
              {feedings.length === 0 ? (
                <Text style={styles.emptyText}>No feedings logged yet.</Text>
              ) : (
                feedings.map((f, i) => (
                  <View key={i} style={styles.logItem}>
                    <View style={styles.logRow}>
                      <Text style={styles.logType}>
                        🍼 {f.type.toUpperCase()} • {f.duration_minutes}m
                      </Text>
                      {f.quantity_ml && <Text style={styles.logMeta}>{f.quantity_ml} ml</Text>}
                    </View>
                    <Text style={styles.logTime}>{new Date(f.start_time).toLocaleTimeString()}</Text>
                    {f.notes && <Text style={styles.logNotes}>"{f.notes}"</Text>}
                  </View>
                ))
              )}

              {/* Sleep Sessions */}
              <Text style={[styles.sectionHeader, { marginTop: 15 }]}>Sleep Sessions ({sleepSessions.length})</Text>
              {sleepSessions.length === 0 ? (
                <Text style={styles.emptyText}>No sleep logs yet.</Text>
              ) : (
                sleepSessions.map((s, i) => (
                  <View key={i} style={styles.logItem}>
                    <View style={styles.logRow}>
                      <Text style={styles.logType}>
                        😴 {s.tracking_method.toUpperCase()} Sleep
                      </Text>
                      {s.duration_minutes && <Text style={styles.logMeta}>{s.duration_minutes}m</Text>}
                    </View>
                    <Text style={styles.logTime}>
                      From {new Date(s.sleep_start).toLocaleTimeString()} to{' '}
                      {s.sleep_end ? new Date(s.sleep_end).toLocaleTimeString() : 'Ongoing'}
                    </Text>
                    {s.notes && <Text style={styles.logNotes}>"{s.notes}"</Text>}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  container: {
    padding: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8b9bb4',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeContainer: {
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeOnline: {
    backgroundColor: '#10b981',
  },
  badgeOffline: {
    backgroundColor: '#3b82f6',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#161f30',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#233044',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 15,
  },
  whiteText: {
    color: '#ffffff',
  },
  purpleText: {
    color: '#a5b4fc',
  },
  babyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyAvatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  babyMeta: {
    marginLeft: 15,
  },
  babyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  babyDetail: {
    color: '#8b9bb4',
    fontSize: 14,
    marginTop: 2,
  },
  highlightCard: {
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    marginVertical: 15,
  },
  timerBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  dangerBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: Platform.OS === 'web' ? 0.485 : 1,
  },
  label: {
    color: '#8b9bb4',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#233044',
    marginBottom: 15,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#233044',
  },
  activeTypeBtn: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  typeBtnText: {
    color: '#8b9bb4',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTypeBtnText: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  aiCard: {
    backgroundColor: '#1e1b4b',
    borderColor: '#312e81',
  },
  aiDescription: {
    color: '#c7d2fe',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  aiButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  aiResponseContainer: {
    backgroundColor: '#11103a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  aiSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a5b4fc',
    marginTop: 12,
    marginBottom: 4,
  },
  aiBodyText: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
  },
  aiRecommendationItem: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
    marginVertical: 4,
    paddingLeft: 5,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8b9bb4',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#233044',
    paddingBottom: 4,
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  logItem: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  logMeta: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '700',
  },
  logTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  logNotes: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
