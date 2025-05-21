import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {GifState} from "../context/gif-context";
import GifSearch from "./gif-search";
import {Link} from "react-router-dom";
import {HiEllipsisVertical, HiMiniBars3BottomRight} from "react-icons/hi2";

const Header = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  const {gf, filter, setFilter, favorites} = GifState();

  const fetchGifCategories = async () => {
    try {
      const {data} = await gf.categories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch GIF categories from API", error);
    }
  };

  useEffect(() => {
    fetchGifCategories();
  }, []);

  const handleRandomGifClick = async () => {
    setIsRandomLoading(true);
    try {
      const {data: randomGif} = await gf.random({
        type: filter, // 'gifs' or 'stickers'
        tag: filter === "stickers" ? undefined : "random", // API requires tag for 'gifs', optional for 'stickers'
        rating: "g",
      });

      if (!randomGif || !randomGif.id) {
        // The API response for random might have 'image_original_url' or similar, but 'id' is crucial for navigation
        throw new Error("Invalid random GIF data received from API. Missing ID.");
      }

      // Determine navigation type based on current filter, ensuring it matches route structure (e.g., plural 'gifs', 'stickers')
      // The randomGif.type from API might be singular 'gif'. We use our app's 'filter' which is plural.
      const navType = filter; // filter is already 'gifs' or 'stickers'
      navigate(`/${navType}/${randomGif.id}`);
    } catch (error) {
      console.error("Error fetching or navigating to random GIF:", error);
      // TODO: Optionally, display a user-friendly error message on the UI
    } finally {
      setIsRandomLoading(false);
      // Ensure categories dropdown is closed if the random button was clicked from there
      // setShowCategories(false); // This might be too aggressive if button is also outside dropdown
    }
  };

  return (
    <nav>
      <div className="relative flex gap-4 justify-between items-center mb-2">
        <Link to={"/"} className="flex gap-2">
          <img src="/logo.svg" alt="Giphy Logo" className="w-8" />
          <h1 className="text-5xl font-bold tracking-tight cursor-pointer">
            GIPHY
          </h1>
        </Link>

        <div className="font-bold text-md flex gap-2 items-center">
          {categories?.slice(0, 5).map((category) => {
            return (
              <Link
                className="px-4 py-1 transition ease-in-out hover:gradient border-b-4 hidden lg:block"
                key={category.name}
                to={`/${category.name_encoded}`}
              >
                {category.name}
              </Link>
            );
          })}

          <button onClick={() => setShowCategories(!showCategories)}>
            <HiEllipsisVertical
              size={35}
              className={`py-0.5 transition ease-in-out hover:gradient ${
                showCategories ? "gradient" : ""
              } border-b-4 cursor-pointer hidden lg:block`}
            />
          </button>

          <button
            onClick={handleRandomGifClick}
            className="px-4 py-1 transition ease-in-out hover:gradient border-b-4 hidden lg:block font-bold"
            disabled={isRandomLoading}
          >
            {isRandomLoading ? "Loading..." : "Random GIF"}
          </button>

          {favorites.length > 0 && (
            <div className="h-9 bg-gray-700 pt-1.5 px-6 cursor-pointer rounded">
              <Link to="/favorites">Favorite GIFs</Link>
            </div>
          )}

          {/* -- Mobile UI -- */}
          <button onClick={() => setShowCategories(!showCategories)}>
            <HiMiniBars3BottomRight
              className="text-sky-400 block lg:hidden"
              size={30}
            />
          </button>
          {/* -- Mobile UI -- */}
        </div>

        {showCategories && (
          <div className="absolute right-0 top-14 px-10 pt-6 pb-9 w-full gradient z-20">
            <span className="text-3xl font-extrabold">Categories</span>
            <hr className="bg-gray-100 opacity-50 my-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {categories?.map((category) => {
                return (
                  <Link
                    onClick={() => {
                      setShowCategories(false);
                    }}
                    className="transition ease-in-out font-bold"
                    key={category.name}
                    to={`/${category.name_encoded}`}
                  >
                    {category.name}
                  </Link>
                );
              })}
              {/* Adding Random GIF button for mobile menu as well */}
              <button
                onClick={async () => {
                  setShowCategories(false); // Close dropdown first
                  await handleRandomGifClick(); // Then fetch and navigate
                }}
                className="transition ease-in-out font-bold text-left"
                disabled={isRandomLoading}
              >
                {isRandomLoading ? "Loading..." : "Random GIF"}
              </button>
            </div>
          </div>
        )}
      </div>
      <GifSearch filter={filter} setFilter={setFilter} />
    </nav>
  );
};

export default Header;
