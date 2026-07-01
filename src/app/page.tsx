"use client";

import React, { useState, useEffect } from 'react';

// 日記データ（日付：短い文）の型定義
interface DiaryData {
  [dateStr: string]: string;
}

export default function Home() {
  // 最初は空っぽの状態でスタート
  const [diaries, setDiaries] = useState<DiaryData>({});

  const [currentDate] = useState(new Date(2026, 5, 1)); // 2026年6月に固定
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 【新機能】アプリを開いたときに、PCに保存されているデータを自動で読み込む
  useEffect(() => {
    const savedData = localStorage.getItem('my_calendar_diaries');
    if (savedData) {
      setDiaries(JSON.parse(savedData));
    } else {
      // まだデータが何もない場合の初期サンプル
      const initialData = {
        "2026-06-01": "テスト投稿！今日はいい天気。",
        "2026-06-15": "お昼に美味しいラーメンを食べた。"
      };
      setDiaries(initialData);
      localStorage.setItem('my_calendar_diaries', JSON.stringify(initialData));
    }
  }, []);

  // 保存処理（制約：短文制限 ＋ 【新機能】PCへの永久保存）
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDate) return;

    // 【制約】100文字以上の長文は入力できないバリデーション
    if (textInput.length > 100) {
      setError("文章は100文字以内で入力してください。");
      return;
    }

    // 新しい日記データを作成
    const updatedDiaries = {
      ...diaries,
      [selectedDate]: textInput
    };

    // 画面の表示を更新
    setDiaries(updatedDiaries);

    // 【新機能】ブラウザ（PC）にデータを文字として保存する
    localStorage.setItem('my_calendar_diaries', JSON.stringify(updatedDiaries));

    // フォームを閉じる
    setSelectedDate(null);
    setTextInput('');
  };

  // カレンダーのマス目を生成
  const calendarCells = [];
  
  // 月の開始日前の空白マス
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(
      <div key={`empty-${i}`} style={{ padding: '8px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}></div>
    );
  }

  // 日付マス
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const text = diaries[dateStr];

    calendarCells.push(
      <div 
        key={dateStr} 
        onClick={() => {
          setSelectedDate(dateStr);
          setTextInput(text || '');
          setError(null);
        }}
        style={{
          padding: '8px',
          border: '1px solid #e5e7eb',
          minHeight: '100px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#fff'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>{day}</span>
        
        {/* 【受け入れ基準】日付の下に短い文を表示 */}
        {text && (
          <div style={{
            fontSize: '11px',
            color: '#4b5563',
            backgroundColor: '#eff6ff',
            padding: '4px',
            borderRadius: '4px',
            marginTop: '4px',
            wordBreak: 'break-all'
          }}>
            {text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>📅 保存機能付きカレンダー日記</h1>
        <p style={{ fontSize: '18px', color: '#4b5563' }}>{year}年 {month + 1}月</p>
      </header>

      {/* カレンダーのグリッド表示 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', 
        gap: '4px', 
        backgroundColor: '#f3f4f6', 
        padding: '8px', 
        borderRadius: '8px' 
      }}>
        {['日', '月', '火', '水', '木', '金', '土'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: '#6b7280', padding: '8px', fontSize: '14px' }}>{d}</div>
        ))}
        {calendarCells}
      </div>

      {/* 入力用ポップアップ */}
      {selectedDate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>{selectedDate} の一言</h2>
            
            <form onSubmit={handleSave}>
              <textarea 
                value={textInput} 
                onChange={(e) => setTextInput(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  boxSizing: 'border-box',
                  marginBottom: '4px'
                }}
                placeholder="今日の一言を入力（100文字以内）"
              />
              
              <span style={{ display: 'block', textAlign: 'right', fontSize: '12px', color: textInput.length > 100 ? 'red' : '#9ca3af', marginBottom: '12px' }}>
                {textInput.length} / 100文字
              </span>

              {error && (
                <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '6px', fontSize: '14px', marginBottom: '12px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setSelectedDate(null)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>キャンセル</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}