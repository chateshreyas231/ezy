
export type MockAgent = {
    id: string;
    name: string;
    role: "agent";
    avatar: string;
    brokerage: string;
    location: string;
    experienceYears: number;
    rating: number;
    specialties: string[];
    stats: {
        sold: number;
        active: number;
        volume: number;
    };
};

export type MockBroker = {
    id: string;
    name: string;
    role: "broker";
    logo: string;
    tagline: string;
    foundedYear: number;
    headquarters: string;
    owner: string;
    managingPartners: string[];
    serviceAreas: string[];
    specializations: string[];
    agents: string[];
    stats: {
        totalSold: number;
        totalVolume: number;
        activeListings: number;
        averageRating: number;
        marketShare: number;
        yearlyGrowth: number;
    };
};

export type MockVendor = {
    id: string;
    name: string;
    role: "vendor";
    avatar: string;
    banner: string;
    company: string;
    category: "Inspection" | "Staging" | "Photography" | "Mortgage" | "Legal" | "Renovation" | "Moving";
    specialties: string[];
    serviceAreas: string[];
    yearsInBusiness: number;
    completedProjects: number;
    responseTimeHours: number;
    rating: number;
    reviewCount: number;
    bio: string;
    certifications: string[];
    languages: string[];
    portfolio: Array<{
        title: string;
        location: string;
        summary: string;
        image: string;
    }>;
    reviews: Array<{
        name: string;
        role: string;
        rating: number;
        comment: string;
    }>;
};

export const MOCK_AGENTS: MockAgent[] = [
    {
        id: "agent-1",
        name: "James Bond",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        brokerage: "Elite Realty",
        location: "Los Angeles, CA",
        experienceYears: 15,
        rating: 4.9,
        specialties: ["Luxury Homes", "Waterfront", "Off-Market"],
        stats: { sold: 48, active: 7, volume: 125000000 },
    },
    {
        id: "agent-2",
        name: "Sarah Chen",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        brokerage: "Northline Partners",
        location: "San Francisco, CA",
        experienceYears: 11,
        rating: 4.8,
        specialties: ["Condos", "First-Time Buyers", "Negotiation"],
        stats: { sold: 39, active: 9, volume: 92000000 },
    },
    {
        id: "agent-3",
        name: "Marcus Hill",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        brokerage: "CityKey Realty",
        location: "Austin, TX",
        experienceYears: 8,
        rating: 4.7,
        specialties: ["Single Family", "New Construction", "Relocation"],
        stats: { sold: 27, active: 11, volume: 58000000 },
    },
    {
        id: "agent-4",
        name: "Priya Nair",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
        brokerage: "Harbor & Stone",
        location: "Miami, FL",
        experienceYears: 13,
        rating: 4.9,
        specialties: ["Luxury Condos", "Investors", "International Buyers"],
        stats: { sold: 44, active: 6, volume: 108000000 },
    },
    {
        id: "agent-5",
        name: "Daniel Ortiz",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=400&q=80",
        brokerage: "Maple Coast Homes",
        location: "Seattle, WA",
        experienceYears: 6,
        rating: 4.6,
        specialties: ["Townhomes", "Tech Relocation", "Seller Strategy"],
        stats: { sold: 19, active: 8, volume: 36000000 },
    },
    {
        id: "agent-6",
        name: "Emily Carter",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80",
        brokerage: "Empire Peak Realty",
        location: "New York, NY",
        experienceYears: 17,
        rating: 4.9,
        specialties: ["Penthouses", "Co-op Boards", "Luxury Leasing"],
        stats: { sold: 52, active: 5, volume: 143000000 },
    },
    {
        id: "agent-7",
        name: "Olivia Bennett",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        brokerage: "SummitStone Brokerage",
        location: "Chicago, IL",
        experienceYears: 9,
        rating: 4.8,
        specialties: ["Downtown Condos", "Investor Portfolios", "Pre-Construction"],
        stats: { sold: 33, active: 10, volume: 76000000 },
    },
    {
        id: "agent-8",
        name: "Nathan Brooks",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",
        brokerage: "SummitStone Brokerage",
        location: "Denver, CO",
        experienceYears: 12,
        rating: 4.7,
        specialties: ["Mountain Homes", "Relocation", "New Communities"],
        stats: { sold: 41, active: 7, volume: 88000000 },
    },
    {
        id: "agent-9",
        name: "Isabella Rossi",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=400&q=80",
        brokerage: "UrbanCore Commercial",
        location: "Dallas, TX",
        experienceYears: 14,
        rating: 4.9,
        specialties: ["Retail Leasing", "Mixed-Use", "Commercial Buy-Sell"],
        stats: { sold: 46, active: 9, volume: 132000000 },
    },
    {
        id: "agent-10",
        name: "Carter Flynn",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80",
        brokerage: "UrbanCore Commercial",
        location: "Atlanta, GA",
        experienceYears: 10,
        rating: 4.6,
        specialties: ["Industrial", "Office Conversions", "Tenant Representation"],
        stats: { sold: 29, active: 12, volume: 69000000 },
    },
    {
        id: "agent-11",
        name: "Maya Patel",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
        brokerage: "Harborline Prestige",
        location: "Boston, MA",
        experienceYears: 7,
        rating: 4.7,
        specialties: ["Historic Homes", "Rent-to-Buy", "Luxury Rentals"],
        stats: { sold: 24, active: 11, volume: 52000000 },
    },
    {
        id: "agent-12",
        name: "Julian Park",
        role: "agent",
        avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80",
        brokerage: "Harborline Prestige",
        location: "Washington, DC",
        experienceYears: 16,
        rating: 4.8,
        specialties: ["Embassy District", "Townhomes", "Policy Relocation"],
        stats: { sold: 50, active: 6, volume: 119000000 },
    },
];

