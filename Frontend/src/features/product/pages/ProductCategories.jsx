import { useState } from "react";
import useProducts from "../hook/useProducts";

const COLOR_PRESETS = [
  "#8b6f4e",
  "#34d399",
  "#60a5fa",
  "#f97316",
  "#a855f7",
  "#fb7185",
  "#111827",
];

const ProductCategories = () => {
  const { categories, createNewCategory, saving, formError } = useProducts();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#8b6f4e");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !color.trim()) return;
    await createNewCategory({ name: name.trim(), color: color.trim() });
    setName("");
    setColor("#8b6f4e");
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

        <label>
          Category Color
          <div className="color-input-row">
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              aria-label="Category color"
            />
            <input
              className="color-hex-input"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="#8b6f4e"
              required
            />
          </div>
        </label>

        <div className="color-preset-grid" aria-label="Color presets">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`color-preset ${color === preset ? "selected" : ""}`}
              style={{ background: preset }}
              onClick={() => setColor(preset)}
              aria-label={`Select color ${preset}`}
            />
          ))}
        </div>

        <div className="color-preview-row">
          <span className="color-preview" style={{ background: color }} />
          <span className="color-preview-text">Selected: {color}</span>
        </div>
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
              <li key={category.id} className="category-list-item">
                <span className="category-list-swatch" style={{ background: category.color || "#ffffff" }} />
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ProductCategories;
