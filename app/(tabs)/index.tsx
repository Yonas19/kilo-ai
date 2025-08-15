// app/(tabs)/index.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useRouter } from 'expo-router';

import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../../constants/firebase'; // adjust if your path differs

// ---------- Helpers ----------
function formatDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function safeNum(v) {
  return typeof v === 'number' ? v : 0;
}

const DEFAULT_GOALS = {
  calories: 1850,
  protein: 56,
  carbs: 200,
  fats: 70,
  fiber: 30,
};

// ---------- OpenAI image analyze (best-effort) ----------
async function analyzeImageBase64(base64) {
  const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || global?.__OPENAI_KEY__;
  const prompt = `You are a nutrition assistant. Given an image (base64 truncated), return ONLY valid JSON like:
{"name":"Plate of rice and chicken","calories":250,"protein_g":12,"carbs_g":30,"fat_g":10,"fiber_g":2}
Do not include any commentary. Image base64 (prefix): ${base64.slice(0, 300)}`;

  if (!OPENAI_KEY) {
    console.warn('OpenAI key not found; using fallback estimate');
    return {
      name: 'Scanned Food',
      calories: 250,
      protein_g: 10,
      carbs_g: 30,
      fat_g: 10,
      fiber_g: 2,
    };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful nutrition assistant that returns ONLY JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('OpenAI error', res.status, text);
      throw new Error('OpenAI returned error');
    }

    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No content from OpenAI');

    // Extract first JSON object from model response
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : JSON.parse(text);

    return {
      name: parsed.name || 'Scanned Food',
      calories: Number(parsed.calories) || 0,
      protein_g: Number(parsed.protein_g) || 0,
      carbs_g: Number(parsed.carbs_g) || 0,
      fat_g: Number(parsed.fat_g) || 0,
      fiber_g: Number(parsed.fiber_g) || 0,
    };
  } catch (err) {
    console.warn('analyzeImageBase64 failed:', err);
    // fallback
    return {
      name: 'Scanned Food',
      calories: 300,
      protein_g: 12,
      carbs_g: 35,
      fat_g: 12,
      fiber_g: 3,
    };
  }
}

