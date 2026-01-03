import './globals.css'

export const metadata = {
  title: 'Switchboard',
  description: 'Real. Local. Now.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-quicksand bg-[#C4A574] min-h-screen">
        {children}
      </body>
    </html>
  )
}