export const MOCK_BROKERS: MockBroker[] = [
    {
        id: "broker-1",
        name: "Elite Realty Group",
        role: "broker",
        logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=320&q=80",
        tagline: "High-touch brokerage for premium urban and luxury transactions.",
        foundedYear: 2008,
        headquarters: "Los Angeles, CA",
        owner: "Michael Langford",
        managingPartners: ["Ariana Wells", "Devon Price"],
        serviceAreas: ["Los Angeles", "Orange County", "San Diego"],
        specializations: ["Luxury", "New Development", "Commercial", "Relocation"],
        agents: ["agent-1", "agent-4"],
        stats: {
            totalSold: 145,
            totalVolume: 150000000,
            activeListings: 31,
            averageRating: 4.8,
            marketShare: 4.8,
            yearlyGrowth: 14.2,
        },
    },
    {
        id: "broker-2",
        name: "Northline Partners",
        role: "broker",
        logo: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=320&q=80",
        tagline: "Data-backed brokerage operations across high-velocity metro corridors.",
        foundedYear: 2012,
        headquarters: "San Francisco, CA",
        owner: "Sofia Mitchell",
        managingPartners: ["Daniel Wu", "Priyanka Shah"],
        serviceAreas: ["San Francisco", "San Jose", "Oakland", "Seattle"],
        specializations: ["Condos", "Investment", "Rentals", "Tech Relocation"],
        agents: ["agent-2", "agent-5"],
        stats: {
            totalSold: 118,
            totalVolume: 123000000,
            activeListings: 27,
            averageRating: 4.7,
            marketShare: 3.9,
            yearlyGrowth: 11.6,
        },
    },
    {
        id: "broker-3",
        name: "Empire Peak Realty",
        role: "broker",
        logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=320&q=80",
        tagline: "Institutional-grade advisory for buy, sell, lease, and mixed-use portfolios.",
        foundedYear: 2003,
        headquarters: "New York, NY",
        owner: "Evelyn Carter",
        managingPartners: ["James O'Connell", "Raul Mendoza"],
        serviceAreas: ["New York", "Jersey City", "Miami", "Austin"],
        specializations: ["Commercial", "Luxury Leasing", "Penthouses", "Multi-Family"],
        agents: ["agent-3", "agent-6"],
        stats: {
            totalSold: 172,
            totalVolume: 214000000,
            activeListings: 42,
            averageRating: 4.9,
            marketShare: 5.4,
            yearlyGrowth: 16.8,
        },
    },
    {
        id: "broker-4",
        name: "SummitStone Brokerage",
        role: "broker",
        logo: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80",
        tagline: "Modern brokerage operations blending relocation, development, and investor services.",
        foundedYear: 2015,
        headquarters: "Chicago, IL",
        owner: "Rebecca Monroe",
        managingPartners: ["Trevor King", "Lena Hoffman"],
        serviceAreas: ["Chicago", "Denver", "Phoenix", "Nashville"],
        specializations: ["Relocation", "New Development", "Investor Advisory", "Luxury Rentals"],
        agents: ["agent-7", "agent-8"],
        stats: {
            totalSold: 126,
            totalVolume: 168000000,
            activeListings: 35,
            averageRating: 4.8,
            marketShare: 4.2,
            yearlyGrowth: 13.1,
        },
    },
    {
        id: "broker-5",
        name: "UrbanCore Commercial",
        role: "broker",
        logo: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=320&q=80",
        tagline: "Commercial-first brokerage for mixed-use, office, and income-producing assets.",
        foundedYear: 2006,
        headquarters: "Dallas, TX",
        owner: "Anthony Delacroix",
        managingPartners: ["Maria Quinn", "Leo Ramirez"],
        serviceAreas: ["Dallas", "Atlanta", "Houston", "Washington, DC", "Boston"],
        specializations: ["Commercial", "Mixed-Use", "Industrial", "Institutional Leasing"],
        agents: ["agent-9", "agent-10", "agent-11", "agent-12"],
        stats: {
            totalSold: 203,
            totalVolume: 286000000,
            activeListings: 48,
            averageRating: 4.8,
            marketShare: 6.1,
            yearlyGrowth: 17.4,
        },
    },
];

