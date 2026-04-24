I'll analyze the codebase to understand the current implementation and create a detailed plan for AI-powered content recommendation.

Let me read the remaining parts of the schema and check for engagement tracking:

Now let me check the current feed implementation and how content is displayed:

Perfect! Now I have a comprehensive understanding of the codebase. Let me create a detailed implementation plan for AI-powered content recommendation.

## AI-Powered Content Recommendation System - Implementation Plan

Based on my analysis of your codebase, here's a detailed phased approach to implement AI-powered personalized content recommendations using Amazon Nova API:

---

### **CURRENT STATE ANALYSIS**

Your platform currently has:
- **Content Types**: Articles, Reels, Courses, Events, Bookings, Circles
- **User Engagement Data**: Likes, claps, comments, bookmarks, reads, follows, course enrollments, event participation
- **User Interests**: Static interests in profiles + dynamic interests from `userInterests.ts`
- **Generic Feed**: Content sorted by creation date (most recent first)
- **No AI Ranking**: All users see the same content in the same order

---

### **PHASE 1: Foundation & Infrastructure (Week 1-2)**

#### **1.1 Create AI Recommendation Service**
**Location**: `convex/aiRecommendations.ts`

**Components**:
- Nova API integration wrapper
- Content analysis functions
- User profile builder
- Scoring algorithm

**Key Functions**:
```typescript
// Analyze content using Nova AI
analyzeContent(contentType, contentId, contentData)
  - Extract text from articles/courses
  - Extract captions/tags from reels
  - Extract descriptions from events/bookings
  - Call Nova API to understand content semantics
  - Store analysis results in new table

// Build user interest profile
buildUserProfile(userId)
  - Aggregate from userInterests.ts data
  - Include engagement patterns (likes, claps, bookmarks)
  - Include social graph (following, followers)
  - Include consumption patterns (read articles, watched reels)
  - Return comprehensive user profile object

// Score content for user
scoreContentForUser(userId, contentId, contentType)
  - Get user profile
  - Get content analysis
  - Calculate relevance score (0-100)
  - Return score with reasoning
```

#### **1.2 New Database Tables**

**contentAnalysis** table:
```typescript
{
  contentType: string, // "article" | "reel" | "course" | "event" | "booking"
  contentId: string,
  aiAnalysis: {
    summary: string,
    topics: string[],
    keywords: string[],
    sentiment: string,
    category: string,
    targetAudience: string[],
    difficulty: string, // for courses
    healthTopics: string[], // specific to health platform
  },
  novaResponse: any, // raw Nova API response
  analyzedAt: number,
  expiresAt: number, // re-analyze after 30 days
}
```

**userRecommendationScores** table:
```typescript
{
  userId: string,
  contentType: string,
  contentId: string,
  score: number, // 0-100
  reasoning: string[], // why this was recommended
  calculatedAt: number,
  expiresAt: number, // recalculate after 24 hours
}
```

**recommendationCache** table:
```typescript
{
  userId: string,
  contentType: string, // "all" | "articles" | "reels" | "courses" | "events"
  rankedContentIds: string[], // ordered by score
  generatedAt: number,
  expiresAt: number, // refresh after 6 hours
}
```

---

### **PHASE 2: Content Analysis Pipeline (Week 2-3)**

#### **2.1 Batch Content Analysis**
**Location**: `convex/aiRecommendations.ts`

**Process**:
1. **Scheduled Job** (runs every 6 hours):
   - Find all content without analysis or expired analysis
   - Batch process 50 items at a time
   - Call Nova API for each item
   - Store results in `contentAnalysis` table

2. **Real-time Analysis** (on content creation):
   - When article/reel/course is created
   - Immediately analyze with Nova API
   - Store analysis before publishing

