import { useNavigate } from 'react-router-dom';
import { BrainCircuit, ArrowRight, MicVocal as MicVoice, HeartPulse, PieChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import HomeChatbot from '@/components/home/HomeChatbot';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: MicVoice,
      title: 'Speech Emotion Analysis',
      description: 'Advanced AI technology that recognizes emotions from speech patterns.'
    },
    {
      icon: HeartPulse,
      title: 'Emotional Health Tracking',
      description: 'Monitor emotional patterns over time to identify trends and improvements.'
    },
    {
      icon: PieChart,
      title: 'Detailed Analytics',
      description: 'Comprehensive visualizations and reports of emotional data.'
    },
    {
      icon: Calendar,
      title: 'Appointment Management',
      description: 'Seamless scheduling between doctors and patients.'
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] pb-12">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none" />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Speech Emotion Recognition Platform
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Advanced AI-powered platform that helps psychologists analyze and track emotional patterns 
                through speech, enabling better therapy outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated && (
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/register')}
                      className="gap-2"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate('/login')}
                    >
                      Log In
                    </Button>
                  </>
                )}
                {isAuthenticated && (
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/dashboard')}
                    className="gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="md:w-1/2 mt-12 md:mt-0">
              <img 
                src="https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg" 
                alt="Speech Analysis Illustration" 
                className="rounded-lg shadow-xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform offers powerful tools to help psychologists understand and track emotional patterns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16" id="about">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
              <img 
                src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg" 
                alt="About Us" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-4">About EmotiSense</h2>
              <p className="text-muted-foreground mb-6">
                EmotiSense is dedicated to revolutionizing emotional healthcare through advanced technology. 
                Our AI-powered platform helps psychologists identify, track, and respond to patients' emotional states 
                through speech pattern analysis.
              </p>
              <p className="text-muted-foreground mb-6">
                Founded by a team of AI researchers and mental health professionals, our mission is to provide 
                objective data to enhance therapeutic outcomes and improve emotional well-being.
              </p>
              <Button variant="outline" className="gap-2">
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <BrainCircuit className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to transform emotional healthcare?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join EmotiSense today and discover the power of AI-enhanced emotional analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated && (
              <>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="bg-transparent hover:bg-primary-foreground/10"
                >
                  Log In
                </Button>
              </>
            )}
            {isAuthenticated && (
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">EmotiSense</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Advanced AI-powered platform for speech emotion analysis and tracking.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Features</a></li>
                  <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground">Security</a></li>
                  <li><a href="#" className="hover:text-foreground">FAQs</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#about" className="hover:text-foreground">About</a></li>
                  <li><a href="#" className="hover:text-foreground">Careers</a></li>
                  <li><a href="#" className="hover:text-foreground">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground">Press</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                  <li><a href="#" className="hover:text-foreground">Terms</a></li>
                  <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-foreground">Licenses</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} EmotiSense. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Render the chatbot at the root so it's always visible on the landing page as a floating widget */}
      <HomeChatbot />
    </div>
  );
};

export default Home;