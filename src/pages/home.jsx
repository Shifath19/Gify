import {useEffect, useState, useCallback} from "react";
import {GifState} from "../context/gif-context";

import Gif from "../components/gif";
import FilterGif from "../components/filter-gif";
import TrendingSearches from "../components/trending-searches"; // Import the new component

function Home() {
  const {gf, gifs, setGifs, filter} = GifState();
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [trendingTerms, setTrendingTerms] = useState([]); // State for trending search terms

  const fetchTrendingGIFs = useCallback(async (currentOffset) => {
    if (loading) return;
    setLoading(true);
    try {
      const {data: newGifs} = await gf.trending({
        offset: currentOffset,
        limit: 20,
        type: filter,
        rating: "g",
      });
      setGifs((prevGifs) => {
        // Reset gifs if it's a new filter
        if (currentOffset === 0) return newGifs;
        return [...prevGifs, ...newGifs];
      });
      setOffset(currentOffset + newGifs.length);
    } catch (error) {
      console.error("Failed to fetch trending GIFs", error);
    } finally {
      setLoading(false);
    }
  }, [gf, filter, setGifs, loading]);

  useEffect(() => {
    // Reset gifs and offset when filter changes
    setGifs([]);
    setOffset(0);
    fetchTrendingGIFs(0); // Fetch GIFs based on the current filter and offset 0
  }, [filter, fetchTrendingGIFs, setGifs]); // Removed setGifs from dependency array as it's stable from context

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const {data} = await gf.trendingSearches();
        setTrendingTerms(data);
      } catch (error) {
        console.error("Failed to fetch trending search terms", error);
      }
    };
    fetchTerms();
  }, [gf]); // gf is a dependency

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.offsetHeight - 100 &&
        !loading
      ) {
        fetchTrendingGIFs(offset);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset, loading, fetchTrendingGIFs]);

  return (
    <div className="">
      <img
        src="/banner.gif"
        alt="earth banner"
        className="mt-2 rounded w-full"
      />

      {/* Display Trending Search Terms */}
      <TrendingSearches terms={trendingTerms} />

      <FilterGif showTrending />

      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
        {gifs.map((gif) => (
          <Gif gif={gif} key={gif.id} />
        ))}
      </div>
    </div>
  );
}

export default Home;
