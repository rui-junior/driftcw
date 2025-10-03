// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

// export const metadata: Metadata = {
//   title: "Simulação de Deriva Marítima - SAROPS",
//   description: "Sistema de simulação de deriva marítima baseado no SAROPS da Guarda Costeira Americana",
//   keywords: ["deriva marítima", "SAROPS", "busca e resgate", "simulação", "oceanografia"],
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="pt-BR">
//       <body className={`${inter.variable} antialiased`}>
//         {children}
//       </body>
//     </html>
//   );
// }
import { Inter } from "next/font/google"
import Provider from "../providers/chakra-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={inter.className} suppressHydrationWarning>
      <head />
      <body className={`${inter} antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}