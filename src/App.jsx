import { useEffect, useRef, useState } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [currentImages, setCurrentImages] = useState({});

  const nextImage = (productId, imagesLength) => {
    setCurrentImages((prev) => ({
      ...prev,
      [productId]:
        ((prev[productId] ?? 0) + 1) % imagesLength,
    }));
  };

  const prevImage = (productId, imagesLength) => {
    setCurrentImages((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] ?? 0) === 0
          ? imagesLength - 1
          : prev[productId] - 1,
    }));
  };

  const loaderRef = useRef(null);

  const fetchProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const limit = 10;
      const skip = page * limit;

      const res = await fetch(
        `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
      );

      const data = await res.json();

      setProducts((prev) => [
        ...prev,
        ...data.products,
      ]);

      // Total products from API = data.total
      if (skip + data.products.length >= data.total) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on page change
  useEffect(() => {
    fetchProducts();
  }, [page]);

  // Intersection Observer
  useEffect(() => {
    // First page render hone se pehle observer mat lagao
    if (!products.length) return;

    const handleIntersection = (entries) => {
      const entry = entries[0];

      if (
        !entry.isIntersecting ||
        loading ||
        !hasMore
      ) {
        return;
      }

      setPage((prev) => prev + 1);
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      {
        rootMargin: "200px",
      }
    );

    const currentLoader = loaderRef.current;

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }

      observer.disconnect();
    };
  }, [products, loading, hasMore]);

  return (
    <div className="w-[80%] mx-auto">
      <h1 className="text-3xl font-bold my-6">
        Infinite Scroll (IntersectionObserver)
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => {
          const currentIndex =
            currentImages[product.id] ?? 0;


          return (
            <div
              key={product.id}
              className="border p-4 rounded"
            >
              <div className="relative">
                <img
                  src={product.images[currentIndex]}
                  alt={product.title}
                  className="h-48 w-full object-cover"
                />

                {product.images.length > 1 && <button
                  onClick={() =>
                    prevImage(
                      product.id,
                      product.images.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded"
                >
                  ◀
                </button>}

                {product.images.length > 1 && <button
                  onClick={() =>
                    nextImage(
                      product.id,
                      product.images.length
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded"
                >
                  ▶
                </button>}
              </div>

              <h3 className="font-bold mt-3">
                {product.title}
              </h3>

              <p>{product.description}</p>

              <span
                className={
                  product.stock > 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {product.stock > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </span>
            </div>
          );
        })}
      </div>

      {loading && (
        <h2 className="text-center my-6">
          Loading...
        </h2>
      )}

      {hasMore && (
        <div
          ref={loaderRef}
          className="h-10"
        />
      )}

      {!hasMore && (
        <h2 className="text-center my-6">
          No More Products
        </h2>
      )}
    </div>
  );
}

export default App;