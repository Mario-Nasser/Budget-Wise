export class AIIconService {
  /**
   * Locally maps keywords to Font Awesome v6 base icon names (without prefixes).
   * @param goalName The textual string describing the user's financial goal.
   * @returns The raw icon name string (e.g., "car", "plane", "bullseye").
   */
  static async generateIconName(goalName: string): Promise<string> {
    if (!goalName) return 'heart';

    // Convert to lowercase so it matches strings like "Car", "CAR", or "car"
    const name = goalName.toLowerCase().trim();

    // 1. Map keywords directly to raw Font Awesome icon base names
    const iconMap: Record<string, string> = {
      'car': 'car',
      'tesla': 'car',
      'vehicle': 'car',
      'bike': 'motorcycle',
      'bicycle': 'bicycle',
      
      'gift': 'gift',
      'present': 'gift',
      'birthday': 'gift',
      'christmas': 'gift',
      
      'house': 'house',
      'home': 'house',
      'rent': 'house',
      'apartment': 'building',
      
      'vacation': 'plane',
      'travel': 'plane',
      'flight': 'plane',
      'trip': 'suitcase',
      
      'laptop': 'laptop',
      'computer': 'desktop',
      'phone': 'mobile-screen-button',
      'tech': 'microchip',
      
      'wedding': 'ring',
      'marry': 'ring',
      
      'school': 'graduation-cap',
      'college': 'graduation-cap',
      'university': 'graduation-cap',
      'education': 'book',
      
      'health': 'heart-pulse',
      'medical': 'file-invoice-dollar',
      
      'crypto': 'bitcoin',
      'bitcoin': 'bitcoin',
      'stock': 'chart-line',
      'invest': 'chart-pie',
      
      'js': 'code',
      'code': 'code',
      'test': 'flask'
    };

    // 2. Loop through the map to see if the goal name contains any keyword
    for (const [keyword, iconName] of Object.entries(iconMap)) {
      if (name.includes(keyword)) {
        return iconName; // Returns just the raw name string (e.g. "car")
      }
    }

    // 3. Fallback/Default icon if no keyword matches
    return 'heart'; 
  }
}