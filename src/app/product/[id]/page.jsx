export const unstable_instant = {
  prefetch: 'static',
  samples: [
    {
      params: { id: "1" }
    }
  ]
};

import { Suspense } from "react";
import ProductDetailsClient from "./ProductDetailsClient";

export default function ProductDetailsPage({ params }) {
  return (
    <Suspense fallback={
      <div className="product-details-loading">
        <div className="spinner"></div>
        <p>Retrieving design specifications...</p>
      </div>
    }>
      {params.then(({ id }) => (
        <ProductDetailsClient id={id} />
      ))}
    </Suspense>
  );
}