**Nova API Integration**:
```typescript
async function analyzeWithNova(content: {
  type: string,
  title?: string,
  text?: string,
  caption?: string,
  tags?: string[],
  description?: string
}) {
  const prompt = buildAnalysisPrompt(content);
  
  const response = await fetch('https://api.nova.amazon.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NOVA_API_KEY}`
    },
    body: JSON.stringify({
      model: 'nova-2-lite-v1',
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: prompt
        }]
      }]
    })
  });
  
  return parseNovaResponse(response);
}
```

**Analysis Prompts**:
- **Articles**: "Analyze this health article. Extract: main topics, health conditions discussed, target audience (patients/professionals), difficulty level, key takeaways, sentiment."
- **Reels**: "Analyze this health video caption and tags. Extract: main topic, health focus, target audience, engagement type (educational/motivational/entertainment)."
- **Courses**: "Analyze this course. Extract: learning objectives, prerequisites, difficulty level, health specializations covered, target learners."
- **Events**: "Analyze this health event. Extract: event type, target audience, health topics, expertise level required."

---

### **PHASE 3: User Profile & Scoring Engine (Week 3-4)**

#### **3.1 Enhanced User Profile Builder**
**Location**: `convex/aiRecommendations.ts`

**Aggregates**:
1. **Static Interests** (from profile)
2. **Content Engagement**:
   - Liked articles/reels (with tags)
   - Clapped articles (high engagement signal)
   - Bookmarked content (strong interest signal)
   - Read articles (consumption pattern)
   - Watched reels (consumption pattern)
3. **Social Signals**:
   - Following (interest in creators)
   - Followers (influence level)
   - Mutual connections
4. **Learning Behavior**:
   - Enrolled courses
   - Course progress
   - Completed courses
5. **Professional Context**:
   - Booking provider status
   - Specialization
   - Event participation
6. **Temporal Patterns**:
   - Active hours
   - Engagement frequency
   - Content consumption rate

#### **3.2 Scoring Algorithm**

**Multi-factor scoring** (0-100 scale):

```typescript
function calculateRecommendationScore(
  userProfile: UserProfile,
  contentAnalysis: ContentAnalysis
): number {
  let score = 0;
  
  // 1. Topic Match (40 points max)
  const topicScore = calculateTopicMatch(
    userProfile.interests,
    contentAnalysis.topics
  );
  score += topicScore * 0.4;
  
  // 2. Social Signal (20 points max)
  const socialScore = calculateSocialScore(
    userProfile.following,
    contentAnalysis.authorId
  );
  score += socialScore * 0.2;
  
  // 3. Engagement Pattern (20 points max)
  const engagementScore = calculateEngagementMatch(
    userProfile.engagementHistory,
    contentAnalysis
  );
  score += engagementScore * 0.2;
  
  // 4. Freshness (10 points max)
  const freshnessScore = calculateFreshness(
    contentAnalysis.createdAt
  );
  score += freshnessScore * 0.1;
  
  // 5. Diversity (10 points max)
  const diversityScore = calculateDiversity(
    userProfile.recentlyViewed,
    contentAnalysis
  );
  score += diversityScore * 0.1;
  
  return Math.round(score);
}
```

**Scoring Factors**:
- **Topic Match**: Cosine similarity between user interests and content topics
- **Social Signal**: Following author = +20, mutual connection = +15, same specialization = +10
- **Engagement Pattern**: Similar to previously liked content = +20
- **Freshness**: New content (< 24h) = +10, decays over time
- **Diversity**: Prevents echo chamber, rewards exploring new topics = +10

---

### **PHASE 4: Recommendation Queries (Week 4-5)**

#### **4.1 New Convex Queries**
**Location**: `convex/aiRecommendations.ts`

```typescript
// Get personalized feed for user
export const getPersonalizedFeed = query({
  args: { 
    contentType: v.optional(v.string()), // "all" | "articles" | "reels" | "courses"
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    // Check cache first
    const cached = await getCachedRecommendations(ctx, userId, args.contentType);
    if (cached && !isExpired(cached)) {
      return paginateResults(cached.rankedContentIds, args.limit, args.offset);
    }
    
    // Generate fresh recommendations
    const recommendations = await generateRecommendations(ctx, userId, args.contentType);
    
    // Cache results
    await cacheRecommendations(ctx, userId, args.contentType, recommendations);
    
    return paginateResults(recommendations, args.limit, args.offset);
  }
});

