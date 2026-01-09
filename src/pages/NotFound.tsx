import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { Home, HelpCircle, Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <PageSEO
        title="Page Not Found | PRYZEN"
        description="The page you're looking for doesn't exist or has been moved."
        noIndex={true}
      />
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl font-bold text-primary">404</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/sports" className="gap-2">
                <Trophy className="w-4 h-4" />
                Explore Sports
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Need help?</p>
            <Link 
              to="/support" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
