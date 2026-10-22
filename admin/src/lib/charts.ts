import type { EChartsOption } from 'echarts';

export const CHART = {
  accent: '#1a6b45',
  accentSoft: '#6b9f7a',
  success: '#2d7052',
  warning: '#6d7a3f',
  danger: '#c45c5c',
  muted: '#6b6a65',
  text: '#171715',
  border: '#d4d2cb',
  surface: '#ffffff',
};

export type DashboardSeriesPoint = {
  date: string;
  orders: number;
  revenue: number;
  cashRevenue?: number;
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: CHART.warning,
  paid: CHART.accent,
  processing: CHART.accentSoft,
  shipped: '#508a6a',
  delivered: CHART.success,
  cancelled: CHART.danger,
  refunded: '#8a6a6a',
};

const axis = {
  axisLine: { lineStyle: { color: CHART.border } },
  axisLabel: { color: CHART.muted, fontSize: 11 },
  splitLine: { lineStyle: { color: '#eceae4' } },
};

export function baseOption(): EChartsOption {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: CHART.muted, fontFamily: 'inherit' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: CHART.surface,
      borderColor: CHART.border,
      textStyle: { color: CHART.text },
    },
    legend: {
      textStyle: { color: CHART.muted },
      top: 0,
    },
    grid: { left: 52, right: 48, top: 36, bottom: 28 },
  };
}

export function revenueSeriesOption(series: DashboardSeriesPoint[]): EChartsOption {
  const labels = series.map((s) => {
    const [, m, d] = s.date.split('-');
    return `${d}.${m}`;
  });
  return {
    ...baseOption(),
    tooltip: {
      trigger: 'axis',
      backgroundColor: CHART.surface,
      borderColor: CHART.border,
      textStyle: { color: CHART.text },
    },
    legend: {
      data: ['Toplam ciro', 'Site', 'Kasa', 'Sipariş'],
      textStyle: { color: CHART.muted },
    },
    xAxis: { type: 'category', data: labels, ...axis },
    yAxis: [
      {
        type: 'value',
        name: '₺',
        ...axis,
        splitLine: { lineStyle: { color: '#eceae4' } },
      },
      {
        type: 'value',
        name: 'adet',
        ...axis,
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Toplam ciro',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: CHART.accent },
        areaStyle: { color: 'rgba(26,107,69,0.14)' },
        data: series.map((s) =>
          Math.round(s.revenue + (s.cashRevenue || 0)),
        ),
      },
      {
        name: 'Site',
        type: 'bar',
        itemStyle: { color: CHART.accentSoft },
        data: series.map((s) => Math.round(s.revenue)),
      },
      {
        name: 'Kasa',
        type: 'bar',
        itemStyle: { color: CHART.success },
        data: series.map((s) => Math.round(s.cashRevenue || 0)),
      },
      {
        name: 'Sipariş',
        type: 'bar',
        yAxisIndex: 1,
        itemStyle: { color: CHART.muted },
        data: series.map((s) => s.orders),
      },
    ],
  };
}

export function statusPieOption(
  rows: { status: string; label: string; count: number }[],
): EChartsOption {
  return {
    ...baseOption(),
    tooltip: {
      trigger: 'item',
      backgroundColor: CHART.surface,
      borderColor: CHART.border,
      textStyle: { color: CHART.text },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { color: CHART.muted, fontSize: 11 },
        data: rows
          .filter((r) => r.count > 0)
          .map((r) => ({
            name: r.label,
            value: r.count,
            itemStyle: { color: STATUS_COLOR[r.status] || CHART.muted },
          })),
      },
    ],
  };
}

export function topProductsOption(
  rows: { name: string; quantity: number }[],
): EChartsOption {
  const data = [...rows].reverse();
  return {
    ...baseOption(),
    grid: { left: 120, right: 24, top: 16, bottom: 24 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: CHART.surface,
      borderColor: CHART.border,
      textStyle: { color: CHART.text },
    },
    legend: { show: false },
    xAxis: { type: 'value', ...axis },
    yAxis: {
      type: 'category',
      data: data.map((r) =>
        r.name.length > 22 ? `${r.name.slice(0, 20)}…` : r.name,
      ),
      ...axis,
    },
    series: [
      {
        type: 'bar',
        data: data.map((r) => r.quantity),
        itemStyle: { color: CHART.accent },
      },
    ],
  };
}

export function mixPieOption(
  rows: { name: string; value: number }[],
  colors: string[],
): EChartsOption {
  return {
    ...baseOption(),
    tooltip: {
      trigger: 'item',
      backgroundColor: CHART.surface,
      borderColor: CHART.border,
      textStyle: { color: CHART.text },
      formatter: '{b}: {c} ₺ ({d}%)',
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { color: CHART.muted, fontSize: 11 },
        data: rows.map((r, i) => ({
          name: r.name,
          value: Math.round(r.value),
          itemStyle: { color: colors[i % colors.length] },
        })),
      },
    ],
  };
}

export function stockBarOption(
  rows: { name: string; stock: number }[],
): EChartsOption {
  const data = rows.slice(0, 8);
  return {
    ...baseOption(),
    grid: { left: 110, right: 16, top: 12, bottom: 24 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: CHART.surface,
      borderColor: CHART.border,
      textStyle: { color: CHART.text },
    },
    legend: { show: false },
    xAxis: { type: 'value', ...axis },
    yAxis: {
      type: 'category',
      data: data.map((r) =>
        r.name.length > 18 ? `${r.name.slice(0, 16)}…` : r.name,
      ),
      ...axis,
    },
    series: [
      {
        type: 'bar',
        data: data.map((r) => ({
          value: r.stock,
          itemStyle: {
            color: r.stock <= 10 ? CHART.warning : CHART.accent,
          },
        })),
      },
    ],
  };
}