// Get recommendation explanation
export const getRecommendationReasoning = query({
  args: { 
    contentId: v.string(),
    contentType: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const score = await ctx.db
      .query("userRecommendationScores")
      .withIndex("by_user_content", q => 
        q.eq("userId", userId)
         .eq("contentType", args.contentType)
         .eq("contentId", args.contentId)
      )
      .first();
    
    return {
      score: score?.score || 0,
      reasoning: score?.reasoning || []
    };
  }
});
```

#### **4.2 Update Existing Queries**

**Modify these files**:
- `convex/feed.ts` - Add AI ranking to `listUnifiedFeed`
- `convex/articles.ts` - Add AI ranking to `listFeed`
- `convex/reels.ts` - Add AI ranking to `listReels`
- `convex/courses.ts` - Add AI ranking to `listCourses`
- `convex/events.ts` - Add AI ranking to `getPublicEvents`
- `convex/bookings.ts` - Add AI ranking to provider discovery

**Pattern**:
```typescript
// Before: Generic query
const content = await ctx.db.query("articles")
  .withIndex("by_status", q => q.eq("status", "PUBLISHED"))
  .order("desc")
  .take(limit);

// After: AI-ranked query
const userId = await getAuthUserId(ctx);
if (userId) {
  // Get personalized ranking
  const rankedIds = await getPersonalizedRanking(ctx, userId, "articles");
  const content = await fetchContentByIds(ctx, rankedIds, limit);
} else {
  // Fallback to generic for non-authenticated users
  const content = await ctx.db.query("articles")
    .withIndex("by_status", q => q.eq("status", "PUBLISHED"))
    .order("desc")
    .take(limit);
}
```

---

### **PHASE 5: Frontend Integration (Week 5-6)**

#### **5.1 Update Feed Components**

**Files to modify**:
- `src/components/ForYouTab.tsx`
- `src/components/ReelsScreen.tsx`
- `src/components/LearnScreen.tsx`
- `src/components/StreamScreen.tsx`

**Changes**:
```typescript
// Before
const content = useQuery(api.feed.listUnifiedFeed, { limit: 20 });