export const MOCK_VENDORS: MockVendor[] = [
    {
        id: "vendor-1",
        name: "Olivia Grant",
        role: "vendor",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
        banner: "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1400&q=80",
        company: "SafeHome Inspections",
        category: "Inspection",
        specialties: ["Pre-listing inspections", "Foundation & roof checks", "Luxury home due diligence"],
        serviceAreas: ["Los Angeles, CA", "Beverly Hills, CA", "Santa Monica, CA"],
        yearsInBusiness: 12,
        completedProjects: 980,
        responseTimeHours: 3,
        rating: 4.9,
        reviewCount: 214,
        bio: "Residential and luxury property inspection team focused on fast turnaround reports and buyer confidence.",
        certifications: ["ASHI Certified Inspector", "InterNACHI CPI"],
        languages: ["English", "Spanish"],
        portfolio: [
            {
                title: "Modern Hillside Estate Inspection",
                location: "Beverly Hills, CA",
                summary: "48-point structural and systems report delivered within 24 hours.",
                image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
            },
            {
                title: "Coastal Property Risk Audit",
                location: "Santa Monica, CA",
                summary: "Moisture, corrosion, and HVAC risk evaluation for buyer contingency window.",
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            },
        ],
        reviews: [
            { name: "James Bond", role: "Agent", rating: 5, comment: "Fast and detailed report helped us negotiate confidently." },
            { name: "Mia Harper", role: "Seller", rating: 5, comment: "Great communication and no surprises on close." },
        ],
    },
    {
        id: "vendor-2",
        name: "Noah Rivera",
        role: "vendor",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",
        banner: "https://images.unsplash.com/photo-1616594039964-3be06adf6f58?auto=format&fit=crop&w=1400&q=80",
        company: "FrameLight Media",
        category: "Photography",
        specialties: ["Listing photography", "Drone shoots", "Cinematic walkthroughs"],
        serviceAreas: ["San Francisco, CA", "San Jose, CA", "Oakland, CA"],
        yearsInBusiness: 9,
        completedProjects: 740,
        responseTimeHours: 6,
        rating: 4.8,
        reviewCount: 186,
        bio: "Creative real estate media studio helping listings stand out across MLS, social, and paid campaigns.",
        certifications: ["FAA Part 107 Drone Pilot"],
        languages: ["English"],
        portfolio: [
            {
                title: "Bayfront Condo Visual Package",
                location: "San Francisco, CA",
                summary: "Photo + drone + 60-sec listing reel for luxury condo launch.",
                image: "https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&w=1200&q=80",
            },
            {
                title: "Modern Townhome Twilight Shoot",
                location: "San Jose, CA",
                summary: "Twilight imagery and floor-plan overlays that improved click-through rates.",
                image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            },
        ],
        reviews: [
            { name: "Sarah Chen", role: "Agent", rating: 5, comment: "Photos were incredible and helped us get multiple offers." },
            { name: "Alex Buyer", role: "Buyer", rating: 4, comment: "Virtual tour was very accurate and informative." },
        ],
    },
    {
        id: "vendor-3",
        name: "Ava Thompson",
        role: "vendor",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        banner: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=80",
        company: "StageCraft Interiors",
        category: "Staging",
        specialties: ["Luxury staging", "Occupied-home refresh", "Investor-ready staging"],
        serviceAreas: ["Miami, FL", "Fort Lauderdale, FL", "West Palm Beach, FL"],
        yearsInBusiness: 11,
        completedProjects: 520,
        responseTimeHours: 8,
        rating: 4.9,
        reviewCount: 163,
        bio: "End-to-end staging partner for high-end listings, focused on design narratives that increase perceived value.",
        certifications: ["RESA Certified Stager"],
        languages: ["English", "Portuguese"],
        portfolio: [
            {
                title: "Waterfront Penthouse Staging",
                location: "Miami, FL",
                summary: "Full-furnish staging completed in 4 days for launch timeline.",
                image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
            },
            {
                title: "Family Home Fast Refresh",
                location: "Fort Lauderdale, FL",
                summary: "Budget-sensitive styling package to boost showing conversion.",
                image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80",
            },
        ],
        reviews: [
            { name: "Priya Nair", role: "Agent", rating: 5, comment: "Staging quality directly impacted offer strength." },
            { name: "Kevin Tran", role: "Buyer", rating: 5, comment: "Home felt move-in ready and beautifully planned." },
        ],
    },
    {
        id: "vendor-4",
        name: "Liam Patel",
        role: "vendor",
        avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80",
        banner: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
        company: "PrimePath Lending",
        category: "Mortgage",
        specialties: ["Jumbo loans", "Investor financing", "Pre-approval acceleration"],
        serviceAreas: ["New York, NY", "Jersey City, NJ", "Boston, MA"],
        yearsInBusiness: 14,
        completedProjects: 1260,
        responseTimeHours: 2,
        rating: 4.7,
        reviewCount: 301,
        bio: "Mortgage advisory and lending support for primary buyers, investors, and high-value loan structures.",
        certifications: ["NMLS Licensed Originator"],
        languages: ["English", "Hindi"],
        portfolio: [
            {
                title: "72-Hour Jumbo Pre-Approval Program",
                location: "New York, NY",
                summary: "Streamlined underwriting workflow for competitive offer timelines.",
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
            },
            {
                title: "Multi-Property Investor Package",
                location: "Jersey City, NJ",
                summary: "Financing structure for portfolio acquisition with phased disbursement.",
                image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=80",
            },
        ],
        reviews: [
            { name: "Emily Carter", role: "Agent", rating: 5, comment: "Fast pre-approval saved a complex deal." },
            { name: "Avery Cole", role: "Investor", rating: 4, comment: "Great terms and transparent communication." },
        ],
    },
    {
        id: "vendor-5",
        name: "Sophia Martinez",
        role: "vendor",
        avatar: "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=400&q=80",
        banner: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1400&q=80",
        company: "ClearTitle Legal",
        category: "Legal",
        specialties: ["Title review", "Contract risk checks", "Commercial transaction support"],
        serviceAreas: ["Dallas, TX", "Austin, TX", "Houston, TX"],
        yearsInBusiness: 16,
        completedProjects: 845,
        responseTimeHours: 5,
        rating: 4.8,
        reviewCount: 192,
        bio: "Real estate legal support team delivering clean title, contract confidence, and reduced closing risk.",
        certifications: ["Texas Bar Real Estate Section"],
        languages: ["English", "Spanish"],
        portfolio: [
            {
                title: "Mixed-Use Acquisition Closing Support",
                location: "Dallas, TX",
                summary: "Resolved title and lien issues ahead of financing deadline.",
                image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
            },
            {
                title: "Commercial Lease Legal Review Program",
                location: "Austin, TX",
                summary: "Standardized clause risk scoring for broker teams.",
                image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
            },
        ],
        reviews: [
            { name: "Isabella Rossi", role: "Agent", rating: 5, comment: "Their legal review prevented a major post-close issue." },
            { name: "Jordan Lee", role: "Seller", rating: 4, comment: "Clear and practical advice throughout closing." },
        ],
    },
    {
        id: "vendor-6",
        name: "Ethan Brooks",
        role: "vendor",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        banner: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        company: "BuildBridge Renovations",
        category: "Renovation",
        specialties: ["Pre-sale upgrades", "Kitchen & bath remodels", "Value-add renovations"],
        serviceAreas: ["Seattle, WA", "Portland, OR", "Bellevue, WA"],
        yearsInBusiness: 10,
        completedProjects: 430,
        responseTimeHours: 7,
        rating: 4.8,
        reviewCount: 142,
        bio: "Renovation partner for agents and sellers looking to maximize listing value before market launch.",
        certifications: ["Licensed General Contractor", "EPA Lead-Safe Certified"],
        languages: ["English"],
        portfolio: [
            {
                title: "Pre-List Kitchen Transformation",
                location: "Seattle, WA",
                summary: "4-week remodel that improved list-to-close margin by 11%.",
                image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
            },
            {
                title: "Condo Modernization Program",
                location: "Bellevue, WA",
                summary: "Targeted cosmetic upgrades for quicker showing-to-offer conversion.",
                image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80",
            },
        ],
        reviews: [
            { name: "Daniel Ortiz", role: "Agent", rating: 5, comment: "Reliable timeline and strong workmanship." },
            { name: "Sarah Seller", role: "Seller", rating: 4, comment: "Very smooth project management from start to finish." },
        ],
    },
];

