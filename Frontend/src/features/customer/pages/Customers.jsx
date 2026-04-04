import { useEffect, useMemo, useState } from "react";
import useCustomers from "../hook/useCustomers";
import "../styles/customers.scss";

const Customer = ({ customer, onSelect }) => (
  <tr onClick={() => onSelect(customer)}>
    <td>{customer.name}</td>
    <td>{customer.email || "-"}</td>
    <td>{customer.phone || "-"}</td>
    <td>{new Date(customer.created_at).toLocaleDateString("en-IN")}</td>
  </tr>
);

const Customers = () => {
  const {
    customers,
    selectedCustomer,
    loading,
    saving,
    error,
    formError,
    selectCustomer,
    createNewCustomer,
    updateExistingCustomer,
    deleteExistingCustomer,
  } = useCustomers();

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const isEditMode = Boolean(selectedCustomer);

  useEffect(() => {
    if (selectedCustomer) {
      setFormState({
        name: selectedCustomer.name || "",
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || "",
      });
    } else {
      setFormState({ name: "", email: "", phone: "" });
    }
  }, [selectedCustomer]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.name) return;

    if (isEditMode) {
      await updateExistingCustomer(selectedCustomer.id, formState);
    } else {
      await createNewCustomer(formState);
      setFormState({ name: "", email: "", phone: "" });
    }
  };

  const selectedCustomerDetails = useMemo(
    () => selectedCustomer || {},
    [selectedCustomer],
  );

  return (
    <main className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <p>Manage your restaurant customers from the connected table.</p>
      </div>

      <div className="customers-grid">
        <section className="customers-list-card">
          <div className="card-header">
            <h2>Customer List</h2>
            <span>{customers.length} customers</span>
          </div>

          {loading ? (
            <div className="empty-state">Loading customer list...</div>
          ) : error ? (
            <div className="empty-state error">{error}</div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              No customers yet. Add one using the form.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <Customer
                      key={customer.id}
                      customer={customer}
                      onSelect={selectCustomer}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="customer-form-card">
          <div className="card-header">
            <h2>{isEditMode ? "Edit Customer" : "New Customer"}</h2>
          </div>

          <form className="customer-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Customer name"
                required
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
              />
            </label>

            {formError && <div className="form-error">{formError}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Update Customer"
                    : "Add Customer"}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFormState({ name: "", email: "", phone: "" });
                    selectCustomer(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {isEditMode && selectedCustomerDetails.id && (
            <div className="selected-detail">
              <h3>Selected Customer</h3>
              <p>
                <strong>Name:</strong> {selectedCustomerDetails.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedCustomerDetails.email || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCustomerDetails.phone || "-"}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Customers;