// After
const content = useQuery(api.aiRecommendations.getPersonalizedFeed, { 
  contentType: "all",
  limit: 20 
});
```

#### **5.2 Add Recommendation Indicators**

**Visual feedback**:
- Badge: "Recommended for you" on highly scored content
- Tooltip: "Why this?" button showing reasoning
- Diversity indicator: "Exploring new topics" for diverse recommendations

**Component**:
```typescript
function RecommendationBadge({ contentId, contentType }) {
  const reasoning = useQuery(api.aiRecommendations.getRecommendationReasoning, {
    contentId,
    contentType
  });
  
  if (!reasoning || reasoning.score < 70) return null;
  
  return (
    <div className="flex items-center space-x-2">
      <span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs">
        ⭐ Recommended for you
      </span>
      <button onClick={() => showReasoning(reasoning.reasoning)}>
        <i className="fas fa-info-circle text-gray-400" />
      </button>
    </div>
  );
}
```

---

### **PHASE 6: Optimization & Monitoring (Week 6-7)**

#### **6.1 Performance Optimization**

**Caching Strategy**:
- User recommendations: 6-hour cache
- Content analysis: 30-day cache
- Batch processing: Off-peak hours
- Incremental updates: Only new content

**Database Indexes**:
```typescript
// Add to schema.ts
.index("by_user_content", ["userId", "contentType", "contentId"])
.index("by_score", ["score"])
.index("by_expires", ["expiresAt"])
```

#### **6.2 Monitoring & Analytics**

**Track**:
- Recommendation accuracy (click-through rate)
- User engagement with recommended content
- Nova API usage and costs
- Cache hit rates
- Processing times

**New table**:
```typescript
recommendationMetrics: defineTable({
  userId: string,
  contentId: string,
  contentType: string,
  score: number,
  wasShown: boolean,
  wasClicked: boolean,
  wasLiked: boolean,
  wasBookmarked: boolean,
  timeSpent: number,
  recordedAt: number
})
```

---

### **PHASE 7: Advanced Features (Week 7-8)**

#### **7.1 Contextual Recommendations**

**Time-based**:
- Morning: Educational content
- Evening: Entertainment/lighter content
- Weekend: Longer courses/events

**Mood-based** (from engagement patterns):
- High engagement: Challenging content
- Low engagement: Easier, motivational content

**Goal-based**:
- Learning path recommendations
- Course progression suggestions
- Expert discovery for specific needs

#### **7.2 Collaborative Filtering**

**Similar users**:
- Find users with similar interests
- Recommend content they engaged with
- "Users like you also enjoyed..."

**Social recommendations**:
- "Your connections are reading..."
- "Trending in your network"

---

### **IMPLEMENTATION PRIORITIES**

**Must-Have (MVP)**:
1. Content analysis pipeline
2. Basic scoring algorithm
3. Personalized feed for articles & reels
4. Caching system

**Should-Have**:
1. Course recommendations
2. Event recommendations
3. Recommendation explanations
4. Performance monitoring

**Nice-to-Have**:
1. Contextual recommendations
2. Collaborative filtering
3. A/B testing framework
4. Real-time updates

---

### **TECHNICAL CONSIDERATIONS**

**Nova API Usage**:
- **Cost**: ~$0.0001 per request (estimate)
- **Rate Limits**: Batch processing to stay within limits
- **Fallback**: Generic ranking if API fails

**Scalability**:
- Process 1000 users/hour
- Analyze 500 content items/hour
- Cache aggressively
- Use background jobs for heavy lifting

**Privacy**:
- User profiles stay server-side
- No PII sent to Nova API
- Anonymize data for analysis
- GDPR-compliant data handling

---

### **SUCCESS METRICS**

**Engagement**:
- 30% increase in content views
- 25% increase in time spent
- 20% increase in likes/bookmarks

**Personalization**:
- 80%+ users see unique feed order
- 70%+ click-through on top recommendations
- 50%+ engagement with recommended content

**System Health**:
- < 2s recommendation generation time
- 90%+ cache hit rate
- < 1% API error rate

---

This plan provides a comprehensive, phased approach to implementing AI-powered recommendations while maintaining system performance and user privacy. Each phase builds on the previous one, allowing for iterative development and testing.

---

## **TAB-SPECIFIC AI RECOMMENDATION REFINEMENT**

Now let's refine the AI recommendation system to address each tab's unique characteristics, user intent, and content types:

---

### **1. FOR YOU TAB - Discovery & Engagement Feed**

**User Intent**: Discover diverse, engaging content from across the platform

**Content Types**: Articles + Reels (mixed feed)

**Recommendation Strategy**: Balanced discovery with personalization

#### **Scoring Factors (Weighted)**:
1. **Interest Match (30%)**: Match content tags with user's static + dynamic interests
2. **Social Signal (25%)**: Content from followed users, mutual connections
3. **Engagement Quality (20%)**: High claps, likes, comments indicate quality
4. **Freshness (15%)**: Prioritize recent content (< 48 hours)
5. **Diversity (10%)**: Introduce new topics to prevent echo chamber

#### **Unique Features**:
- **Content Mix Algorithm**: Alternate between articles and reels (60% articles, 40% reels)
- **Trending Boost**: Surface content with rapid engagement growth
- **Creator Discovery**: 20% of feed from creators user doesn't follow
- **Serendipity Factor**: 10% completely random high-quality content

#### **Nova AI Prompts**:
```
For Articles:
"Analyze this health article for the For You feed. Extract:
- Main health topics and conditions discussed
- Target audience (patients, professionals, general public)
- Content depth (beginner, intermediate, advanced)
- Engagement potential (educational, inspirational, controversial)
- Emotional tone (informative, empathetic, urgent)
- Actionability (practical tips vs theoretical knowledge)"

