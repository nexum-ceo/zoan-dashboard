import { ChartLineLinear } from '@/components/chart/chart-line-linear';
import { ChartRadialText } from '@/components/chart/radial-chart';

export default function PersonalSpace() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div>
        <ChartLineLinear />
        <ChartRadialText />
      </div>
    </div>
  );
}
