// Business profile constants and utilities for the discovery system

export const BUSINESS_CATEGORIES = [
  'cafe',
  'restaurant', 
  'co-op',
  'grocery',
  'laundromat',
  'library',
  'community-center',
  'shop',
  'salon',
  'gym',
  'church',
  'school',
  'office',
  'other'
] as const;

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number];

// Display names for business categories
export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  'cafe': 'Café',
  'restaurant': 'Restaurant',
  'co-op': 'Co-op',
  'grocery': 'Grocery Store',
  'laundromat': 'Laundromat',
  'library': 'Library',
  'community-center': 'Community Center',
  'shop': 'Shop',
  'salon': 'Salon/Spa',
  'gym': 'Gym/Fitness',
  'church': 'Church',
  'school': 'School',
  'office': 'Office',
  'other': 'Other'
};

// User-facing discovery categories
export const DISCOVERY_CATEGORIES = [
  'events',
  'services', 
  'community',
  'for-sale',
  'food',
  'other'
] as const;

export type DiscoveryCategory = typeof DISCOVERY_CATEGORIES[number];

export const DISCOVERY_CATEGORY_LABELS: Record<DiscoveryCategory, string> = {
  'events': 'Events',
  'services': 'Services',
  'community': 'Community',
  'for-sale': 'For Sale',
  'food': 'Food',
  'other': 'Other'
};

// Preset tags organized by common categories
export const PRESET_TAGS = {
  events: [
    'yoga', 'fitness', 'dance', 'art-class', 'workshop', 'meeting', 
    'concert', 'theater', 'festival', 'farmers-market', 'book-club',
    'movie-night', 'lecture', 'seminar', 'conference'
  ],
  services: [
    'handyman', 'tutor', 'babysitter', 'pet-care', 'cleaning', 
    'landscaping', 'lessons', 'repair', 'tax-prep', 'legal',
    'medical', 'therapy', 'massage', 'hair-cut', 'photography'
  ],
  community: [
    'volunteer', 'nonprofit', 'food-pantry', 'support-group', 
    'fundraiser', 'lost-found', 'blood-drive', 'charity',
    'civic-meeting', 'town-hall', 'neighborhood', 'safety'
  ],
  'for-sale': [
    'furniture', 'housing', 'rental', 'garage-sale', 'free-stuff', 
    'wanted', 'electronics', 'books', 'clothing', 'appliances',
    'tools', 'sports-equipment', 'musical-instruments'
  ],
  food: [
    'local-produce', 'baked-goods', 'farm-share', 'catering',
    'meal-delivery', 'cooking-class', 'wine-tasting', 'coffee',
    'restaurant-special', 'food-truck', 'farmers-market'
  ],
  general: [
    'announcements', 'jobs', 'art', 'music', 'news', 'weather',
    'schedule', 'hours', 'contact', 'website', 'social-media'
  ]
} as const;

// AI-suggested tags based on business category
export const SUGGESTED_TAGS_BY_CATEGORY: Record<BusinessCategory, string[]> = {
  'cafe': [
    'coffee', 'local-produce', 'baked-goods', 'art', 'music', 
    'community', 'wifi', 'meetings', 'book-club'
  ],
  'restaurant': [
    'food', 'catering', 'events', 'live-music', 'special-offers',
    'delivery', 'takeout', 'reservations'
  ],
  'co-op': [
    'local-produce', 'organic', 'community', 'volunteer', 'events',
    'sustainability', 'farm-share', 'bulk-goods'
  ],
  'grocery': [
    'local-produce', 'specials', 'sales', 'delivery', 'pharmacy',
    'services', 'community', 'events'
  ],
  'laundromat': [
    'services', 'hours', 'self-service', 'drop-off', 'dry-cleaning',
    'alterations', 'community'
  ],
  'library': [
    'events', 'book-club', 'classes', 'computer-access', 'meetings',
    'children', 'programs', 'volunteer', 'community'
  ],
  'community-center': [
    'events', 'classes', 'meetings', 'rentals', 'programs', 
    'volunteer', 'community', 'fitness', 'seniors', 'youth'
  ],
  'shop': [
    'sales', 'new-arrivals', 'services', 'repairs', 'custom-orders',
    'classes', 'events', 'local'
  ],
  'salon': [
    'appointments', 'services', 'specials', 'products', 'classes',
    'beauty', 'wellness', 'massage'
  ],
  'gym': [
    'fitness', 'classes', 'personal-training', 'membership', 'events',
    'wellness', 'nutrition', 'sports'
  ],
  'church': [
    'services', 'events', 'community', 'volunteer', 'meetings',
    'youth', 'seniors', 'food-pantry', 'support'
  ],
  'school': [
    'events', 'meetings', 'programs', 'classes', 'volunteer',
    'fundraiser', 'sports', 'arts', 'parent'
  ],
  'office': [
    'services', 'hours', 'appointments', 'meetings', 'professional',
    'consulting', 'contact'
  ],
  'other': [
    'services', 'events', 'community', 'announcements', 'contact'
  ]
};

