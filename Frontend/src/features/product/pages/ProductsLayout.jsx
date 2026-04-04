import { NavLink, Outlet } from "react-router-dom";
import "../styles/products.scss";

const ProductsLayout = () => {
  return (
    <main className="products-page">
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your restaurant’s products, prices, tax, and categories.</p>
        </div>
        <nav className="products-tabs">
          <NavLink to="." end className="tab-link">
            Product List
          </NavLink>
          <NavLink to="new" className="tab-link">
            Add Product
          </NavLink>
          <NavLink to="categories" className="tab-link">
            Categories
          </NavLink>
        </nav>
      </div>

      <Outlet />
    </main>
  );
};

export default ProductsLayout;
