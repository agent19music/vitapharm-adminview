import { Inter } from "next/font/google";
import "./globals.css";
import ProductProvider from "./context/ProductContext";
import OrderProvider from "./context/OrderContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vitapharm admin",
  description: "Admin portal to manage Vitapharm.co.ke",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProductProvider>
          <OrderProvider>
            {children}
          </OrderProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
