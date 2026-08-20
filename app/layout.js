import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';

export const metadata = {
  title: 'Azee Collections — Handcrafted Beaded Jewellery & Pearl Art',
  description: 'Discover exquisite handcrafted beaded jewellery, pearl art accessories, bracelets, necklaces, earrings & beaded bags from Azee Collections. Artisan quality, worldwide shipping.',
  keywords: 'handmade jewellery, beaded accessories, pearl art, Azee Collections, artisan necklace, beaded bracelet, earrings, beaded bags',
  openGraph: {
    title: 'Azee Collections — Handcrafted Beaded Jewellery & Pearl Art',
    description: 'Discover exquisite handcrafted beaded jewellery and pearl art accessories.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <CartDrawer />
              <Toast />
              <main>{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
