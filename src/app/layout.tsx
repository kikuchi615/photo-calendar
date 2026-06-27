export const metadata = {
  title: 'シンプルカレンダー日記',
  description: '文字だけを記録するカレンダーアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, backgroundColor: '#f9fafb' }}>
        {children}
      </body>
    </html>
  )
}