import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsApp Híbrido Bot - RRHH',
  description: 'Sistema administrador de RAG Bot para WhatsApp.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  )
}
