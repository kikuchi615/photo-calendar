"use client";

import React, { useState, useEffect } from 'react';

// 日記データ（日付：短い文）の型定義
interface DiaryData {
  [dateStr: string]: string;
}

export default function Home() {
  const [diaries, setDiaries] = useState<DiaryData>({});
  
  // 今日の日付を取得して、最初の表示月に設定
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // データの読み込み
  useEffect(() => {
    const savedData = localStorage.getItem('my_calendar_diaries');
    if (savedData) {
      setDiaries(JSON.parse(savedData));
    }
  }, []);

  // 保存処理
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDate) return;

    if (textInput.length > 100) {
      setError("文章は100文字以内で入力してください。");
      return;
    }

    const updatedDiaries = {
      ...diaries,
      [selectedDate]: textInput
    };

    setDiaries(updatedDiaries);
    localStorage.setItem('my_calendar_diaries', JSON.stringify(updatedDiaries));

    setSelectedDate(null);
    setTextInput('');
  };

  // 【新機能】先月へ戻るボタンの処理
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 【新機能】次月へ進むボタンの処理
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // カレンダーのマス目を生成
  const calendarCells = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(
      <div key={`empty-${i}`} style={{ padding: '8px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}></div>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const text = diaries[dateStr];
    
    // 今日かどうかの判定（少し色を変えるため）
    const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
          backgroundColor: isToday ? '#fffbeb' : '#fff', // 今日なら薄い黄色に
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = isToday ? '#fffbeb' : '#fff'}
      >
        <span style={{ fontWeight: 'bold', color: isToday ? '#d97706' : '#374151', fontSize: '14px' }}>
          {day}
        </span>
        
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
      
      {/* 【変更点】ヘッダーに月切り替えボタンを追加 */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>📅 保存機能付きカレンダー日記</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', fontSize: '14px' }}>
            ◀ 先月
          </button>
          
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4b5563', minWidth: '100px', textAlign: 'center' }}>
            {year}年 {month + 1}月
          </span>
          
          <button onClick={nextMonth} style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', fontSize: '14px' }}>
            次月 ▶
          </button>
        </div>
      </header>

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

      {selectedDate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: