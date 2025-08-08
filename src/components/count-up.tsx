import { FC, useEffect, useState } from 'react';

type CountUpProps = {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
};

export const CountUp: FC<CountUpProps> = ({
  end,
  duration = 2000,
  suffix = '',
  decimals = 0,
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = easeOutQuart * end;

      setCount(
        decimals > 0
          ? Math.round(currentValue * Math.pow(10, decimals)) /
              Math.pow(10, decimals)
          : Math.floor(currentValue),
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, decimals]);

  return (
    <span>
      {decimals > 0 ? count.toFixed(decimals) : count}
      {suffix}
    </span>
  );
};
