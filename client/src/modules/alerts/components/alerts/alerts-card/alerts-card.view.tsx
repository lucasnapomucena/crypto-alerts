import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface AlertsCardProps {
  title: string;
  total: number;
}

export const AlertsCard = ({ title, total = 0 }: AlertsCardProps) => {
  return (
    <Card className="min-h-24 b">
      <CardContent className="text-center flex flex-col gap-4">
        <p className="text-4xl">{total}</p>
        <CardTitle>{title}</CardTitle>
      </CardContent>
    </Card>
  );
};
