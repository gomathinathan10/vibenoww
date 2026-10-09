// ======================================================================
// VibeNoww Clean Data Architecture
// ZERO DUMMY DATA — Fresh Production Application
// ======================================================================

export const initialPhotographers = [];

export const initialWorks = [];

export const initialReviews = [];

export const servicePackages = [
  {
    id: "s1",
    title: "Wedding Photography & Cinematography",
    subtitle: "Complete capture of sacred rituals, candid emotions & 4K wedding films",
    startingPrice: 25000,
    badge: "Most Popular",
    image: "/images/vibenow-moments-card.jpg",
    features: [
      "Traditional & Candid photography coverage",
      "Cinematic 4K teaser & full length wedding film",
      "DGCA-certified drone aerial perspectives",
      "High-resolution edited digital gallery",
      "Luxury flush-mount photo album options"
    ],
    tiers: [
      { name: "Silver Elegance", price: "₹25,000", days: "1 Day Coverage", desc: "1 Candid Photographer + 1 Traditional Stills, 200 edited photos" },
      { name: "Gold Royal", price: "₹55,000", days: "2 Days Full Coverage", desc: "2 Photographers + 1 Cinematographer + Drone, 40-Page Album, Teaser Reel" },
      { name: "Platinum Cinema", price: "₹95,000", days: "Multi-Day Grand Wedding", desc: "Full Crew, 4K Cinema Film, Crane, Drone, 2 Albums, Instagram Reels Delivery" }
    ]
  },
  {
    id: "s2",
    title: "Brand Storytelling & Commercial",
    subtitle: "High-impact visual content for e-commerce, ads, fashion, and brands",
    startingPrice: 12000,
    badge: "For Businesses",
    image: "/images/vibenow-business-card.jpg",
    features: [
      "E-commerce product cataloging (Amazon/Flipkart)",
      "Silk saree, jewelry & fashion lookbooks",
      "Brand promotional commercial films & reels",
      "Studio lighting setup & model management",
      "Commercial usage license & fast turnaround"
    ],
    tiers: [
      { name: "Starter Catalog", price: "₹12,000", days: "Half Day Shoot", desc: "Up to 15 Products on white/creative background, retouched JPGs" },
      { name: "Brand Campaign", price: "₹30,000", days: "Full Day Studio Shoot", desc: "Model shoot + 5 video reels + catalog images + color grade" },
      { name: "Enterprise Production", price: "₹65,000", days: "Multi-Location Ad Film", desc: "Scripting, 4K commercial ad video, voiceover, marketing cutdowns" }
    ]
  },
  {
    id: "s3",
    title: "Drone Aerial & FPV Cinematography",
    subtitle: "Breathtaking aerial coverage for resorts, outdoor weddings & festivals",
    startingPrice: 15000,
    badge: "4K Aerial",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    features: [
      "4K Ultra HD aerial photography & video",
      "FPV dynamic indoor/outdoor fly-throughs",
      "DGCA licensed professional drone pilots",
      "Real estate & architectural bird-eye views",
      "Color-graded cinematic b-roll delivery"
    ],
    tiers: [
      { name: "Aerial Highlights", price: "₹15,000", days: "Event Aerial Coverage", desc: "3 Flight sessions, 4K raw footage + edited aerial reel" },
      { name: "FPV Flythrough Pro", price: "₹28,000", days: "Property/Resort Video", desc: "Custom indoor FPV flythrough + stabilized 4K marketing edit" }
    ]
  },
  {
    id: "s4",
    title: "Maternity, Baby & Family Stories",
    subtitle: "Gentle, memorable portraits of growing families & sweet childhood moments",
    startingPrice: 10000,
    badge: "Heartfelt",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
    features: [
      "Maternity outdoor / nature spot sessions",
      "Newborn safe studio posing & props",
      "Baby 1st birthday cake smash coverage",
      "Family heirloom portrait prints",
      "Soft, warm natural lighting style"
    ],
    tiers: [
      { name: "Maternity Blossom", price: "₹10,000", days: "2 Hours Session", desc: "2 Outfit changes, 25 retouched photos, outdoor location" },
      { name: "Complete Baby Milestone", price: "₹22,000", days: "Maternity + Newborn", desc: "Dual sessions with customized props and mini-album included" }
    ]
  }
];

export const portfolioItems = [
  { id: "pf1", title: "Nellai Royal Temple Wedding", category: "Weddings", photographer: "VibeNoww Studios", location: "Tirunelveli", image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80" },
  { id: "pf2", title: "Sunset Beachside Muhurtham", category: "Weddings", photographer: "VibeNoww Studios", location: "Kanyakumari", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" },
  { id: "pf3", title: "Golden Hour Couple Portrait", category: "Pre-Wedding", photographer: "VibeNoww Studios", location: "Courtallam", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80" },
  { id: "pf4", title: "Bridal Haldi Joy & Laughter", category: "Candid", photographer: "VibeNoww Studios", location: "Madurai", image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80" },
  { id: "pf5", title: "Handcrafted Gold Jewelry Catalog", category: "Commercial", photographer: "VibeNoww Studios", location: "Chennai", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80" },
  { id: "pf6", title: "Kanchipuram Silk Editorial", category: "Fashion", photographer: "VibeNoww Studios", location: "Chennai", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" },
  { id: "pf7", title: "Heritage Resort 4K Aerial View", category: "Drone", photographer: "VibeNoww Studios", location: "Madurai", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80" },
  { id: "pf8", title: "Maternity Dream by Waterfalls", category: "Baby & Maternity", photographer: "VibeNoww Studios", location: "Tenkasi", image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80" },
  { id: "pf9", title: "Traditional Sashtiabdhapoorthi", category: "Traditional", photographer: "VibeNoww Studios", location: "Palayamkottai", image: "https://images.unsplash.com/photo-1545232979-fbf6c7c25227?auto=format&fit=crop&w=800&q=80" }
];

export const faqList = [
  {
    q: "How does VibeNoww verify photographers and cinematographers?",
    a: "Every creative on VibeNoww undergoes a rigorous 5-step verification audit: identity check, portfolio authenticity verification, camera gear inspection, client feedback background checks, and an agreement on punctuality & high-resolution delivery standards."
  },
  {
    q: "Can I customize packages with extra hours or specific camera equipment?",
    a: "Yes! Use our Instant Quotation Builder or select customizable add-ons (extra candid photographer, drone aerials, live streaming, additional album copies, teaser reels) when booking."
  },
  {
    q: "How does booking and payment security work?",
    a: "Your booking is protected by VibeNoww Escrow. You pay an advance deposit to secure the date. Full payout is released to the creator only after you receive and confirm your deliverables."
  },
  {
    q: "How quickly do we receive our edited wedding photos and films?",
    a: "Standard delivery timeline is 7-10 days for sneak peek highlight photos, and 3-4 weeks for complete color-graded galleries and full cinematic wedding videos."
  },
  {
    q: "I am a photographer / editor. How can I join VibeNoww?",
    a: "Click on 'Join as Creator' in the top navigation or footer. Complete your profile, upload your portfolio, and our creator curation team will review and approve your studio within 24-48 hours."
  }
];
