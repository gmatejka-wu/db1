export const MetricsOverview = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Key Metrics Dashboard Overview
        </h2>
        <p className="text-gray-600">
          Practical guide for interpreting commodity prices and making strategic
          decisions
        </p>
      </div>

      {/* LENZING SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-green-600 text-white px-4 py-3 font-semibold">
          LENZING AG (Textile Fibers) - Materials Dashboard
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Variable
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  What It Is
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Typical Range
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  How to Read It
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    DWP Hardwood
                  </span>
                </td>
                <td className="px-4 py-3">Raw wood pulp cost (main input)</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    $850-1,100/ton
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Squeeze on margins, consider
                    hedging
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Opportunity to increase
                    production or build inventory
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">VSF High</span>
                </td>
                <td className="px-4 py-3">
                  Selling price for premium viscose fiber
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    ¥12,000-15,000/ton
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Strong demand, maximize
                    production
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Market weakness, focus on cost
                    control
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    DWP/VSF Spread
                  </span>
                </td>
                <td className="px-4 py-3">Profit margin indicator</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    45-65%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      &gt;60%
                    </span>{" "}
                    Excellent margins - invest/expand
                  </div>
                  <div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                      &lt;45%
                    </span>{" "}
                    Margin pressure - review costs
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    Cotton (ICE)
                  </span>
                </td>
                <td className="px-4 py-3">Competing product benchmark</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    $0.70-0.95/lb
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Viscose becomes more attractive -
                    pricing power
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Competition intensifies - focus
                    on sustainability angle
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Interpretation Box */}
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">
              📊 Example Scenario: Current Reading
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span>
                  DWP at $1,050 (up 15% in 3 months) + VSF at ¥13,000 (flat) ={" "}
                  <strong>Margins compressing</strong>
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span>
                  Cotton at $0.92/lb (20-month high) ={" "}
                  <strong>Opportunity for price increases</strong>
                </span>
              </div>
            </div>
            <div className="mt-3 bg-blue-50 border-2 border-blue-300 rounded p-3">
              <div className="font-semibold text-blue-900 mb-1">
                💡 Strategic Decision:
              </div>
              <div className="text-sm space-y-1">
                <div>• Implement 5-8% price increase on VSF contracts</div>
                <div>• Lock in Q2-Q3 wood pulp prices via futures</div>
                <div>
                  • Shift marketing to emphasize viscose vs. expensive cotton
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEMPERIT SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-orange-600 text-white px-4 py-3 font-semibold">
          SEMPERIT AG (Rubber Products) - Chemicals Dashboard
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Variable
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  What It Is
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Typical Range
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  How to Read It
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    Rubber TSR 20
                  </span>
                </td>
                <td className="px-4 py-3">Natural rubber (gloves, seals)</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    $1,400-1,800/ton
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Pass through to medical glove
                    prices
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Improve margins or gain market
                    share
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">Butadiene</span>
                </td>
                <td className="px-4 py-3">Synthetic rubber component</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    €900-1,400/ton
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Switch product mix to natural
                    rubber items
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Opportunity for synthetic-heavy
                    products
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">HFO 1%</span>
                </td>
                <td className="px-4 py-3">Energy costs for production</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    $450-650/ton
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Energy efficiency projects become
                    priority
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Competitive advantage vs.
                    high-cost producers
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Interpretation Box */}
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">
              📊 Example Scenario: Input Cost Shock
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span>Rubber TSR at $1,750 (near 2-year high)</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span>Butadiene at €1,350 (up 20% YTD)</span>
              </div>
            </div>
            <div className="mt-3 bg-blue-50 border-2 border-blue-300 rounded p-3">
              <div className="font-semibold text-blue-900 mb-1">
                💡 Strategic Decision:
              </div>
              <div className="text-sm space-y-1">
                <div>• Activate price escalation clauses in contracts</div>
                <div>
                  • Shift production to industrial (higher margin) vs. medical
                  products
                </div>
                <div>
                  • Consider inventory build if futures show lower Q3 prices
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AMAG SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-3 font-semibold">
          AMAG (Aluminum) - Metals Dashboard
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Variable
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  What It Is
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Typical Range
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  How to Read It
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    LME 3M Aluminum
                  </span>
                </td>
                <td className="px-4 py-3">Benchmark selling price</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    $2,200-2,800/ton
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Increase production, defer
                    maintenance
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Focus on specialty products,
                    cost control
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    Alumina (API)
                  </span>
                </td>
                <td className="px-4 py-3">Raw material cost</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    $320-500/ton
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>↑ Rising:</strong> Margin pressure, optimize
                    production mix
                  </div>
                  <div>
                    <strong>↓ Falling:</strong> Build strategic inventory
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    API/LME Ratio
                  </span>
                </td>
                <td className="px-4 py-3">Profitability indicator</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    14-22%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      &lt;16%
                    </span>{" "}
                    Healthy margins
                  </div>
                  <div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                      &gt;20%
                    </span>{" "}
                    Consider production cuts
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-blue-600">
                    Premium US vs EU
                  </span>
                </td>
                <td className="px-4 py-3">Regional price differences</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                    $100-250/ton spread
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <strong>US &gt; EU:</strong> Prioritize American customers
                  </div>
                  <div>
                    <strong>EU &gt; US:</strong> Focus on European market
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Interpretation Box */}
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">
              📊 Example Scenario: Margin Squeeze Alert
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span>LME at $2,350 (down 8% QoQ)</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span>Alumina at $480 (up 15% QoQ)</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span>
                  API/LME Ratio = 20.4%{" "}
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                    CRITICAL
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-3 bg-blue-50 border-2 border-blue-300 rounded p-3">
              <div className="font-semibold text-blue-900 mb-1">
                💡 Strategic Decision:
              </div>
              <div className="text-sm space-y-1">
                <div>• Reduce primary production by 10-15%</div>
                <div>• Increase recycling operations (better margins)</div>
                <div>• Hedge 60% of Q2 production at current LME prices</div>
                <div>• Negotiate alumina supply contracts for 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
