
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Book, 
  Calendar, 
  CheckCircle2, 
  Loader2,
  RefreshCw
} from "lucide-react";

// List of verified Unsplash image URLs related to banking and finance
const BANKING_IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab", // Modern skyscraper building
  "https://images.unsplash.com/photo-1554774853-719586f82d77", // Modern office building
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", // Digital banking interface
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f", // Trading screen graph
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e", // City skyline
  "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be", // Australia landscape
  "https://images.unsplash.com/photo-1542051841857-5f90071e7989", // Japan Tokyo street
  "https://images.unsplash.com/photo-1576788903709-5c8b6fadc3f0", // Hong Kong skyline
  "https://images.unsplash.com/photo-1525625293386-3f8f99389edd", // Singapore skyline
  "https://images.unsplash.com/photo-1596422846543-75c6fc197f07", // Malaysia skyline
  "https://images.unsplash.com/photo-1559628129-67cf63b72248", // Indonesia landscape
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a", // Thailand temple
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86", // Philippines beach
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40", // Business meeting
  "https://images.unsplash.com/photo-1553729459-efe14ef6055d", // Office workspace
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f", // Financial data
  "https://images.unsplash.com/photo-1591696205602-2f950c417cb9", // Banking building
  "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11", // Office workers
  "https://images.unsplash.com/photo-1550565118-3a14e8d0386f", // City financial district
  "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc", // Corporate building
  "https://images.unsplash.com/photo-1565514020179-026f72c3f530", // Financial graph chart
  "https://images.unsplash.com/photo-1589188056053-28910dc61d38", // Credit card payment
  "https://images.unsplash.com/photo-1423666639041-f56000c27a9a", // Bank vault
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf", // Business handshake
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d", // Digital payment
  "https://images.unsplash.com/photo-1444653389962-8149286c578a", // Business district dusk
  "https://images.unsplash.com/photo-1462899006636-339e08d1844e", // Aerial city view
  "https://images.unsplash.com/photo-1552664688-cf412ec27db2", // Banking mobile app
  "https://images.unsplash.com/photo-1574607383476-1b91650f993e", // Digital banking
  "https://images.unsplash.com/photo-1618044733300-9472054094ee", // Business meeting room
  "https://images.unsplash.com/photo-1555421689-491a97ff2040", // Stock market data screen
  "https://images.unsplash.com/photo-1516321165247-4aa89a48514e", // Digital financial data
  "https://images.unsplash.com/photo-1629326892648-d4d2ddd38272", // Credit card and laptop
  "https://images.unsplash.com/photo-1537724326059-2ea20251b9c8", // Night city skyline
  "https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9", // Mobile banking
  "https://images.unsplash.com/photo-1460467820054-c87ab43e9b59", // Office workspace
  "https://images.unsplash.com/photo-1521791055366-0d553872125f", // Modern building interior
  "https://images.unsplash.com/photo-1601597111158-2fceff292cdc", // Business finance calculator
  "https://images.unsplash.com/photo-1543286386-2e659306cd6c", // Business meeting teamwork
  "https://images.unsplash.com/photo-1604594849809-dfedbc827105"  // Financial office desk
];

export default function NewsletterForm({ 
  isOpen, 
  onClose, 
  onPublish, 
  selectedArticles = [], 
  isPublishing = false 
}) {
  const [newsletterData, setNewsletterData] = useState({
    title: `Banking Sector Newsletter - ${new Date().toLocaleDateString()}`,
    description: "Latest news and insights from the banking sector across Asia-Pacific.",
    bannerImageUrl: ""
  });
  
  const [bannerImages, setBannerImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Function to get random elements from array
  const getRandomElements = (arr, n) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  // Function to get random images
  const fetchRandomImages = () => {
    setLoadingImages(true);
    try {
      // Get 6 random images from our verified list
      const selectedImages = getRandomElements(BANKING_IMAGES, 6);
      setBannerImages(selectedImages);
      
      // Set the first image as default if no image is currently selected
      if (!newsletterData.bannerImageUrl) {
        setNewsletterData(prev => ({
          ...prev,
          bannerImageUrl: selectedImages[0]
        }));
      }
    } catch (error) {
      console.error("Error setting banner images:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Reset form and fetch images when opened
  useEffect(() => {
    if (isOpen) {
      fetchRandomImages();
      setNewsletterData(prev => ({
        ...prev,
        title: `Banking Sector Newsletter - ${new Date().toLocaleDateString()}`
      }));
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (imageUrl) => {
    setNewsletterData(prev => ({
      ...prev,
      bannerImageUrl: imageUrl
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPublish({
      ...newsletterData,
      publishDate: new Date().toISOString(),
      articles: selectedArticles.map(article => article.id)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-indigo-600" />
            Create Newsletter
          </DialogTitle>
          <DialogDescription>
            You are about to publish {selectedArticles.length} selected articles to a newsletter.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Newsletter Title</Label>
            <Input
              id="title"
              name="title"
              value={newsletterData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newsletterData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Select Banner Image</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchRandomImages}
                disabled={loadingImages}
                className="h-8"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loadingImages ? 'animate-spin' : ''}`} />
                Refresh Images
              </Button>
            </div>
            
            {loadingImages ? (
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {bannerImages.map((imgUrl) => (
                  <div
                    key={imgUrl}
                    className={`relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all
                      ${newsletterData.bannerImageUrl === imgUrl ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-transparent hover:border-indigo-300'}`}
                    onClick={() => handleImageSelect(imgUrl)}
                  >
                    <img 
                      src={imgUrl} 
                      alt="Banner option" 
                      className="w-full h-full object-cover"
                    />
                    {newsletterData.bannerImageUrl === imgUrl && (
                      <div className="absolute inset-0 bg-indigo-600 bg-opacity-50 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-500 gap-1">
            <Calendar className="h-4 w-4" />
            Will be published immediately with today's date
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isPublishing || !newsletterData.bannerImageUrl}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Newsletter"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}