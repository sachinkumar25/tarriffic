# Consumer Basket Impact Component

## Overview
The `BasketImpact` component is an interactive visualization that demonstrates how tariffs affect household spending. It features a shopping cart/basket with product category icons that change color based on tariff levels, and a running total that updates in real-time.

## Features

### 🛒 Visual Shopping Basket
- 8 product categories with emoji icons
- Each category shows base price, tariff percentage, and adjusted cost
- Responsive grid layout that adapts to screen size

### 🎨 Dynamic Color Coding
- **Green** (`bg-green-100`): Low tariffs (<5%)
- **Yellow** (`bg-yellow-200`): Medium tariffs (5-10%)
- **Orange** (`bg-orange-300`): High tariffs (10-15%)
- **Red** (`bg-red-500`): Very high tariffs (>15%)

### 💰 Real-time Calculations
- Running total that updates as tariffs change
- Shows additional cost due to tariffs
- Smooth animations for number changes

### 🎛️ Interactive Controls
- Slider to simulate tariff increases (0-20%)
- Real-time updates across all components
- Visual feedback with color gradients

### 💡 Rich Tooltips
- Detailed information on hover
- Shows base price, tariff percentage, and adjusted cost
- Product descriptions for context

## Usage

```tsx
import BasketImpact from '@/components/BasketImpact';

function MyPage() {
  return (
    <div className="container mx-auto p-4">
      <BasketImpact />
    </div>
  );
}
```

## Data Structure

```typescript
interface BasketItem {
  id: string;
  label: string;
  icon: string;
  basePrice: number;
  tariff: number;
  description: string;
}
```

## Styling
- Uses Tailwind CSS for all styling
- Custom slider styles in `globals.css`
- Responsive design with mobile-first approach
- Gradient backgrounds and smooth transitions

## Future Enhancements

### 🔗 Backend Integration
- Connect to `/api/basket` endpoint for real HS4 data
- Fetch live tariff rates from government APIs
- Historical data for trend analysis

### 🤖 AI Analysis
- Click on category → AI analysis drawer
- GPT-powered insights on tariff impact
- Export analysis as PDF/PNG

### 📊 Advanced Features
- Regional price variations
- Seasonal adjustments
- Comparison with other countries
- Export functionality for judges

## API Endpoints

### GET `/api/basket`
Returns basket data with HS4 category mappings:
```json
{
  "items": [...],
  "metadata": {
    "totalCategories": 8,
    "averageTariff": 8.5,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/api/basket`
Updates basket data (future functionality)

## File Structure
```
src/
├── components/
│   ├── BasketImpact.tsx          # Main component
│   └── README-BasketImpact.md    # This documentation
├── app/
│   ├── basket/
│   │   └── page.tsx              # Basket page
│   └── api/
│       └── basket/
│           └── route.ts          # API endpoint
└── app/
    └── globals.css               # Custom slider styles
```

## Demo Features
- **Judge-friendly**: Clear visual impact with tooltips
- **Interactive**: Slider for real-time tariff simulation
- **Educational**: Shows real-world consumer impact
- **Professional**: Polished UI with smooth animations

Perfect for hackathon demos and trade policy education! 🎉