// ---------- Main component ----------
export default function HomeScreen() {
  const router = useRouter();
  const [userDoc, setUserDoc] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const uid = auth.currentUser?.uid;

  // Subscribe to user doc
  useEffect(() => {
    if (!uid) {
      router.replace('/login');
      return;
    }
    const ref = doc(db, 'users', uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setUserDoc(snap.data());
        } else {
          setUserDoc(null);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('user onSnapshot error', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  // Subscribe to today's logs
  useEffect(() => {
    if (!uid) return;
    const dayKey = formatDateKey();
    const logsRef = collection(db, 'users', uid, 'logs', dayKey, 'items');
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(30));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTodayLogs(items);
      },
      (err) => console.warn('logs snapshot error', err)
    );
    return () => unsub();
  }, [uid]);

  // Derived safe values
  const goals = {
    calories: safeNum(userDoc?.calories) || DEFAULT_GOALS.calories,
    protein: safeNum(userDoc?.protein) || DEFAULT_GOALS.protein,
    carbs: safeNum(userDoc?.carbs) || DEFAULT_GOALS.carbs,
    fats: safeNum(userDoc?.fats) || DEFAULT_GOALS.fats,
    fiber: safeNum(userDoc?.fiber) || DEFAULT_GOALS.fiber,
  };

  const consumed = {
    calories: safeNum(userDoc?.consumed?.calories),
    protein: safeNum(userDoc?.consumed?.protein),
    carbs: safeNum(userDoc?.consumed?.carbs),
    fats: safeNum(userDoc?.consumed?.fats),
    fiber: safeNum(userDoc?.consumed?.fiber),
  };

  const left = {
    calories: Math.max(goals.calories - consumed.calories, 0),
    protein: Math.max(goals.protein - consumed.protein, 0),
    carbs: Math.max(goals.carbs - consumed.carbs, 0),
    fats: Math.max(goals.fats - consumed.fats, 0),
    fiber: Math.max(goals.fiber - consumed.fiber, 0),
  };

  // Scan flow: camera -> analyze -> save log -> increment consumed in user doc
  const onPressScan = useCallback(async () => {
    if (!uid) return Alert.alert('Not signed in');

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera permission required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
      });

      if (result.cancelled) return;
      if (!result.base64) {
        Alert.alert('Failed to get image data');
        return;
      }

      setScanning(true);

      // analyze
      const analysis = await analyzeImageBase64(result.base64);

      // Save log
      const dayKey = formatDateKey();
      const logsCol = collection(db, 'users', uid, 'logs', dayKey, 'items');

      const logDoc = {
        name: analysis.name,
        calories: analysis.calories,
        protein_g: analysis.protein_g,
        carbs_g: analysis.carbs_g,
        fat_g: analysis.fat_g,
        fiber_g: analysis.fiber_g,
        createdAt: serverTimestamp(),
      };

      await addDoc(logsCol, logDoc);

      // Atomically increment consumed totals (nested fields)
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        'consumed.calories': increment(analysis.calories),
        'consumed.protein': increment(analysis.protein_g),
        'consumed.carbs': increment(analysis.carbs_g),
        'consumed.fats': increment(analysis.fat_g),
        'consumed.fiber': increment(analysis.fiber_g),
      });

      setScanning(false);
      Alert.alert('Logged', `${analysis.name} • ${analysis.calories} kcal`);
    } catch (err) {
      setScanning(false);
      console.warn('Scan error', err);
      Alert.alert('Scan failed', err?.message || String(err));
    }
  }, [uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading your plan…</Text>
      </View>
    );
  }

  // ---------- UI ----------
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6f8' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Top card: calories left */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14,
          shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Calories left</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', marginTop: 6 }}>{left.calories} kcal</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <AnimatedCircularProgress
                size={86}
                width={10}
                fill={goals.calories > 0 ? Math.min((consumed.calories / goals.calories) * 100, 100) : 0}
                tintColor="#14B8A6"
                backgroundColor="#eef2f4"
                rotation={0}
              >
                {() => (
                  <Text style={{ fontWeight: '700' }}>
                    {Math.round(goals.calories > 0 ? (consumed.calories / goals.calories) * 100 : 0) || 0}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>
        </View>

        {/* Macro cards grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          {[
            { key: 'Protein', color: '#EF4444', current: consumed.protein, goal: goals.protein },
            { key: 'Carbs', color: '#F59E0B', current: consumed.carbs, goal: goals.carbs },
            { key: 'Fats', color: '#3B82F6', current: consumed.fats, goal: goals.fats },
            { key: 'Fiber', color: '#10B981', current: consumed.fiber, goal: goals.fiber },
          ].map((m) => {
            const pct = m.goal > 0 ? Math.min((m.current / m.goal) * 100, 100) : 0;
            return (
              <View key={m.key} style={{
                width: '48%',
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AnimatedCircularProgress
                    size={64}
                    width={8}
                    fill={pct}
                    tintColor={m.color}
                    backgroundColor="#f0f2f4"
                    rotation={0}
                  >
                    {() => (
                      <Text style={{ fontWeight: '700', fontSize: 12, textAlign: 'center' }}>
                        {m.current}/{m.goal}g
                      </Text>
                    )}
                  </AnimatedCircularProgress>

                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontWeight: '800' }}>{m.key}</Text>
                    <Text style={{ color: '#6b7280', marginTop: 6 }}>{Math.max(m.goal - m.current, 0)} left</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recently logged */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontWeight: '800', fontSize: 18, marginBottom: 8 }}>Recently logged</Text>

          {todayLogs.length === 0 && (
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}>
              <Text style={{ color: '#6b7280' }}>No foods logged yet. Tap + to add a food.</Text>
            </View>
          )}

          {todayLogs.map((it) => (
            <View key={it.id} style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              marginBottom: 10,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}>
              <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                {/* Placeholder thumbnail; later replace with Storage URL */}
                <Text style={{ color: '#374151', fontWeight: '700' }}>IMG</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800' }}>{it.name ?? 'Scanned Food'}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>
                  {(it.calories ?? 0) + ' kcal • ' + (it.protein_g ?? 0) + 'g P • ' + (it.carbs_g ?? 0) + 'g C'}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#6b7280' }}>
                  {it.createdAt ? new Date(it.createdAt.seconds * 1000).toLocaleTimeString() : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* spacer so center button doesn't cover content */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating center-bottom button */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onPressScan}
          disabled={scanning}
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#14B8A6',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#14B8A6',
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {scanning ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 38, fontWeight: '900' }}>+</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