export const MOCK_USERS = {
    buyer: {
        id: "user-1",
        name: "Alex Buyer",
        role: "buyer",
        avatar: "https://generated.vusercontent.net/placeholder-user.jpg",
        preferences: {
            budget: [500000, 1200000],
            locations: ["Downtown", "Westside"],
            types: ["Condo", "Single Family"],
        },
    },
    seller: {
        id: "user-2",
        name: "Sarah Seller",
        role: "seller",
        avatar: "https://generated.vusercontent.net/placeholder-user-2.jpg",
        properties: ["prop-1"],
    },
    agent: MOCK_AGENTS[0],
    broker: {
        id: MOCK_BROKERS[0].id,
        name: MOCK_BROKERS[0].name,
        role: "broker",
        agents: MOCK_BROKERS[0].agents,
        stats: {
            totalSold: MOCK_BROKERS[0].stats.totalSold,
            totalVolume: MOCK_BROKERS[0].stats.totalVolume,
        },
    },
    vendor: {
        id: MOCK_VENDORS[0].id,
        name: MOCK_VENDORS[0].company,
        role: "vendor",
        service: MOCK_VENDORS[0].category,
        rating: MOCK_VENDORS[0].rating,
    }
};

export const MOCK_LISTINGS = [
    {
        id: "prop-1",
        title: "Modern Glass Villa",
        price: 2500000,
        location: "Beverly Hills, CA",
        specs: { beds: 5, baths: 6, sqft: 4500 },
        images: [
            "https://images.unsplash.com/photo-1600596542815-2a4d9f6facbe?q=80&w=1200&fit=crop",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-1",
        status: "Active",
        offers: 2,
    },
    {
        id: "prop-2",
        title: "Downtown Penthouse",
        price: 1800000,
        location: "New York, NY",
        specs: { beds: 3, baths: 3, sqft: 2200 },
        images: [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-6",
        status: "Pending",
        offers: 5,
    },
    {
        id: "prop-3",
        title: "Pacific Heights Condo",
        price: 2100000,
        location: "San Francisco, CA",
        specs: { beds: 3, baths: 2, sqft: 1850 },
        images: [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-2",
        status: "Active",
        offers: 3,
    },
    {
        id: "prop-4",
        title: "Lakefront Family Home",
        price: 1450000,
        location: "Austin, TX",
        specs: { beds: 4, baths: 3, sqft: 3200 },
        images: [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-3",
        status: "Active",
        offers: 1,
    },
    {
        id: "prop-5",
        title: "Brickell Sky Residence",
        price: 3200000,
        location: "Miami, FL",
        specs: { beds: 4, baths: 4, sqft: 2900 },
        images: [
            "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-4",
        status: "Pending",
        offers: 4,
    },
    {
        id: "prop-6",
        title: "Capitol Hill Townhome",
        price: 1280000,
        location: "Seattle, WA",
        specs: { beds: 3, baths: 3, sqft: 2100 },
        images: [
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-5",
        status: "Active",
        offers: 2,
    },
    {
        id: "prop-7",
        title: "Gold Coast Skyline Condo",
        price: 1950000,
        location: "Chicago, IL",
        specs: { beds: 3, baths: 3, sqft: 2000 },
        images: [
            "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-7",
        status: "Active",
        offers: 4,
    },
    {
        id: "prop-8",
        title: "Cherry Creek Modern Estate",
        price: 2380000,
        location: "Denver, CO",
        specs: { beds: 5, baths: 4, sqft: 3900 },
        images: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-8",
        status: "Pending",
        offers: 3,
    },
    {
        id: "prop-9",
        title: "Uptown Mixed-Use Tower",
        price: 5400000,
        location: "Dallas, TX",
        specs: { beds: 0, baths: 0, sqft: 18000 },
        images: [
            "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-9",
        status: "Active",
        offers: 2,
    },
    {
        id: "prop-10",
        title: "Midtown Flex Office Campus",
        price: 4700000,
        location: "Atlanta, GA",
        specs: { beds: 0, baths: 0, sqft: 22000 },
        images: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-10",
        status: "Pending",
        offers: 1,
    },
    {
        id: "prop-11",
        title: "Beacon Hill Heritage Home",
        price: 1690000,
        location: "Boston, MA",
        specs: { beds: 4, baths: 3, sqft: 2800 },
        images: [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-11",
        status: "Active",
        offers: 3,
    },
    {
        id: "prop-12",
        title: "Georgetown Diplomatic Rowhouse",
        price: 3100000,
        location: "Washington, DC",
        specs: { beds: 5, baths: 4, sqft: 3600 },
        images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&fit=crop",
        ],
        agentId: "agent-12",
        status: "Active",
        offers: 5,
    },
];

export const MOCK_INTENTS = [
    {
        id: "intent-1",
        userId: "user-1",
        type: "buy",
        status: "active",
        requirements: "Looking for a 3 bedroom condo in downtown with a view.",
        aiConversations: [
            { role: "ai", content: "Hello Alex! I see you're looking for a condo. What is your budget range?" },
            { role: "user", content: "Around $800k to $1.2M" },
            { role: "ai", content: "Noted. Do you prefer a modern high-rise or a classic loft style?" },
        ]
    }
]
