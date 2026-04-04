import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useProducts from "../hook/useProducts";

const VARIANT_UNITS = ["K.G", "Unit", "Liter"];

const ProductForm = () => {
  const {
    categories,
    createNewProduct,
    updateExistingProduct,
    saving,
    formError,
  } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const initialProduct = location.state?.product;

  const [activeTab, setActiveTab] = useState("general");
  const [submitError, setSubmitError] = useState("");
  const [formState, setFormState] = useState(() => ({
    name: initialProduct?.name || "",
    category_id: initialProduct?.category_id || "",
    price: initialProduct?.price || "",
    tax_percent: initialProduct?.tax_percent || 0,
    is_active: initialProduct?.is_active ?? true,
    variants: initialProduct?.variants || [],
  }));

  const isEditMode = Boolean(initialProduct);

  const handleGeneralChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormState((prev) => {
      const variants = [...prev.variants];
      variants[index] = {
        ...variants[index],
        [field]: field === "extra_price" ? Number(value) : value,
      };
      return {
        ...prev,
        variants,
      };
    });
  };

  const addVariantRow = () => {
    setFormState((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { attribute: "", value: "", unit: "Unit", extra_price: 0 },
      ],
    }));
  };

  const removeVariantRow = (index) => {
    setFormState((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const payload = {
      name: formState.name,
      category_id: formState.category_id || null,
      price: Number(formState.price),
      tax_percent: Number(formState.tax_percent),
      is_active: formState.is_active,
      variants: formState.variants.map((variant) => ({
        attribute: variant.attribute?.trim() || "",
        value: variant.value?.trim() || "",
        unit: variant.unit || "Unit",
        extra_price: Number(variant.extra_price) || 0,
      })),
    };

    try {
      if (isEditMode) {
        await updateExistingProduct(initialProduct.id, payload);
      } else {
        await createNewProduct(payload);
      }
      navigate("/products");
    } catch (error) {
      setSubmitError(error?.message || "Could not save product");
    }
  };

  const categoryOptions = useMemo(() => categories || [], [categories]);

  return (
    <section className="product-form-card">
      <div className="card-header">
        <h2>{isEditMode ? "Edit Product" : "New Product"}</h2>
      </div>

      <div className="product-tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          General Info
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "variants" ? "active" : ""}`}
          onClick={() => setActiveTab("variants")}
        >
          Variants
        </button>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        {activeTab === "general" ? (
          <>
            <label>
              Product Name
              <input
                name="name"
                value={formState.name}
                onChange={handleGeneralChange}
                placeholder="Product name"
                required
              />
            </label>

            

            <label>
              Category
              <select
                name="category_id"
                value={formState.category_id || ""}
                onChange={handleGeneralChange}
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formState.price}
                onChange={handleGeneralChange}
                placeholder="0.00"
                required
              />
            </label>

            <label>
              Tax Percent
              <input
                name="tax_percent"
                type="number"
                min="0"
                step="0.01"
                value={formState.tax_percent}
                onChange={handleGeneralChange}
                placeholder="0.00"
              />
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                name="is_active"
                checked={formState.is_active}
                onChange={handleGeneralChange}
              />
              Active
            </label>
          </>
        ) : (
          <div className="variant-panel">
            <div className="variant-table-header">
              <div className="variant-label">Attributes</div>
              <div className="variant-label">Value</div>
              <div className="variant-label">Unit</div>
              <div className="variant-label">Extra Prices</div>
              <div className="variant-label">Actions</div>
            </div>
            {formState.variants.length === 0 ? (
              <p className="empty-state">No variants yet. Add a variant row.</p>
            ) : (
              formState.variants.map((variant, index) => (
                <div className="variant-row" key={`variant-${index}`}>
                  <input
                    value={variant.attribute}
                    onChange={(event) =>
                      handleVariantChange(
                        index,
                        "attribute",
                        event.target.value,
                      )
                    }
                    placeholder="Pack, Size, Flavor"
                  />
                  <input
                    value={variant.value}
                    onChange={(event) =>
                      handleVariantChange(index, "value", event.target.value)
                    }
                    placeholder="6, 12, Small"
                  />
                  <select
                    value={variant.unit}
                    onChange={(event) =>
                      handleVariantChange(index, "unit", event.target.value)
                    }
                  >
                    {VARIANT_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.extra_price}
                    onChange={(event) =>
                      handleVariantChange(
                        index,
                        "extra_price",
                        event.target.value,
                      )
                    }
                    placeholder="0.00"
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeVariantRow(index)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addVariantRow}
            >
              Add Variant
            </button>
          </div>
        )}

        {(formError || submitError) && <div className="form-error">{submitError || formError}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Product"
                : "Create Product"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/products")}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProductForm;
