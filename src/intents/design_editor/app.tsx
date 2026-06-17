import React from "react";
import * as styles from "styles/components.css";
import { PropertyFetcherPage } from "../../pages/property_fetcher_page/property_fetcher_page";

export function App() {
  return (
    <div className={styles.scrollContainer}>
      <PropertyFetcherPage />
    </div>
  );
}