For Reels:
"Analyze this health video reel for the For You feed. Extract:
- Primary health topic or message
- Content format (tutorial, story, motivation, entertainment)
- Visual appeal and production quality indicators
- Target demographic
- Shareability potential
- Call-to-action type"
```

#### **Feed Composition**:
```typescript
// For You Feed Algorithm
{
  personalizedContent: 60%, // Based on user interests
  socialContent: 20%,       // From followed users
  trendingContent: 10%,     // Platform-wide trending
  discoveryContent: 10%     // Serendipity/exploration
}
```

---

### **2. LEARN TAB - Educational Content & Courses**

**User Intent**: Learn, upskill, and consume structured educational content

**Content Types**: Courses + Course-related Articles + Course-related Reels

**View Modes**: 
- "All Content" - Discover all educational content
- "My Content" - Content user created
- "Enrolled" - Content from enrolled courses

**Recommendation Strategy**: Learning path optimization

#### **Scoring Factors (Weighted)**:
1. **Learning Goals Alignment (35%)**: Match with user's enrolled courses, completed content
2. **Skill Level Match (25%)**: Beginner → Intermediate → Advanced progression
3. **Topic Continuity (20%)**: Related to recently consumed educational content
4. **Completion Likelihood (10%)**: Based on user's course completion rate
5. **Instructor Quality (10%)**: Based on instructor's ratings, follower count

#### **Unique Features**:
- **Learning Path Suggestions**: "Based on your progress in [Course X], try [Course Y]"
- **Skill Gap Analysis**: Identify missing knowledge areas
- **Progressive Difficulty**: Recommend harder content as user progresses
- **Course Bundling**: Suggest complementary courses
- **Time-to-Complete Estimation**: Show realistic completion times

#### **Nova AI Prompts**:
```
For Courses:
"Analyze this health course for learning recommendations. Extract:
- Learning objectives and outcomes
- Prerequisites and required knowledge
- Difficulty level (beginner/intermediate/advanced)
- Time commitment required
- Practical vs theoretical balance
- Certification or credential value
- Health specializations covered (cardiology, nutrition, mental health, etc.)
- Target learner profile (students, professionals, patients, caregivers)"

For Course Articles:
"Analyze this course article. Extract:
- Core concepts taught
- Prerequisite knowledge required
- Complexity level
- Practical exercises or applications
- Related topics for further learning
- Knowledge dependencies (what should be learned first)"

For Course Reels:
"Analyze this educational video. Extract:
- Teaching method (demonstration, lecture, case study)
- Key learning points
- Visual aids and clarity
- Engagement techniques used
- Supplementary materials needed"
```

#### **View Mode Algorithms**:

**All Content Mode**:
```typescript
{
  recommendedCourses: 40%,      // AI-matched courses
  popularInCategory: 20%,       // Trending in user's interests
  newReleases: 15%,             // Recently published courses
  expertInstructors: 15%,       // From highly-rated instructors
  relatedToEnrolled: 10%        // Similar to enrolled courses
}
```

**My Content Mode**:
```typescript
{
  recentlyCreated: 50%,         // User's latest content
  highPerforming: 30%,          // User's most engaged content
  needsUpdate: 20%              // Content that could be refreshed
}
```

**Enrolled Mode**:
```typescript
{
  nextInSequence: 40%,          // Next lesson in enrolled courses
  incompleteContent: 30%,       // Started but not finished
  relatedSupplemental: 20%,     // Extra materials for enrolled courses
  reviewContent: 10%            // Previously completed for review
}
```

#### **Learning Analytics Integration**:
- Track time spent on content
- Monitor completion rates
- Identify drop-off points
- Suggest easier alternatives if user struggles
- Recommend advanced content if user excels

---

### **3. BOOKING TAB - Expert Discovery & Session Booking**

**User Intent**: Find and book healthcare experts for 1-on-1 or group sessions

**Content Types**: 
- Booking Providers (1-on-1 sessions)
- Events (group sessions)

**Recommendation Strategy**: Expert-patient matching optimization

#### **Scoring Factors (Weighted)**:
1. **Specialization Match (40%)**: Match provider expertise with user's health interests/needs
2. **Availability Fit (20%)**: Provider's schedule aligns with user's active hours
3. **Price Compatibility (15%)**: Within user's typical spending range
4. **Social Proof (15%)**: Reviews, ratings, successful bookings
5. **Geographic/Cultural Fit (10%)**: Language, timezone, cultural considerations

#### **Unique Features**:
- **Health Profile Matching**: Match providers to user's health conditions/interests
- **Referral Intelligence**: Prioritize providers referred by user's network
- **Session History**: Recommend similar providers to previously booked ones
- **Urgency Detection**: Prioritize immediate availability for urgent needs
- **Group Event Matching**: Suggest events based on user's schedule and interests

#### **Nova AI Prompts**:
```
For Booking Providers:
"Analyze this healthcare provider profile for booking recommendations. Extract:
- Medical specializations and expertise areas
- Patient demographics served (age groups, conditions)
- Communication style (formal, casual, empathetic)
- Session focus (diagnosis, treatment, counseling, education)
- Unique value propositions
- Ideal patient profile
- Cultural or linguistic specializations"

