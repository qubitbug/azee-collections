// Utility functions for the Azee Collections store

/**
 * Format a number as currency
 */
export function formatCurrency(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Convert Google Drive shareable link to direct image URL
 */
export function convertGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
}

/**
 * Generate WhatsApp Order Link for Cart Items
 */
export function getWhatsAppOrderUrl(items = [], subtotal = 0, shipping = 0, customer = null, orderNumber = '') {
  const phoneNumber = '923462910394';
  let text = `Hello Azee Collections! 🛍️\nI would like to place an order:\n\n`;

  if (orderNumber) {
    text += `📦 *Order Number:* ${orderNumber}\n\n`;
  }

  if (customer) {
    text += `*Customer Details:*\n`;
    if (customer.fullName) text += `👤 *Name:* ${customer.fullName}\n`;
    if (customer.phone) text += `📞 *Phone:* ${customer.phone}\n`;
    if (customer.email) text += `✉️ *Email:* ${customer.email}\n`;
    if (customer.address) text += `🏠 *Address:* ${customer.address}, ${customer.city || ''}, ${customer.province || ''}\n`;
    if (customer.notes) text += `📝 *Notes:* ${customer.notes}\n`;
    text += `\n`;
  }

  text += `*Order Items:*\n`;
  items.forEach((item, index) => {
    text += `${index + 1}. *${item.name}* (x${item.quantity}) - Rs. ${(item.price * item.quantity).toLocaleString()}\n`;
    if (item.variantInfo) text += `   • Variant: ${item.variantInfo}\n`;
    if (item.customization) text += `   ✨ *Customization:* "${item.customization}"\n`;
  });

  const total = subtotal + shipping;
  text += `\n*Subtotal:* Rs. ${subtotal.toLocaleString()}`;
  text += `\n*Delivery Charges:* ${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}`;
  text += `\n*Total Amount:* Rs. ${total.toLocaleString()}\n\nPlease confirm my order. Thank you!`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp Order Link for Single Product
 */
export function getWhatsAppSingleProductUrl(product, quantity = 1, customization = '') {
  const phoneNumber = '923462910394';
  const priceTotal = (product.price || 0) * quantity;
  let text = `Hello Azee Collections! 🛍️\nI would like to order this item directly:\n\n*Product:* ${product.name}\n*Quantity:* ${quantity}\n*Price:* Rs. ${priceTotal.toLocaleString()}\n`;
  if (customization) {
    text += `✨ *Special Note / Customization:* "${customization}"\n`;
  }
  text += `\nPlease confirm availability and payment details. Thank you!`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate a URL-safe slug from a string
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a random order number
 */
export function generateOrderNumber() {
  const prefix = 'AZE';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items, coupon = null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discount = subtotal * (coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }
  }

  // Flat shipping Rs. 200 — free over Rs. 5000
  const shipping = subtotal >= 5000 ? 0 : 200;
  const total = subtotal - discount + shipping;

  return {
    subtotal: Math.max(0, subtotal),
    discount: Math.max(0, discount),
    shipping: Math.max(0, shipping),
    tax: 0,
    total: Math.max(0, total),
  };
}

/**
 * Truncate text to a given length
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get star rating display
 */
export function getStarRating(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return { full, hasHalf, empty };
}

/**
 * Debounce a function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get savings percentage
 */
export function getSavingsPercent(price, comparePrice) {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Local storage helper with SSR safety
 */
export const storage = {
  get(key, fallback = null) {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  },
  remove(key) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};
