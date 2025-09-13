import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Tariff Info | Tarrific",
  description:
    "Plain-English explanations of what tariffs are, how they work, and what happens when they’re imposed.",
}

export default function TariffInfoPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Top nav/back */}
        <div className="mb-6 text-sm">
          <Link href="/" className="text-blue-700 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="mb-2 text-4xl font-bold text-gray-900">Tariff Info</h1>
        <p className="mb-8 text-gray-700">
          A quick guide to tariffs: what they are, why governments use
          them, and how they ripple through prices, trade flows, and industries.
        </p>

        {/* What is a tariff */}
        <Card className="mb-6 bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle>What is a tariff?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-800">
            <p>
              A <strong>tariff</strong> is a tax a government charges on goods
              that enter the country. It’s applied at the border by customs when
              an importer brings in products.
            </p>
            <p>
              The <strong>legal payer</strong> is the importer. In practice,
              some or all of that cost can be passed along the chain—to
              wholesalers, retailers, and ultimately consumers—depending on
              market conditions.
            </p>
          </CardContent>
        </Card>

        {/* Why use tariffs */}
        <Card className="mb-6 bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle>Why do governments use tariffs?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-800">
            <ul className="list-disc pl-5">
              <li>
                <strong>Revenue:</strong> raise money (less common today in
                advanced economies).
              </li>
              <li>
                <strong>Protection:</strong> give local firms breathing room
                against cheaper imports.
              </li>
              <li>
                <strong>Trade policy:</strong> respond to another country’s
                actions or negotiate leverage.
              </li>
              <li>
                <strong>Remedies:</strong> address dumping or subsidies (via
                anti-dumping or countervailing duties).
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* What happens when imposed */}
        <Card className="mb-6 bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle>What happens when a tariff is imposed?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-800">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Landed cost rises.</strong> The import tax is added to
                the price at the border.
              </li>
              <li>
                <strong>Pricing decisions.</strong> Importers decide whether to
                absorb the cost, raise prices, or split the difference.
              </li>
              <li>
                <strong>Substitution.</strong> Buyers may switch to domestic
                goods or to foreign suppliers not hit by the tariff.
              </li>
              <li>
                <strong>Quantity adjusts.</strong> Imports usually fall; some
                trade re-routes through other countries or products.
              </li>
              <li>
                <strong>Ripple effects.</strong> Upstream industries (inputs) and
                downstream consumers feel price and availability changes.
              </li>
              <li>
                <strong>Macroeffects.</strong> Sectors expand or contract;
                inflation, employment, and GDP can move depending on the scale
                and duration.
              </li>
            </ol>
            <p className="text-sm text-gray-600">
              Who ultimately “pays” depends on competitive conditions—how easily
              consumers can switch (demand elasticity), how easily firms can
              change suppliers (supply elasticity), and market power along the
              chain.
            </p>
          </CardContent>
        </Card>

        {/* Types */}
        <Card className="mb-6 bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle>Common types of tariffs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-800">
            <ul className="list-disc pl-5">
              <li>
                <strong>Ad valorem:</strong> a percentage of the item’s value
                (e.g., 10%).
              </li>
              <li>
                <strong>Specific:</strong> a fixed amount per unit (e.g., $50
                per ton).
              </li>
              <li>
                <strong>Compound:</strong> combines percentage and per-unit.
              </li>
              <li>
                <strong>MFN vs. preferential:</strong> standard rate for most
                partners vs. lower rates under trade agreements.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Shockwaves */}
        <Card className="mb-6 bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle>How tariff “shockwaves” spread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-800">
            <p>
              Think of a tariff as a cost shock at the border. The shock moves
              through supply chains: importers → manufacturers → distributors →
              retailers → consumers. The size and speed of the shock depend on:
            </p>
            <ul className="list-disc pl-5">
              <li>
                <strong>Exposure:</strong> how import-intensive a product or
                industry is.
              </li>
              <li>
                <strong>Substitutability:</strong> how easily buyers can switch
                products or suppliers.
              </li>
              <li>
                <strong>Contracts & inventories:</strong> existing deals and
                stock can delay price changes.
              </li>
              <li>
                <strong>Policy duration:</strong> temporary vs. long-lived
                tariffs lead to different investments and sourcing choices.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-10 bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle>Quick answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-800">
            <div>
              <p className="font-semibold">Do consumers always pay?</p>
              <p>
                Not always. Sometimes importers or foreign exporters absorb part
                of the cost to keep market share. In tight markets with few
                substitutes, more of the cost reaches consumers.
              </p>
            </div>
            <div>
              <p className="font-semibold">Why not just switch suppliers?</p>
              <p>
                Switching takes time and money—finding new vendors, qualifying
                quality, retooling logistics, and renegotiating contracts. Many
                firms can switch only gradually.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                What’s the difference between a tariff and a quota?
              </p>
              <p>
                A tariff raises the price of imports; a quota caps the quantity.
                Both reduce import volumes, but tariffs raise revenue while
                quotas do not.
              </p>
            </div>
            <div>
              <p className="font-semibold">Who collects the tariff?</p>
              <p>
                The customs authority at the border. The importer pays at
                entry—often via a customs broker.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer back link */}
        <div className="text-center text-sm">
          <Link href="/" className="text-blue-700 hover:underline">
            Back to Globe
          </Link>
        </div>
      </div>
    </main>
  )
}
