import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/utils/classNames';
import { InfoCardData } from '@/interfaces/analytics';

interface InfoCardProps {
  infoCard: InfoCardData;
  className?: string;
}

export default function InfoCard({ infoCard, className }: InfoCardProps) {
  const color = infoCard.green ? 'text-green-500' : 'text-red-500';

  return (
    <Card className={cn('flex-1', className)}>
      <CardHeader className="pb-2">
        <h3 className="text-base font-normal text-muted-foreground">{infoCard.title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-4xl font-bold">{infoCard.content}</p>
        <div className="mt-2 flex items-center gap-1">
          {infoCard.decrease ? (
            <ArrowDown className={`h-4 w-4 ${color}`} />
          ) : (
            <ArrowUp className={`h-4 w-4 ${color}`} />
          )}
          <span className={`text-sm font-medium ${color}`}>{infoCard.value}</span>
          <span className="text-sm text-muted-foreground">{infoCard.value_description}</span>
        </div>
      </CardContent>
    </Card>
  );
}
