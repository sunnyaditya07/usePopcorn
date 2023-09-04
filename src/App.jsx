import { useEffect, useState } from "react";
import Navbar, { NumResults, Search } from "./components/Navbar";
import Main from "./components/Main";
import SearchMovieList from "./components/SearchMovieList";
import WatchedSummary, { WatchedMoviesList } from "./components/WatchedSummary";
import Loader from "./components/Loader";
import Error from "./components/Error";
import MovieDetails from "./components/MovieDetails";
import Box from "./components/Box";

const KEY = "f84fc31d";

export default function App() {
  const [watched, setWatched] = useState([]);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const tempQuery = "interjkdvj";

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((movie) => watched.filter((movie) => movie.imdbID !== id));
  }
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong while fetching movie");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <SearchMovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <SearchMovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
            />
          )}
          {error && <Error message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
