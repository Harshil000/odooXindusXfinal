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
  const { categories, loading, error, saving, formError, createNewCategory, deleteExistingCategory, updateExistingCategory } = useCategories();
  const [name, setName] = useState("");
  const [color, setColor] = useState("white");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("white");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createNewCategory({ name: name.trim(), color });
    setName("");
    setColor("white");
  };

  const handleEditStart = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color || "white");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("white");
  };

  const handleEditSave = async () => {
    if (!editName.trim()) return;
    const isUpdated = await updateExistingCategory(editingId, {
      name: editName.trim(),
      color: editColor,
    });
    if (isUpdated) {
      handleEditCancel();
    }
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
                    className="btn btn-secondary btn-small"
                    onClick={() => handleEditStart(category)}
                  >
                    Edit
                  </button>
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

      {editingId && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button className="btn-close" onClick={handleEditCancel}>×</button>
            </div>
            <form className="modal-body" onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}>
              <div className="category-form-field">
                <label>Category Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
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
                      className={`color-swatch ${editColor === option ? "selected" : ""}`}
                      style={{ background: option }}
                      onClick={() => setEditColor(option)}
                    />
                  ))}
                </div>
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleEditCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Categories;
