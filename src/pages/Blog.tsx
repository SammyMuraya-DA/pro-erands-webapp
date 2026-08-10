import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "5 Ways to Save Time on Your Weekly Errands",
    excerpt: "Discover smart strategies to streamline your errands and reclaim your precious time.",
    category: "Tips",
    author: "Sarah Mwangi",
    date: "Dec 5, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "How Pro Errands Helped Mama Njeri's Restaurant Grow",
    excerpt: "A success story of how a small restaurant transformed their delivery operations.",
    category: "Case Studies",
    author: "John Kariuki",
    date: "Dec 2, 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "The Complete Guide to Same-Day Delivery in Nairobi",
    excerpt: "Everything you need to know about getting items delivered across the city in hours.",
    category: "Guides",
    author: "Grace Wanjiku",
    date: "Nov 28, 2024",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "Why Businesses Are Outsourcing Their Logistics",
    excerpt: "The benefits of partnering with errand services for your business operations.",
    category: "Business",
    author: "David Ochieng",
    date: "Nov 25, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    title: "Holiday Shopping Made Easy with Pro Errands",
    excerpt: "Beat the holiday rush by letting us handle your gift shopping and deliveries.",
    category: "Tips",
    author: "Sarah Mwangi",
    date: "Nov 20, 2024",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    title: "Meet Our Riders: The Heroes Behind Every Delivery",
    excerpt: "Get to know the dedicated team that makes Pro Errands possible.",
    category: "Stories",
    author: "John Kariuki",
    date: "Nov 15, 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  },
];

const categories = ["All", "Tips", "Case Studies", "Business", "Guides", "Stories"];

const Blog = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted section-padding">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Blog & Resources
            </h1>
            <p className="text-muted-foreground text-lg">
              Tips, stories, and insights to help you make the most of your time.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-background border-b border-border sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Featured Post */}
          <div className="mb-12">
            <Link
              to={`/blog/${blogPosts[0].id}`}
              className="group grid lg:grid-cols-2 gap-8 bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all"
            >
              <div className="aspect-video lg:aspect-auto overflow-hidden">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                  {blogPosts[0].category}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {blogPosts[0].date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Other Posts */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block text-primary font-medium text-xs uppercase tracking-wider mb-2">
                    {post.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-secondary-foreground/70 mb-6">
            Subscribe to our newsletter for the latest tips, stories, and updates.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button variant="hero">Subscribe</Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
