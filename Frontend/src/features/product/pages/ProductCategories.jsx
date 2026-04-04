import { useState } from "react";
import useProducts from "../hook/useProducts";

const ProductCategories = () => {
  const { categories, createNewCategory, saving, formError } = useProducts();
  const [name, setName] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createNewCategory({ name: name.trim() });
    setName("");
  };

  return (
    <section className="product-categories-card">
      <div className="card-header">
        <h2>Product Categories</h2>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          Category Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Beverages"
            required
          />
        </label>
        {formError && <div className="form-error">{formError}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Add Category"}
          </button>
        </div>
      </form>

      <div className="category-list">
        {categories.length === 0 ? (
          <p className="empty-state">No categories available yet.</p>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ProductCategories;
