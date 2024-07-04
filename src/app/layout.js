import { Inter } from "next/font/google";
import "./globals.css";
import ProductProvider from "./context/ProductContext";
import OrderProvider from "./context/OrderContext";
import UserProvider from "./context/UserContext"; // import UserProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vitapharm admin",
  description: "Admin portal to manage Vitapharm.co.ke",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider> {/* Wrap your application with UserProvider */}
        
              {children}
          
        </UserProvider>
      </body>
    </html>
  );
}
