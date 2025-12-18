import { Inter } from "next/font/google";
import "./globals.css";
import ProductProvider from "@/context/ProductContext";
import OrderProvider from "@/context/OrderContext";
import UserProvider from "@/context/UserContext";
import AnalyticsProvider from "@/context/AnalyticsContext";
import PayoutProvider from "@/context/PayoutContext";
import DiscountProvider from "@/context/DiscountContext";
import ReviewProvider from "@/context/ReviewContext";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CampoSocial Seller Dashboard",
  description: "Manage your CampoSocial marketplace store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <OrderProvider>
              <ProductProvider>
                <AnalyticsProvider>
                  <PayoutProvider>
                    <DiscountProvider>
                      <ReviewProvider>
                        {children}
                        <Toaster position="top-right" />
                      </ReviewProvider>
                    </DiscountProvider>
                  </PayoutProvider>
                </AnalyticsProvider>
              </ProductProvider>
            </OrderProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
