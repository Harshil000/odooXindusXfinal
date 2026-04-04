import { useNavigate } from "react-router-dom";
import useProducts from "../hook/useProducts";

const ProductList = () => {
  const { products, loading, error, deleteExistingProduct } = useProducts();
  const navigate = useNavigate();

  return (
    <section className="products-list-card">
      {loading ? (
        <p className="empty-state">Loading products...</p>
      ) : error ? (
        <p className="empty-state error">{error}</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products found. Add a new product.</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Tax</th>
              <th>Variants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category_name || "Uncategorized"}</td>
                <td>₹{Number(product.price).toFixed(2)}</td>
                <td>{Number(product.tax_percent || 0).toFixed(2)}%</td>
                <td>{(product.variants || []).length}</td>
                <td>{product.is_active ? "Active" : "Inactive"}</td>
                <td className="products-row-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("new", { state: { product } })}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteExistingProduct(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default ProductList;
