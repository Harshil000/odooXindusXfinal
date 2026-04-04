import { useState } from "react";
import useCategories from "../hook/useCategories";
import "../styles/categories.scss";

const COLOR_OPTIONS = [
  "white",
  "#34d399",
  "#60a5fa",
  "#f97316",
  "#a855f7",
  "#fb7185",
];

const Categories = () => {
  const { categories, loading, error, saving, formError, createNewCategory, deleteExistingCategory } = useCategories();
  const [name, setName] = useState("");
  const [color, setColor] = useState("white");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createNewCategory({ name: name.trim(), color });
    setName("");
    setColor("white");
  };

  return (
    <main className="category-page">
      <div className="category-header">
        <div>
          <h1>Product Category</h1>
          <p>Manage category names and colors for your menu.</p>
        </div>
      </div>

      <section className="category-card">
        <div className="category-form-shell">
          <form className="category-form" onSubmit={handleSubmit}>
            <div className="category-form-field">
              <label>Category Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Add category name"
                required
              />
            </div>

            <div className="category-form-field">
              <label>Color</label>
              <div className="color-picker-grid">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`color-swatch ${color === option ? "selected" : ""}`}
                    style={{ background: option }}
                    onClick={() => setColor(option)}
                  />
                ))}
              </div>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "New Category"}
            </button>
          </form>
        </div>

        <div className="category-list-shell">
          {loading ? (
            <p className="empty-state">Loading categories...</p>
          ) : error ? (
            <p className="empty-state error">{error}</p>
          ) : categories.length === 0 ? (
            <p className="empty-state">No categories yet. Add one above.</p>
          ) : (
            <ul className="category-list">
              {categories.map((category) => (
                <li key={category.id} className="category-row">
                  <div className="category-row-leading">
                    <span className="drag-handle">::</span>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-row-meta">
                    <span
                      className="category-color"
                      style={{ background: category.color || "white" }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => deleteExistingCategory(category.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
};

export default Categories;