For Events:
"Analyze this group health event for booking recommendations. Extract:
- Event type (workshop, seminar, support group, Q&A)
- Health topics covered
- Target audience (patients, caregivers, professionals)
- Interaction level (lecture, interactive, hands-on)
- Expertise level required
- Expected outcomes and benefits
- Community building potential"
```

#### **Provider Ranking Algorithm**:
```typescript
{
  perfectMatch: 30%,           // Exact specialization + availability
  highlyRecommended: 25%,      // Strong social proof + good match
  newExperts: 15%,             // Recently joined, high credentials
  popularInNetwork: 15%,       // Booked by user's connections
  affordableOptions: 10%,      // Within user's price range
  immediateAvailability: 5%    // Available today/tomorrow
}
```

#### **Event Ranking Algorithm**:
```typescript
{
  topicMatch: 35%,             // Matches user's health interests
  scheduleCompatibility: 25%,  // Fits user's available times
  socialRelevance: 20%,        // Friends/connections attending
  fillingFast: 10%,            // Limited spots remaining
  newEvents: 10%               // Recently announced
}
```

#### **Smart Filters**:
- **Intelligent Price Range**: Auto-suggest based on user's booking history
- **Availability Prediction**: Show providers likely available at user's preferred times
- **Specialization Clustering**: Group similar specializations together
- **Session Type Preference**: Learn if user prefers 1-on-1 vs group

#### **Booking Context Awareness**:
- **First-time bookers**: Prioritize highly-rated, welcoming providers
- **Repeat bookers**: Suggest similar providers or same provider for follow-ups
- **Event attendees**: Recommend related events or provider's 1-on-1 sessions
- **Referral recipients**: Highlight referred providers prominently

---

### **4. COMMUNITY TAB - Circle Discovery & Engagement**

**User Intent**: Find and join communities, engage in group discussions

**Content Types**: 
- Public Circles (browseable)
- My Circles (joined circles)
- Circle Events
- Expert Requests

**Recommendation Strategy**: Community fit and engagement optimization

#### **Scoring Factors (Weighted)**:
1. **Topic Alignment (35%)**: Circle topics match user's interests
2. **Activity Level (25%)**: Active circles with regular engagement
3. **Member Compatibility (20%)**: Similar users are members
4. **Size Preference (10%)**: User's preference for large vs intimate groups
5. **Access Type (10%)**: Free vs paid based on user's payment history

#### **Unique Features**:
- **Community Health Score**: Measure engagement quality, not just quantity
- **Member Similarity**: "Users like you are in this circle"
- **Topic Clustering**: Group related circles together
- **Growth Trajectory**: Highlight fast-growing circles
- **Expert Presence**: Circles with verified experts

#### **Nova AI Prompts**:
```
For Circles:
"Analyze this community circle for recommendations. Extract:
- Primary health topics and focus areas
- Community culture (supportive, educational, social, professional)
- Member demographics and personas
- Engagement style (casual chat, structured discussions, Q&A)
- Value proposition (support, learning, networking, resources)
- Moderation style (strict, relaxed, admin-only posting)
- Ideal member profile
- Community maturity (new, established, thriving)"

For Circle Events:
"Analyze this circle event for recommendations. Extract:
- Event purpose (education, networking, support, celebration)
- Participation requirements (members-only, open, paid)
- Interaction format (presentation, discussion, workshop)
- Expected outcomes
- Community building potential"

