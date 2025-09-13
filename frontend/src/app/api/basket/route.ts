import { NextResponse } from 'next/server';

// This endpoint can be expanded to fetch real HS4 category data
// For now, it returns the static basket items with enhanced data

export async function GET() {
  try {
    // In the future, this could query your database for real HS4 categories
    // and their associated tariffs based on current trade policies
    
    const basketData = {
      items: [
        {
          id: "food",
          label: "Food",
          icon: "🍞",
          basePrice: 250,
          tariff: 5,
          description: "Grocery items, fresh produce, packaged foods",
          hs4Categories: ["0101", "0102", "0103", "0201", "0202", "0203"],
          lastUpdated: new Date().toISOString()
        },
        {
          id: "clothing",
          label: "Clothing",
          icon: "👕",
          basePrice: 120,
          tariff: 8,
          description: "Apparel, shoes, accessories",
          hs4Categories: ["6101", "6102", "6103", "6201", "6202", "6203"],
          lastUpdated: new Date().toISOString()
        },
        {
          id: "electronics",
          label: "Electronics",
          icon: "📱",
          basePrice: 300,
          tariff: 12,
          description: "Smartphones, computers, home electronics",
          hs4Categories: ["8471", "8517", "8528", "8544", "9013", "9027"],
          lastUpdated: new Date().toISOString()
        },
        {
          id: "fuel",
          label: "Fuel",
          icon: "⛽",
          basePrice: 180,
          tariff: 15,
          description: "Gasoline, heating oil, energy costs",
          hs4Categories: ["2710", "2711", "2712", "2713", "2714", "2715"],
          lastUpdated: new Date().toISOString()
        },
        {
          id: "furniture",
          label: "Furniture",
          icon: "🪑",
          basePrice: 150,
          tariff: 6,
          description: "Home furniture, decor, household items",
          hs4Categories: ["9401", "9402", "9403", "9404", "9405"],
          lastUpdated: new Date().toISOString()
        },
        {
          id: "vehicles",
          label: "Vehicles",
          icon: "🚗",
          basePrice: 400,
          tariff: 10,
          description: "Cars, trucks, automotive parts",
          hs4Categories: ["8701", "8702", "8703", "8704", "8708"],
          lastUpdated: new Date().toISOString()
        },
        {
          id: "pharmaceuticals",
          label: "Medicine",
          icon: "💊",
          basePrice: 100,
          tariff: 3,
          description: "Prescription drugs, medical supplies",
          hs4Categories: ["3004", "3005", "3006", "9018", "9019"],
          lastUpdated: new Date().toISOString()
        },
        {
          id: "textiles",
          label: "Textiles",
          icon: "🧵",
          basePrice: 80,
          tariff: 9,
          description: "Fabrics, linens, home textiles",
          hs4Categories: ["5205", "5206", "5207", "5208", "5209"],
          lastUpdated: new Date().toISOString()
        }
      ],
      metadata: {
        totalCategories: 8,
        averageTariff: 8.5,
        lastUpdated: new Date().toISOString(),
        dataSource: "Static data - can be connected to real HS4 database",
        version: "1.0.0"
      }
    };

    return NextResponse.json(basketData);
  } catch (error) {
    console.error('Error fetching basket data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basket data' },
      { status: 500 }
    );
  }
}

// POST endpoint for updating basket items (future functionality)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In the future, this could update the basket with real-time tariff data
    // from your database or external APIs
    
    return NextResponse.json({
      message: 'Basket data updated successfully',
      timestamp: new Date().toISOString(),
      receivedData: body
    });
  } catch (error) {
    console.error('Error updating basket data:', error);
    return NextResponse.json(
      { error: 'Failed to update basket data' },
      { status: 500 }
    );
  }
}
