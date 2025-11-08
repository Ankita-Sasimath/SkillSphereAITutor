import DashboardLayout from '../DashboardLayout';
import { Card } from "@/components/ui/card";

export default function DashboardLayoutExample() {
  return (
    <DashboardLayout userName="John Doe">
      <Card className="p-8 text-center">
        <h2 className="font-display font-bold text-2xl mb-2">Dashboard Content</h2>
        <p className="text-muted-foreground">
          This is where your dashboard content would appear
        </p>
      </Card>
    </DashboardLayout>
  );
}