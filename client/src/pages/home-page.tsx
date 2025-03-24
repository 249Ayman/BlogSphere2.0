import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-10 md:mb-0 md:w-1/2">
              <svg className="w-16 h-16 text-primary mb-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <h1 className="text-5xl font-bold text-gray-800 mb-4">BlogWave</h1>
              <p className="text-xl text-gray-600 mb-8">
                A modern platform for writers, bloggers, and content creators. 
                Share your stories, engage with readers, and grow your audience.
              </p>
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="mr-4">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="space-x-4">
                  <Link href="/auth">
                    <Button size="lg" className="mr-4">
                      Get Started
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              )}
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-full h-full bg-primary/20 rounded-lg"></div>
                <div className="relative bg-white p-8 rounded-lg shadow-lg">
                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">B</div>
                      <div className="ml-4">
                        <div className="font-medium">BlogWave Editor</div>
                        <div className="text-sm text-gray-500">Draft</div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold">My First Blog Post</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="p-3 bg-blue-100 rounded-full inline-block mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rich Text Editor</h3>
            <p className="text-gray-600">
              Create beautiful content with our intuitive rich text editor. Add images, format text, and create engaging blog posts with ease.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="p-3 bg-green-100 rounded-full inline-block mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">
              Track your audience engagement with comprehensive analytics. Monitor views, unique visitors, and discover what content performs best.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="p-3 bg-purple-100 rounded-full inline-block mb-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Comment System</h3>
            <p className="text-gray-600">
              Engage with your readers through our built-in commenting system. Moderate discussions and build a community around your content.
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to start your blogging journey?</h2>
          <p className="text-xl mb-8">
            Join thousands of content creators who are building their audience with BlogWave.
          </p>
          {!user && (
            <Link href="/auth">
              <Button size="lg" variant="secondary">
                Get Started for Free
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-primary mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="text-xl font-semibold text-gray-800">BlogWave</span>
              </div>
              <p className="text-gray-600 mt-2">
                © {new Date().getFullYear()} BlogWave. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary">
                About
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Features
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Contact
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
