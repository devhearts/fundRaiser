import { useState } from "react";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, Users, DollarSign, TrendingUp, Star, ArrowRight, Plus, Target } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MOCK_EVENTS } from "@/data/mockData";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const publicEvents = MOCK_EVENTS.filter(event => event.isPublic);

  const filteredEvents = publicEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (id: string) => {
    setLocation(`/event/${id}`);
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share this link with potential contributors",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-8">
              <Badge variant="secondary" className="px-6 py-3 text-base">
                <Heart className="w-5 h-5 mr-2" />
                Trusted by 25,000+ couples and families
              </Badge>
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
                Fund Your
                <br />
                Special Moments
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Let your loved ones help make your wedding, birthday, or special celebration unforgettable. 
                Create beautiful fundraisers and invite friends & family to contribute to your dreams.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 pt-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="w-6 h-6" />
                <span className="text-lg font-medium">50K+ Contributors</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <DollarSign className="w-6 h-6" />
                <span className="text-lg font-medium">$5M+ Raised</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <TrendingUp className="w-6 h-6" />
                <span className="text-lg font-medium">98% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Celebrating Together</h2>
              <p className="text-lg text-muted-foreground">
                See how families and friends are making special moments unforgettable
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">25,000+</div>
                <div className="text-sm text-muted-foreground">Happy Couples</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">8,500+</div>
                <div className="text-sm text-muted-foreground">Successful Events</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">$5M+</div>
                <div className="text-sm text-muted-foreground">Total Raised</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">Happy Contributors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {false && <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Featured Celebrations</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover beautiful events and celebrations happening now
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onShare={handleShare}
                />
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" className="px-8">
                View All Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>}

      {false && <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Celebrate?</h2>
              <p className="text-lg text-muted-foreground">
                Whether you're planning your special day or want to support someone's celebration, 
                we're here to help make every moment unforgettable.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your Event
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                Browse All Events
              </Button>
            </div>
          </div>
        </div>
      </section>}

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">What Our Community Says</h2>
              <p className="text-lg text-muted-foreground">
                Real stories from couples and families celebrating their special moments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "This platform made our wedding fundraising so easy! Our friends and family 
                    loved being able to contribute to our special day."
                  </p>
                  <div className="text-sm font-medium">Sarah & Michael</div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "I've contributed to several birthday parties and weddings here. It's so 
                    convenient and I love seeing how happy the celebrations turn out!"
                  </p>
                  <div className="text-sm font-medium">Jennifer R.</div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "The updates and photos from the events make me feel connected to the 
                    celebrations even when I can't be there in person."
                  </p>
                  <div className="text-sm font-medium">David L.</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
