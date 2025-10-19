// Profiles will come from backend - this array is now empty
export const dummyProfiles = [];

// Genre list for dropdown
export const genresList = [
  'Acid House',
  'Acid Techno',
  'Afrobeat',
  'Ambient',
  'Breaks',
  'Dark Techno',
  'Deep House',
  'Disco',
  'Drum & Bass',
  'Dubstep',
  'Electro',
  'Experimental',
  'Funk',
  'Garage',
  'House',
  'Industrial',
  'Latin House',
  'Melodic Techno',
  'Minimal Techno',
  'Progressive House',
  'Psytrance',
  'Soul',
  'Tech House',
  'Techno',
  'Trance'
];

// Zones and countries for calendar
export const zones = [
  'North America',
  'South America',
  'Europe',
  'Middle East',
  'Africa',
  'Asia',
  'Oceania'
];

export const countriesByZone = {
  'North America': ['United States', 'Canada', 'Mexico', 'Guatemala', 'Cuba', 'Dominican Republic', 'Costa Rica', 'Panama'],
  'South America': ['Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Switzerland', 'Austria', 'Poland', 'Russia', 'Ukraine', 'Greece', 'Portugal', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Ireland', 'Scotland', 'Malta', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania', 'Slovakia', 'Slovenia'],
  'Middle East': ['Israel', 'Lebanon', 'UAE', 'Saudi Arabia', 'Jordan', 'Turkey', 'Iran', 'Iraq', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Yemen', 'Syria'],
  'Africa': ['South Africa', 'Egypt', 'Morocco', 'Kenya', 'Nigeria', 'Ghana', 'Ethiopia', 'Tanzania', 'Tunisia', 'Algeria', 'Uganda', 'Senegal', 'Ivory Coast', 'Cameroon', 'Angola', 'Mozambique'],
  'Asia': ['Japan', 'China', 'South Korea', 'Thailand', 'Indonesia', 'Singapore', 'Philippines', 'Vietnam', 'India', 'Malaysia', 'Taiwan', 'Hong Kong', 'Cambodia', 'Myanmar', 'Bangladesh', 'Pakistan', 'Sri Lanka', 'Nepal', 'Laos', 'Mongolia', 'Kazakhstan'],
  'Oceania': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea']
};

export const citiesByCountry = {
  // North America
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Detroit', 'Boston', 'Seattle', 'Austin', 'Denver', 'Atlanta', 'Dallas', 'Houston', 'Phoenix', 'Philadelphia', 'Washington DC', 'Portland', 'Nashville', 'New Orleans'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Cancun', 'Tijuana', 'Playa del Carmen'],
  
  // South America
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília', 'Florianópolis', 'Curitiba'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Mar del Plata'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Cartagena', 'Barranquilla'],
  'Chile': ['Santiago', 'Valparaíso', 'Concepción'],
  'Peru': ['Lima', 'Cusco', 'Arequipa'],
  
  // Europe
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Bristol', 'Edinburgh', 'Liverpool', 'Newcastle', 'Cardiff', 'Belfast', 'Brighton', 'Sheffield'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Hannover'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Lille', 'Strasbourg', 'Nantes'],
  'Spain': ['Barcelona', 'Madrid', 'Ibiza', 'Valencia', 'Seville', 'Málaga', 'Bilbao', 'Zaragoza'],
  'Italy': ['Milan', 'Rome', 'Naples', 'Turin', 'Florence', 'Venice', 'Bologna', 'Genoa'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liège'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz'],
  'Poland': ['Warsaw', 'Krakow', 'Wrocław', 'Gdańsk', 'Poznań'],
  'Russia': ['Moscow', 'St. Petersburg', 'Novosibirsk', 'Yekaterinburg'],
  'Greece': ['Athens', 'Thessaloniki', 'Mykonos', 'Crete'],
  'Portugal': ['Lisbon', 'Porto', 'Faro', 'Madeira'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava'],
  'Hungary': ['Budapest', 'Debrecen'],
  'Romania': ['Bucharest', 'Cluj-Napoca', 'Timișoara'],
  'Croatia': ['Zagreb', 'Split', 'Dubrovnik'],
  'Ireland': ['Dublin', 'Cork', 'Galway'],
  
  // Middle East
  'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Antalya'],
  'Lebanon': ['Beirut'],
  
  // Asia
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Fukuoka', 'Sapporo', 'Yokohama', 'Kobe', 'Hiroshima'],
  'China': ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Hong Kong'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu'],
  'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Koh Samui'],
  'Indonesia': ['Jakarta', 'Bali', 'Surabaya', 'Bandung'],
  'Singapore': ['Singapore'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Kolkata', 'Chennai'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
  'Philippines': ['Manila', 'Cebu', 'Davao'],
  
  // Africa
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
  'Egypt': ['Cairo', 'Alexandria', 'Sharm El Sheikh'],
  'Morocco': ['Marrakech', 'Casablanca', 'Rabat', 'Fez'],
  'Kenya': ['Nairobi', 'Mombasa'],
  'Nigeria': ['Lagos', 'Abuja', 'Port Harcourt'],
  
  // Oceania
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Queenstown']
};