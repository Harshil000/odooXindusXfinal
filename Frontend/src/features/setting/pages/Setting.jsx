import { useEffect } from "react";
import LayoutForms from "../components/LayoutForms";
import LayoutMetrics from "../components/LayoutMetrics";
import OverviewPanels from "../components/OverviewPanels";
import useRestaurantLayout from "../hook/useRestaurantLayout";
import "../styles/setting.scss";

const Setting = () => {
  const {
    floors,
    tables,
    loading,
    saving,
    error,
    floorName,
    tableForm,
    floorNameById,
    tableCountByFloor,
    totalSeats,
    loadLayout,
    setFloorName,
    setTableField,
    addFloor,
    removeFloor,
    addTable,
    removeTable,
  } = useRestaurantLayout();

	useEffect(() => {
		loadLayout();
	}, [loadLayout]);

	return (
		<main className="setting-page">
			<header className="setting-header">
				<div>
					<h1>Restaurant Layout</h1>
					<p>Create floors and manage your tables with seat capacity and live counts.</p>
				</div>
			</header>

			<LayoutMetrics
				floorCount={floors.length}
				tableCount={tables.length}
				totalSeats={totalSeats}
			/>

			<section className="setting-grid">
				<LayoutForms
					floors={floors}
					floorName={floorName}
					tableForm={tableForm}
					saving={saving}
					error={error}
					onFloorName={setFloorName}
					onTableField={setTableField}
					onAddFloor={addFloor}
					onAddTable={addTable}
				/>

				<OverviewPanels
					floors={floors}
					tables={tables}
					floorNameById={floorNameById}
					tableCountByFloor={tableCountByFloor}
					loading={loading}
					onRemoveFloor={removeFloor}
					onRemoveTable={removeTable}
				/>
			</section>
		</main>
	);
};

export default Setting;
