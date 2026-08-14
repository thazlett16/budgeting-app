import { colorLegend, defineChart, lineY } from '@tanstack/charts';
import { crosshair } from '@tanstack/charts/crosshair';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/react-charts';

import * as m from '#src/paraglide/messages';

interface AccountBalanceChartProps {
  rows: readonly { date: string; account: string; balance: number }[];
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function AccountBalanceChart({ rows }: AccountBalanceChartProps) {
  const orderedRows = rows.toSorted((a, b) => a.date.localeCompare(b.date));

  const definition = defineChart({
    marks: [
      lineY(orderedRows, { x: 'date', y: 'balance', z: 'account', color: 'account', strokeWidth: 2 }),
      crosshair({ x: { label: false }, y: false }),
    ],
    x: { scale: scalePoint, axis: { label: m.dashboard_chart_month_axis() } },
    y: { scale: scaleLinear, axis: { label: m.dashboard_chart_net_worth_axis() } },
    color: { legend: colorLegend({ label: m.dashboard_chart_account_legend() }) },
    focus: 'group-x',
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
      ariaLabel={m.dashboard_account_balance_chart_title()}
      definition={definition}
      height={280}
    />
  );
}
