import { barX, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/react-charts';

import * as m from '#src/paraglide/messages';

interface IncomeByTypeChartProps {
  rows: readonly { type: string; total: number }[];
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function IncomeByTypeChart({ rows }: IncomeByTypeChartProps) {
  const definition = defineChart({
    marks: [barX(rows, { x: 'total', y: 'type', inset: 2 })],
    x: { scale: scaleLinear, nice: true, axis: { label: m.dashboard_chart_total_axis() } },
    y: {
      scale: () =>
        scaleBand()
          .domain(rows.map((row) => row.type))
          .padding(0.2),
    },
    focus: 'nearest-y',
    tooltip: {
      use: tooltip,
      items: [{ channel: 'x', label: m.dashboard_chart_total_axis(), text: (point) => formatCurrency(point.xValue) }],
    },
  });

  return (
    <Chart
      ariaLabel={m.dashboard_income_chart_title()}
      definition={definition}
      height={280}
    />
  );
}
