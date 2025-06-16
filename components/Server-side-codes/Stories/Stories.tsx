import ClientStoriesSlider from "@/components/Client-side-server/StoriesSlider/StoriesSlider";
import fetchData from "@/api/fetchdata";

// Define the expected response shape
interface Blog {
  id: number;
  title: string;
  content: string;
  image: string;
  product_category_name: string;
  author: string;
  publish_date: string;
}

interface BlogResponse {
  blogs: Blog[];
}

export default async function Stories() {
  const data = (await fetchData("frontend/blogs/")) as BlogResponse;
  const blogs = data.blogs || [];

  return (
    <section className="pt-8 mb-3 px-4 sm:px-6 lg:px-8 bg-white">
      <h1
        className="text-2xl md:text-[48px] text-center font-playfair"
        style={{ color: "#3E3E3E" }}
      >
        READ OUR LATEST STORIES
      </h1>
      <div className="max-w-7xl mx-auto">
        {blogs.length > 0 ? (
          <ClientStoriesSlider blogs={blogs} />
        ) : (
          <p>Loading blogs...</p>
        )}
      </div>
    </section>
  );
}
