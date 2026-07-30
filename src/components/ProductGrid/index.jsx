import CardProduct from "@/components/CardProduct";
import Pagination from "@/components/Pagination";

const ProductGrid = ({ products = [], pagination, category }) => {
  if (!products.length) {
    return (
      <section className="lg:col-span-3">
        <div className="rounded-2xl border border-[#DDECE9] bg-[#F4FAF8] px-6 py-12 text-center text-gray-600">
          No products match the selected filters.
        </div>
      </section>
    );
  }

  return (
    <section className="lg:col-span-3">
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((item) => (
          <CardProduct category={category} key={item.id} item={item} />
        ))}
      </div>

      {/* PAGINATION */}
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
        />
      )}
    </section>
  );
};

export default ProductGrid;