// Map business categories to discovery categories
export const CATEGORY_MAPPING: Record<BusinessCategory, DiscoveryCategory[]> = {
  'cafe': ['food'],
  'restaurant': ['food'],
  'co-op': ['food', 'community'],
  'grocery': ['food'],
  'laundromat': ['services'],
  'library': ['community', 'events'],
  'community-center': ['community', 'events'],
  'shop': ['services', 'for-sale'],
  'salon': ['services'],
  'gym': ['events', 'services'],
  'church': ['community', 'events'],
  'school': ['community', 'events'],
  'office': ['services'],
  'other': ['other']
};

// Map tags to discovery categories
export const TAG_TO_CATEGORY: Record<string, DiscoveryCategory> = {
  // Events
  'yoga': 'events',
  'fitness': 'events', 
  'dance': 'events',
  'art-class': 'events',
  'workshop': 'events',
  'meeting': 'events',
  'concert': 'events',
  'theater': 'events',
  'festival': 'events',
  'farmers-market': 'events',
  'book-club': 'events',
  'movie-night': 'events',
  'lecture': 'events',
  'seminar': 'events',
  'conference': 'events',
  'classes': 'events',
  'events': 'events',
  
  // Services
  'handyman': 'services',
  'tutor': 'services',
  'babysitter': 'services', 
  'pet-care': 'services',
  'cleaning': 'services',
  'landscaping': 'services',
  'lessons': 'services',
  'repair': 'services',
  'tax-prep': 'services',
  'legal': 'services',
  'medical': 'services',
  'therapy': 'services',
  'massage': 'services',
  'hair-cut': 'services',
  'photography': 'services',
  'services': 'services',
  
  // Community
  'volunteer': 'community',
  'nonprofit': 'community',
  'food-pantry': 'community',
  'support-group': 'community',
  'fundraiser': 'community',
  'lost-found': 'community',
  'blood-drive': 'community',
  'charity': 'community',
  'civic-meeting': 'community',
  'town-hall': 'community',
  'neighborhood': 'community',
  'safety': 'community',
  'community': 'community',
  
  // For Sale
  'furniture': 'for-sale',
  'housing': 'for-sale',
  'rental': 'for-sale',
  'garage-sale': 'for-sale',
  'free-stuff': 'for-sale',
  'wanted': 'for-sale',
  'electronics': 'for-sale',
  'books': 'for-sale',
  'clothing': 'for-sale',
  'appliances': 'for-sale',
  'tools': 'for-sale',
  'sports-equipment': 'for-sale',
  'musical-instruments': 'for-sale',
  'for-sale': 'for-sale',
  'sale': 'for-sale',
  
  // Food
  'local-produce': 'food',
  'baked-goods': 'food',
  'farm-share': 'food',
  'catering': 'food',
  'meal-delivery': 'food',
  'cooking-class': 'food',
  'wine-tasting': 'food',
  'coffee': 'food',
  'restaurant-special': 'food',
  'food-truck': 'food',
  'food': 'food'
};

/**
 * Get discovery categories for a location based on business category and tags
 */
export function getDiscoveryCategories(
  businessCategory?: BusinessCategory | null,
  businessTags: string[] = []
): DiscoveryCategory[] {
  const categories = new Set<DiscoveryCategory>();
  
  // Add categories from business type
  if (businessCategory && CATEGORY_MAPPING[businessCategory]) {
    CATEGORY_MAPPING[businessCategory].forEach(cat => categories.add(cat));
  }
  
  // Add categories from tags
  businessTags.forEach(tag => {
    const category = TAG_TO_CATEGORY[tag.toLowerCase()];
    if (category) {
      categories.add(category);
    }
  });
  
  // Always include 'other' if no other categories match
  if (categories.size === 0) {
    categories.add('other');
  }
  
  return Array.from(categories);
}

/**
 * Normalize a tag to ensure consistency
 */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Get all available tags as a flat array (for autocomplete)
 */
export function getAllPresetTags(): string[] {
  return Object.values(PRESET_TAGS).flat();
}