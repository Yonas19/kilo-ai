import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useRouter } from 'expo-router';

import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '@/constants/firebase';
import { getTargetsFromGemini } from '@/lib/gemini';

// ---------- Helpers ----------
function formatDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function safeNum(v: any) {
  return typeof v === 'number' ? v : 0;
}

// ---------- Gemini API ----------
async function analyzeImageWithGemini(base64: string) {
  const GEMINI_KEY =
    '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';

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this food image. Return JSON only:
{"name":"food name","calories":123,"protein_g":10,"carbs_g":20,"fat_g":5,"fiber_g":2}`,
                },
                { inline_data: { mime_type: 'image/jpeg', data: base64 } },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    const match = text?.match(/\{[\s\S]*\}/);
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
    console.warn('Gemini failed, fallback:', err);
    return {
      name: 'Scanned Food',
      calories: 250,
      protein_g: 12,
      carbs_g: 30,
      fat_g: 10,
      fiber_g: 3,
    };
  }
}

// ---------- Main component ----------
export default function HomeScreen() {
  const router = useRouter();
  const [userDoc, setUserDoc] = useState<any>(null);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
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
      async (snap) => {
        const data = snap.exists() ? snap.data() : null;

        // Auto-generate AI targets if missing
        if (data && !data.calories) {
          const targets = await getTargetsFromGemini(data);
          await updateDoc(ref, {
            calories: targets.calories,
            protein: targets.protein_g,
            carbs: targets.carbs_g,
            fats: targets.fat_g,
            fiber: targets.fiber_g,
          });
          setUserDoc({ ...data, ...targets });
        } else {
          setUserDoc(data);
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
        setTodayLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.warn('logs snapshot error', err)
    );
    return () => unsub();
  }, [uid]);

  // Derived safe values
  const goals = userDoc && userDoc.calories ? {
    calories: safeNum(userDoc.calories),
    protein: safeNum(userDoc.protein),
    carbs: safeNum(userDoc.carbs),
    fats: safeNum(userDoc.fats),
    fiber: safeNum(userDoc.fiber),
  } : {
    calories: 1850,
    protein: 56,
    carbs: 200,
    fats: 70,
    fiber: 30,
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

  // Scan flow → goes to Preview
  const onPressScan = useCallback(async () => {
    if (!uid) return Alert.alert('Not signed in');

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Camera permission required');

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      const photo = result.assets[0];
      setScanning(true);

      // Send to preview screen for edit/save
      router.push({
        pathname: '/preview',
        params: { uri: photo.uri, base64: photo.base64 },
      });

      setScanning(false);
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

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6f8' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Top card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Calories left</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', marginTop: 6 }}>
                {left.calories} kcal
              </Text>
            </View>
            <AnimatedCircularProgress
              size={86}
              width={10}
              fill={goals.calories > 0 ? Math.min((consumed.calories / goals.calories) * 100, 100) : 0}
              tintColor="#14B8A6"
              backgroundColor="#eef2f4"
              rotation={0}
            >
              {() => <Text style={{ fontWeight: '700' }}>{Math.round(goals.calories > 0 ? (consumed.calories / goals.calories) * 100 : 0)}%</Text>}
            </AnimatedCircularProgress>
          </View>
        </View>

        {/* Macros */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          {[
            { key: 'Protein', color: '#EF4444', current: consumed.protein, goal: goals.protein },
            { key: 'Carbs', color: '#F59E0B', current: consumed.carbs, goal: goals.carbs },
            { key: 'Fats', color: '#3B82F6', current: consumed.fats, goal: goals.fats },
            { key: 'Fiber', color: '#10B981', current: consumed.fiber, goal: goals.fiber },
          ].map((m) => {
            const pct = m.goal > 0 ? Math.min((m.current / m.goal) * 100, 100) : 0;
            return (
              <View key={m.key} style={{ width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AnimatedCircularProgress
                    size={64}
                    width={8}
                    fill={pct}
                    tintColor={m.color}
                    backgroundColor="#f0f2f4"
                    rotation={0}
                  >
                    {() => <Text style={{ fontWeight: '700', fontSize: 12 }}>{m.current}/{m.goal}g</Text>}
                  </AnimatedCircularProgress>
                  <View style={{ marginLeft: 12 }}>
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
          {todayLogs.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
              <Text style={{ color: '#6b7280' }}>No foods logged yet. Tap + to add a food.</Text>
            </View>
          ) : todayLogs.map((it) => (
            <View key={it.id} style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#374151', fontWeight: '700' }}>IMG</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800' }}>{it.name ?? 'Scanned Food'}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>
                  {(it.calories ?? 0) + ' kcal • ' + (it.protein_g ?? 0) + 'g P • ' + (it.carbs_g ?? 0) + 'g C'}
                </Text>
              </View>
              <Text style={{ color: '#6b7280' }}>
                {it.createdAt ? new Date(it.createdAt.seconds * 1000).toLocaleTimeString() : ''}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating button */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' }}>
        <TouchableOpacity
        
          onPress={() => router.push("/ai-camera")}
          disabled={scanning}
          style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#14B8A6', alignItems: 'center', justifyContent: 'center' }}
        >
          {scanning ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 38, fontWeight: '900' }}>+</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
