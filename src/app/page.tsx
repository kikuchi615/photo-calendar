"use client";

import React, { useState, useEffect } from 'react';

// 日記データ（写真と文章のセット）の型定義
interface DiaryEntry {
  text: string;
  photo: string; // 写真を文字データ（Base64）として保存
}

interface DiaryData {
  [dateStr: string]: DiaryEntry;
}

export default function Home() {
  const [diaries, setDiaries] = useState<DiaryData>({});
  
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [photoInput, setPhotoInput] = useState(''); // 写真のプレビュー・保存用
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 保存データの読み込み
  useEffect(() => {
    const savedData = localStorage.getItem('my_photo_calendar_v1');
    if (savedData) {
      setDiaries(JSON.parse(savedData));
    }
  }, []);

  // 写真ファイルを選択したときの処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 写真が大きすぎると保存できないため、簡易チェック（2MB以下を推奨）
      if (file.size > 2 * 1024 * 1024) {
        alert("写真は2MB以下のものを選択してください。");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoInput(reader.result as string); // 写真を文字データに変換
      };
      reader.readAsDataURL(file);
    }
  };

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
      [selectedDate]: {
        text: textInput,
        photo: photoInput
      }
    };

    setDiaries(updatedDiaries);
    localStorage.setItem('my_photo_calendar_v1', JSON.stringify(updatedDiaries));

    setSelectedDate(null);
    setTextInput('');
    setPhotoInput('');
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} style={{ padding: '8px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = diaries[dateStr];
    const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    calendarCells.push(
      <div 
        key={dateStr} 
        onClick={() => {
          setSelectedDate(dateStr);
          setTextInput(entry?.text || '');
          setPhotoInput(entry?.photo || '');
          setError(null);
        }}
        style={{
          padding: '4px', border: '1px solid #e5e7eb', minHeight: '120px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', backgroundColor: isToday ? '#fffbeb' : '#fff',
          overflow: 'hidden'
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: isToday ? '#d97706' : '#6b7280' }}>{day}</span>
        
        {/* 写真の表示 */}
        {entry?.photo && (
          <img src={entry.photo} alt="daily" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '2px' }} />
        )}
        
        {/* 文章の表示 */}
        {entry?.text && (
          <div style={{ fontSize: '10px', color: '#374151', marginTop: '4px', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {entry.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>📸 フォトカレンダー日記</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={prevMonth} style={{ padding: '5px 10px', cursor: 'pointer' }}>◀</button>
          <span style={{ fontWeight: 'bold' }}>{year}年 {month + 1}月</span>
          <button onClick={nextMonth} style={{ padding: '5px 10px', cursor: 'pointer' }}>▶</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', backgroundColor: '#eee', border: '2px solid #eee' }}>
        {['日', '月', '火', '水', '木', '金', '土'].map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '5px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>{d}</div>
        ))}
        {calendarCells}
      </div>

      {selectedDate && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>{selectedDate} の記録</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>写真 (1枚)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {photoInput && <img src={photoInput} alt="preview" style={{ width: '100%', height: '150px', objectFit: 'cover', marginTop: '10px', borderRadius: '5px' }} />}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>短い文 (100文字以内)</label>
                <textarea 
                  value={textInput} onChange={(e) => setTextInput(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows={3}
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: textInput.length > 100 ? 'red' : '#999' }}>{textInput.length}/100</div>
              </div>

              {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedDate(null)} style={{ padding: '8px 15px' }}>キャンセル</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px' }}>保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}