For Expert Requests:
"Analyze this expert request for recommendations. Extract:
- Required expertise and skills
- Project scope and complexity
- Time commitment expected
- Collaboration style needed
- Ideal expert profile
- Value to expert (compensation, exposure, impact)"
```

#### **Circle Discovery Algorithm**:

**Browse Mode**:
```typescript
{
  perfectMatch: 30%,           // Exact topic + activity level match
  trending: 20%,               // Growing circles in user's interests
  friendsIn: 20%,              // Circles user's connections joined
  newCircles: 15%,             // Recently created, high quality
  diverseTopics: 15%           // Explore new interest areas
}
```

**My Circles Mode**:
```typescript
{
  mostActive: 40%,             // Circles with recent activity
  unreadMessages: 30%,         // Circles with unread content
  upcomingEvents: 20%,         // Circles with scheduled events
  needsAttention: 10%          // Circles user hasn't visited recently
}
```

#### **Circle Engagement Prediction**:
- **Posting Likelihood**: Predict if user will actively post or lurk
- **Retention Probability**: Likelihood user stays active in circle
- **Value Alignment**: Match circle culture with user's engagement style
- **Time Commitment**: Match circle activity level with user's availability

#### **Expert Request Matching**:
```typescript
{
  skillMatch: 40%,             // Expert's skills match request
  availabilityMatch: 25%,      // Expert has time for project
  compensationFit: 20%,        // Payment aligns with expert's rates
  interestAlignment: 15%       // Project aligns with expert's interests
}
```

#### **Circle Health Metrics**:
- **Engagement Rate**: Messages per member per week
- **Response Time**: How quickly members respond
- **Member Retention**: How long members stay active
- **Content Quality**: Ratio of valuable vs spam messages
- **Expert Participation**: Presence of verified experts

---

### **CROSS-TAB INTELLIGENCE**

The AI system should learn from behavior across all tabs to improve recommendations:

#### **Behavioral Signals**:
1. **For You → Learn**: User likes educational articles → Recommend related courses
2. **Learn → Booking**: User completes course → Recommend instructor's 1-on-1 sessions
3. **Booking → Community**: User books expert → Recommend expert's circles
4. **Community → For You**: User engages in circle → Recommend related content
5. **For You → Booking**: User reads health articles → Recommend relevant specialists

#### **User Journey Mapping**:
```typescript
// Example: User interested in mental health
{
  forYou: [
    "Mental health awareness articles",
    "Meditation technique reels",
    "Anxiety management content"
  ],
  learn: [
    "Introduction to CBT course",
    "Mindfulness for beginners",
    "Stress management techniques"
  ],
  booking: [
    "Licensed therapists",
    "Mental health counselors",
    "Group therapy sessions"
  ],
  community: [
    "Anxiety support circle",
    "Mental wellness community",
    "Meditation practice group"
  ]
}
```

#### **Contextual Awareness**:
- **Time of Day**: Morning → Motivational content, Evening → Relaxation content
- **Day of Week**: Weekday → Quick tips, Weekend → In-depth courses
- **Season**: Winter → Mental health focus, Summer → Fitness content
- **User Mood**: Detected from engagement patterns

#### **Progressive Profiling**:
- **Week 1**: Learn basic interests from explicit selections
- **Week 2-4**: Refine based on engagement patterns
- **Month 2+**: Predict needs before user searches
- **Month 6+**: Anticipate life stage changes (new parent, aging parent care, etc.)

---

### **IMPLEMENTATION PRIORITY BY TAB**

**Phase 1 (Weeks 1-3)**: For You Tab
- Highest traffic, biggest impact
- Simpler content types (articles + reels)
- Foundation for other tabs

**Phase 2 (Weeks 4-6)**: Learn Tab
- Clear user intent (learning)
- Structured content (courses)
- Measurable outcomes (completion rates)

**Phase 3 (Weeks 7-9)**: Booking Tab
- High-value transactions
- Complex matching requirements
- Revenue impact

**Phase 4 (Weeks 10-12)**: Community Tab
- Most complex (multiple content types)
- Requires social graph analysis
- Builds on insights from other tabs

---

### **SUCCESS METRICS BY TAB**

**For You Tab**:
- Time spent on feed: +30%
- Content engagement rate: +25%
- Creator discovery: +40%
- Return visits per day: +20%

**Learn Tab**:
- Course enrollment rate: +35%
- Course completion rate: +25%
- Time spent learning: +40%
- Cross-course enrollment: +30%

**Booking Tab**:
- Booking conversion rate: +30%
- Average booking value: +15%
- Repeat booking rate: +25%
- Provider discovery: +40%

**Community Tab**:
- Circle join rate: +35%
- Member retention: +30%
- Message engagement: +40%
- Expert request fulfillment: +25%

---

This refined approach ensures each tab delivers personalized, contextually-aware recommendations that match user intent and drive meaningful engagement.