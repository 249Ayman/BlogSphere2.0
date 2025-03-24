import { storage } from './storage';
import { InsertUser, InsertPost, InsertComment } from '@shared/schema';
import { randomBytes, scryptSync } from 'crypto';

// Helper to hash password in the same way as in auth.ts
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  // Simple mock hash for the seed script
  return `${Buffer.from(password).toString('hex')}.${salt}`;
}

export async function seedDatabase() {
  // Check if users already exist to avoid duplicating data
  const existingUser = await storage.getUserByUsername('techwriter');
  if (existingUser) {
    console.log('Database already seeded, skipping seed process...');
    return { users: [], posts: [] };
  }
  
  console.log('Seeding database with sample users and posts...');

  // Create sample users
  const mockUsers = [
    {
      username: 'techwriter',
      email: 'tech@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Chen',
    },
    {
      username: 'travelblogger',
      email: 'travel@example.com',
      password: 'password123',
      firstName: 'Sofia',
      lastName: 'Rodriguez',
    },
    {
      username: 'foodielover',
      email: 'food@example.com',
      password: 'password123',
      firstName: 'James',
      lastName: 'Wilson',
    },
    {
      username: 'fitnessguru',
      email: 'fitness@example.com',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Taylor',
    },
  ];

  // Create the users
  const createdUsers = [];
  for (const mockUser of mockUsers) {
    const hashedPassword = await hashPassword(mockUser.password);
    
    const userData: InsertUser = {
      username: mockUser.username,
      email: mockUser.email,
      password: hashedPassword,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    };
    
    const user = await storage.createUser(userData);
    createdUsers.push(user);
    console.log(`Created user: ${user.username}`);
  }

  // Create mockup posts for each user
  const techPosts = [
    {
      title: 'The Future of AI in Everyday Life',
      excerpt: 'Exploring how artificial intelligence is transforming our daily experiences and what to expect in the coming years.',
      content: `<h2>AI is Everywhere</h2><p>From voice assistants to recommendation algorithms, artificial intelligence has become an integral part of our daily lives. This article explores the current state of AI technology and what advancements we can expect in the near future.</p><h3>Smart Homes and IoT</h3><p>The integration of AI with Internet of Things (IoT) devices is creating smarter homes that can adapt to our preferences and needs. Smart thermostats learn your temperature preferences, while AI-powered security systems can distinguish between family members and potential intruders.</p><h3>Healthcare Revolution</h3><p>AI is revolutionizing healthcare through improved diagnostics, personalized treatment plans, and drug discovery. Machine learning algorithms can detect patterns in medical images that might be missed by human eyes, potentially leading to earlier disease detection.</p>`,
      category: 'technology',
      featuredImage: 'https://images.unsplash.com/photo-1677442135128-8cd9d4c93474',
      published: true,
    },
    {
      title: 'Building Scalable Web Applications: Best Practices',
      excerpt: 'Learn the essential strategies and techniques for developing web applications that can handle growing user bases and increasing demands.',
      content: `<h2>Scalability Challenges</h2><p>As web applications grow in popularity, they face numerous challenges related to performance, reliability, and maintainability. This article outlines best practices for building applications that can scale effectively.</p><h3>Architecture Matters</h3><p>A well-designed architecture is the foundation of scalability. Microservices architecture allows different components to scale independently based on their specific requirements. This approach provides flexibility but comes with its own complexity in terms of service discovery and communication.</p><h3>Database Considerations</h3><p>Database selection and optimization are critical for scalable applications. Consider using a combination of relational and NoSQL databases based on your data structure and query patterns. Implement caching strategies to reduce database load for frequently accessed data.</p>`,
      category: 'technology',
      featuredImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      published: true,
    },
  ];
  
  const travelPosts = [
    {
      title: 'Hidden Gems of Southeast Asia',
      excerpt: 'Discover lesser-known but breathtaking destinations across Southeast Asia that offer authentic experiences away from the tourist crowds.',
      content: `<h2>Beyond the Tourist Trail</h2><p>Southeast Asia is known for destinations like Bangkok, Bali, and Singapore, but the region offers countless hidden treasures waiting to be discovered. This guide takes you off the beaten path to experience the authentic culture and natural beauty of the region.</p><h3>Kampot, Cambodia</h3><p>This riverside town offers a relaxed atmosphere, colonial architecture, and stunning surroundings. Take a boat trip along the Kampot River, explore pepper plantations, or visit the nearby Bokor National Park with its abandoned French hill station.</p><h3>Hpa-An, Myanmar</h3><p>Surrounded by dramatic karst mountains and caves, Hpa-An offers breathtaking landscapes without the crowds.</p>`,
      category: 'travel',
      featuredImage: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b',
      published: true,
    },
    {
      title: 'Sustainable Travel: Exploring Without Harming',
      excerpt: 'Practical tips and strategies for reducing your environmental impact while still enjoying enriching travel experiences around the world.',
      content: `<h2>Travel Consciously</h2><p>As global tourism increases, so does its environmental impact. This article explores how travelers can make more sustainable choices without sacrificing the quality of their experiences.</p><h3>Transportation Choices</h3><p>Air travel typically accounts for the largest portion of a trip's carbon footprint. Consider taking fewer but longer trips, choosing direct flights when possible, and exploring destinations accessible by train or bus. Once at your destination, use public transportation, bike rentals, or walk to explore.</p><h3>Accommodation Impact</h3><p>Seek out eco-friendly accommodations that implement water conservation measures, use renewable energy, and have waste reduction programs.</p>`,
      category: 'travel',
      featuredImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd',
      published: true,
    },
  ];
  
  const foodPosts = [
    {
      title: 'The Art of Fermentation: A Beginners Guide',
      excerpt: 'Learn how to create delicious and nutritious fermented foods at home with simple ingredients and basic equipment.',
      content: `<h2>Fermentation Fundamentals</h2><p>Fermentation is an ancient food preservation technique that not only extends shelf life but enhances flavors and nutritional benefits. This guide will introduce you to the basics of home fermentation with projects suitable for beginners.</p><h3>Why Ferment?</h3><p>Fermented foods are rich in probiotics that support gut health, aid digestion, and boost immunity. The process breaks down anti-nutrients, making minerals more bioavailable, and creates complex flavor profiles that add depth to your culinary creations.</p><h3>Starting with Sauerkraut</h3><p>Sauerkraut is the perfect entry point for fermentation beginners.</p>`,
      category: 'food',
      featuredImage: 'https://images.unsplash.com/photo-1636605083726-4de4b0c64e43',
      published: true,
    },
  ];
  
  const fitnessPosts = [
    {
      title: 'Building Strength After 40: Adapting Your Fitness Routine',
      excerpt: 'Practical strategies for maintaining and building strength as you age, with adjustments to protect joints and prevent injury.',
      content: `<h2>Strength Has No Age Limit</h2><p>Contrary to common belief, you can continue building strength well into your 40s, 50s, and beyond. This article explores how to adapt your fitness approach for long-term health and functionality.</p><h3>The Changing Body</h3><p>After 40, hormonal changes and a natural decline in muscle mass (sarcopenia) mean your body responds differently to exercise. Recovery takes longer, and joints may be less tolerant of high-impact activities. However, resistance training becomes even more important for maintaining muscle mass, bone density, and metabolic health.</p>`,
      category: 'fitness',
      featuredImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      published: true,
    },
  ];
  
  const lifestylePosts = [
    {
      title: 'Digital Minimalism: Reclaiming Attention in a Noisy World',
      excerpt: 'Practical strategies for creating healthier digital habits and reducing the overwhelming influence of technology on daily life.',
      content: `<h2>The Cost of Constant Connection</h2><p>In our hyper-connected world, the constant barrage of notifications, updates, and information comes at a cost to our attention, focus, and mental wellbeing. This article explores the philosophy of digital minimalism and offers practical steps for establishing a more intentional relationship with technology.</p><h3>Attention as a Resource</h3><p>Our attention is finite and increasingly valuable in the digital economy. Many apps and platforms are specifically designed to capture and hold our attention through various psychological triggers.</p>`,
      category: 'lifestyle',
      featuredImage: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546',
      published: true,
    },
  ];
  
  const businessPosts = [
    {
      title: 'Building a Purpose-Driven Business: Beyond Profit',
      excerpt: 'How aligning your business with a meaningful purpose can drive growth, engage employees, and create positive impact in todays marketplace.',
      content: `<h2>The Purpose Imperative</h2><p>Consumers and employees increasingly expect businesses to stand for something beyond profit. This article explores how building a purpose-driven company can become a competitive advantage while creating positive social impact.</p><h3>Finding Your Why</h3><p>A compelling purpose answers why your business exists beyond making money. It addresses what problem you are solving and who benefits from your solution. This purpose should be authentic, specific, and inspiring - connecting to human needs rather than product features.</p>`,
      category: 'business',
      featuredImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216',
      published: true,
    },
  ];
  
  const educationPosts = [
    {
      title: 'The Future of Learning: AI and Personalized Education',
      excerpt: 'How artificial intelligence is transforming education by creating customized learning experiences adapted to individual students needs and abilities.',
      content: `<h2>Education Reimagined</h2><p>Artificial intelligence is poised to revolutionize education by addressing one of its greatest challenges: providing personalized instruction at scale. This article explores current applications and future possibilities for AI in learning environments.</p><h3>Adaptive Learning Platforms</h3><p>AI-powered adaptive learning systems analyze students performance in real-time, identifying knowledge gaps and learning patterns. These platforms adjust difficulty levels, provide targeted practice, and recommend optimal learning pathways.</p>`,
      category: 'education',
      featuredImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8',
      published: true,
    },
  ];

  // Assign posts to users
  const allPostSets = [
    { posts: techPosts, userId: createdUsers[0].id },
    { posts: travelPosts, userId: createdUsers[1].id },
    { posts: foodPosts, userId: createdUsers[2].id },
    { posts: fitnessPosts, userId: createdUsers[3].id },
    { posts: lifestylePosts, userId: createdUsers[0].id },
    { posts: businessPosts, userId: createdUsers[1].id },
    { posts: educationPosts, userId: createdUsers[2].id },
  ];

  // Create the posts
  const createdPosts = [];
  for (const postSet of allPostSets) {
    for (const postData of postSet.posts) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
        
      const insertPostData: InsertPost = {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        slug,
        authorId: postSet.userId,
        status: postData.published ? 'published' : 'draft',
        category: postData.category,
        featuredImage: postData.featuredImage,
        tags: null,
        allowComments: true,
        publishedAt: postData.published ? new Date() : null,
      };
      
      const post = await storage.createPost(insertPostData);
      createdPosts.push(post);
      console.log(`Created post: ${post.title}`);
    }
  }

  // Add some sample comments
  const sampleComments = [
    "Great article! This really helped me understand the topic better.",
    "I've been looking for information like this. Thanks for sharing your expertise!",
    "Have you considered writing a follow-up piece on this subject? I'd love to learn more.",
    "This is exactly what I needed to read today. Very insightful.",
    "I disagree with some points here, but it's a well-written article nonetheless.",
    "Sharing this with my network. Really valuable information!",
  ];

  for (const post of createdPosts) {
    // Add 1-3 comments to each post
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      const randomUserIndex = Math.floor(Math.random() * createdUsers.length);
      const randomCommentIndex = Math.floor(Math.random() * sampleComments.length);
      
      // Create a properly typed comment
      const commentData: InsertComment = {
        content: sampleComments[randomCommentIndex],
        authorId: createdUsers[randomUserIndex].id,
        postId: post.id,
        status: 'approved',
        parentId: null,
      };
      
      await storage.createComment(commentData);
    }
  }

  console.log('Seeding completed successfully!');
  return { users: createdUsers, posts: createdPosts };
}