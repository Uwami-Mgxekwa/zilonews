// Initialize Parse with your credentials
Parse.initialize(
    "W01TOpY5m8xUpj19yxv7oWMBqGKUzanibBEvUvtz", // App ID
    "g2PCtjKnCN4IJN3jSFMQwQKrtezuGgRlDbP7Mh6k"  // JS Key
);
Parse.serverURL = 'https://parseapi.back4app.com/';

const API = {
    /**
     * Fetch stories from Back4App
     * @param {string} category - The category to filter by (optional)
     * @param {number} limit - Number of stories to fetch
     */
    fetchStories: async (category = null, limit = 10) => {
        const Story = Parse.Object.extend("Story");
        const query = new Parse.Query(Story);
        
        if (category) {
            query.equalTo("category", category);
        }
        
        query.descending("createdAt");
        query.limit(limit);
        
        try {
            const results = await query.find();
            return results.map(story => ({
                id: story.id,
                title: story.get("title"),
                excerpt: story.get("excerpt"),
                content: story.get("content"),
                category: story.get("category"),
                author: story.get("author") || "ZiloNews Staff",
                image: story.get("image")?.url() || story.get("imageUrl") || "assets/logo.png",
                date: story.createdAt,
                readTime: story.get("readTime") || "5 min"
            }));
        } catch (error) {
            console.error("Error fetching stories from Back4App:", error);
            return [];
        }
    },

    /**
     * Subscribe to newsletter (can be stored in a 'Subscriber' class)
     */
    subscribe: async (email) => {
        const Subscriber = Parse.Object.extend("Subscriber");
        const sub = new Subscriber();
        sub.set("email", email);
        try {
            await sub.save();
            return true;
        } catch (error) {
            console.error("Subscription error:", error);
            return false;
        }
    }
};
