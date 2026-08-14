import { defineChart, dot, lineY } from '@tanstack/charts';
import { crosshair } from '@tanstack/charts/crosshair';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/react-charts';

import * as m from '#src/paraglide/messages';

interface NetWorthChartProps {
  rows: readonly { month: string; net_worth: number }[];
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function NetWorthChart({ rows }: NetWorthChartProps) {
  const definition = defineChart({
    marks: [
      lineY(rows, { x: 'month', y: 'net_worth', strokeWidth: 2 }),
      dot(rows, { x: 'month', y: 'net_worth' }),
      crosshair({ x: { label: false }, y: false }),
    ],
    x: { scale: scalePoint, axis: { label: m.dashboard_chart_month_axis() } },
    y: { scale: scaleLinear, axis: { label: m.dashboard_chart_net_worth_axis() } },
    focus: 'nearest-x',
    maxFocusDistance: Number.POSITIVE_INFINITY,
    tooltip: {
      use: tooltip,
      items: [
        { channel: 'y', label: m.dashboard_chart_net_worth_axis(), text: (point) => formatCurrency(point.yValue) },
      ],
    },
  });

  return (
    <Chart
      ariaLabel={m.dashboard_net_worth_chart_title()}
      definition={definition}
      height={280}
    />
  );
}
