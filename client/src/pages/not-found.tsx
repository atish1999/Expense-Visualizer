import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="h-6 w-6 text-destructive" />
            404 Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The page you're looking for doesn't exist or has been moved.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            Did you forget to add the page to the router?
          </p>
          <Button asChild className="w-full">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
