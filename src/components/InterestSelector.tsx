import { useState } from "react";

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
  showTitle?: boolean;
}

const HEALTH_INTERESTS = [
  "Nutrition",
  "Fitness & Exercise",
  "Mental Health",
  "Weight Management",
  "Diabetes Care",
  "Heart Health",
  "Women's Health",
  "Men's Health",
  "Pregnancy & Maternity",
  "Pediatric Health",
  "Senior Health",
  "Sleep & Recovery",
  "Stress Management",
  "Preventive Care",
  "Chronic Disease Management",
  "Alternative Medicine",
  "Supplements & Vitamins",
  "Skin Care",
  "Dental Health",
  "Vision & Eye Care",
  "Physical Therapy",
  "Yoga & Meditation",
  "Sports Medicine",
  "Addiction Recovery",
  "Cancer Care",
  "Autoimmune Conditions",
  "Digestive Health",
  "Respiratory Health",
  "Bone & Joint Health",
  "Hormonal Health"
];

export function InterestSelector({ 
  selectedInterests, 
  onInterestsChange, 
  maxSelections = 10,
  showTitle = true 
}: InterestSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInterests = HEALTH_INTERESTS.filter(interest =>
    interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      // Remove interest
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else {
      // Add interest - no limit restriction
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Health Interests</h3>
          <p className="text-sm text-gray-600">
            Select health topics you're interested in
          </p>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search health topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
      </div>

      {/* Selected count */}
      <div className="mb-3 text-sm text-gray-600">
        {selectedInterests.length} selected
      </div>

      {/* Interest chips */}
      <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
        {filteredInterests.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {interest}
              {isSelected && (
                <span className="ml-1">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}